const token = localStorage.getItem("jwt_token");
if (!token) {
  window.location.href = "loginempresa.html"; 
}

(() => {
  if (window.__ml_vagas_init__) return;
  window.__ml_vagas_init__ = true;

  const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const STORAGE_PREFIX = "mapslink:vagas";
  const DEFAULT_EMPTY = "Nenhuma vaga cadastrada ainda.";

  const state = {
    owner: null,
    jobs: [],
    companyMeta: null,
    unsyncedJobs: [],
    pendingRemovals: new Set()
  };

  const dom = {
    form: null,
    tbody: null,
    avatar: null,
    companyMeta: null
  };

  function initDom() {
    dom.form = document.getElementById("form-vaga");
    dom.tbody = document.querySelector(".table-cv tbody");
    dom.avatar = document.querySelector(".page-header .avatar-badge img");
    ensureCompanyMeta();
    if (dom.tbody && !dom.tbody.dataset.emptyText) dom.tbody.dataset.emptyText = DEFAULT_EMPTY;
  }

  function ensureCompanyMeta() {
    if (dom.companyMeta && dom.companyMeta.isConnected) return dom.companyMeta;
    const wrap = document.querySelector(".page-title-wrap");
    if (!wrap) return null;
    let container = wrap.querySelector(".page-title-text");
    if (!container) {
      container = document.createElement("div");
      container.className = "page-title-text";
      const heading = wrap.querySelector("#titulo-vagas");
      if (heading) {
        wrap.insertBefore(container, heading);
        container.appendChild(heading);
      } else {
        wrap.appendChild(container);
      }
    }
    let meta = container.querySelector(".page-title-meta");
    if (!meta) {
      meta = document.createElement("p");
      meta.className = "page-title-meta";
      meta.setAttribute("aria-live", "polite");
      container.appendChild(meta);
    }
    dom.companyMeta = meta;
    return meta;
  }

  function setCompanyName(value) {
    const node = ensureCompanyMeta();
    if (!node) return;
    const text = (value || "").trim();
    node.textContent = text || "Sincronizado com o perfil da empresa";
    node.classList.toggle("is-placeholder", !text);
  }

  function setAvatar(src) {
    if (!dom.avatar) return;
    const wrapper = dom.avatar.closest(".avatar-badge");
    if (src) {
      dom.avatar.src = src;
      dom.avatar.alt = "Logo ou foto da empresa";
      if (wrapper) wrapper.classList.remove("is-empty");
    } else {
      dom.avatar.src = EMPTY_IMAGE;
      dom.avatar.alt = "Logo padrão da empresa";
      if (wrapper) wrapper.classList.add("is-empty");
    }
  }

  function storageKey(owner = state.owner) {
    return owner ? `${STORAGE_PREFIX}:${owner}` : `${STORAGE_PREFIX}:anonimo`;
  }

  function loadJobs(owner = state.owner) {
    if (window.MapsJobsStore?.loadOwner) {
      return window.MapsJobsStore.loadOwner(owner);
    }
    try {
      const raw = localStorage.getItem(storageKey(owner));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persistJobs() {
    if (!state.owner) return;
    if (window.MapsJobsStore?.saveOwner) {
      window.MapsJobsStore.saveOwner(state.owner, state.jobs);
    } else {
      try {
        const key = storageKey();
        if (!state.jobs.length) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(state.jobs));
      } catch {}
    }
    syncPublicJobs();
  }

  function syncPublicJobs() {
    if (!state.owner || !state.companyMeta) return;
    if (window.MapsJobsStore?.syncOwner) {
      window.MapsJobsStore.syncOwner(state.owner, state.companyMeta, state.jobs);
    }
  }

  function safe(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "--/--/----";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function createRow(job) {
    const tr = document.createElement("tr");
    tr.dataset.jobId = job.id;
    const status = (job.status || "Aberta").trim();
    const statusClass = status.toLowerCase().includes("fech") ? "status status-fechada" : "status status-aberta";
    tr.innerHTML = `
      <td><span class="cell-text">${safe(job.title)}</span></td>
      <td>${safe(job.area)}</td>
      <td>${safe(job.type)}</td>
      <td><time datetime="${safe(job.publishedAt)}">${formatDate(job.publishedAt)}</time></td>
      <td><span class="${statusClass}">${safe(status)}</span></td>
      <td><button type="button" class="job-action" data-action="remove" data-id="${safe(job.id)}">Remover</button></td>
    `;
    return tr;
  }

  function renderJobs() {
    if (!dom.tbody) return;
    dom.tbody.innerHTML = "";
    if (!state.jobs.length) {
      const row = document.createElement("tr");
      row.className = "empty-row";
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.textContent = dom.tbody.dataset.emptyText || DEFAULT_EMPTY;
      row.appendChild(cell);
      dom.tbody.appendChild(row);
      return;
    }
    state.jobs.forEach(job => dom.tbody.appendChild(createRow(job)));
  }

  function createJobId() {
    return `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  function handleFormSubmit(event) {
    if (!dom.form) return;
    event.preventDefault();
    const formData = new FormData(dom.form);
    const job = {
      id: createJobId(),
      title: (formData.get("titulo") || "").trim(),
      area: (formData.get("area") || "").trim(),
      description: (formData.get("descricao") || "").trim(),
      type: (formData.get("tipo") || "").trim(),
      status: "Aberta",
      publishedAt: new Date().toISOString()
    };
    if (!job.title || !job.area || !job.type) return;
    state.jobs = [job, ...state.jobs];
    if (state.owner) {
      persistJobs();
    } else {
      state.unsyncedJobs = [job, ...state.unsyncedJobs];
    }
    renderJobs();
    dom.form.reset();
    const firstInput = dom.form.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  function handleTableClick(event) {
    const action = event.target.closest("[data-action=\"remove\"]");
    if (!action) return;
    const id = action.getAttribute("data-id");
    if (!id) return;
    const next = state.jobs.filter(job => job.id !== id);
    if (next.length === state.jobs.length) return;
    state.jobs = next;
    if (state.owner) {
      persistJobs();
    } else {
      state.pendingRemovals.add(id);
      state.unsyncedJobs = state.unsyncedJobs.filter(job => job.id !== id);
    }
    renderJobs();
  }

  function bindEvents() {
    if (dom.form && !dom.form.dataset.bound) {
      dom.form.addEventListener("submit", handleFormSubmit);
      dom.form.dataset.bound = "true";
    }
    if (dom.tbody && !dom.tbody.dataset.bound) {
      dom.tbody.addEventListener("click", handleTableClick);
      dom.tbody.dataset.bound = "true";
    }
  }

  function deriveCompanyMeta(session) {
    const profile = session?.profile || {};
    const location = profile.location && typeof profile.location === "object" ? profile.location : {};
    const contact = profile.contact && typeof profile.contact === "object" ? profile.contact : {};
    const fallback = profile.headquarters || contact.address || "";
    const fallbackParts = fallback.split(/[-,]/).map(part => part.trim()).filter(Boolean);
    return {
      id: session?.id || null,
      name: session?.company || session?.name || "Empresa",
      avatar: profile.avatar || "",
      city: location.city || location.town || fallbackParts[0] || "",
      state: location.state || location.region || fallbackParts[1] || ""
    };
  }

  function hydrateFromAuth(session) {
    const profile = session?.profile || {};
    const nextOwner = session?.id || null;
    const ownerChanged = nextOwner !== state.owner;
    state.owner = nextOwner;
    state.companyMeta = deriveCompanyMeta(session);
    setAvatar(profile.avatar || "");
    setCompanyName(session?.company || session?.name || "");
    let didSync = false;
    if (ownerChanged) {
      const pendingAdds = state.unsyncedJobs.slice();
      const pendingRemovals = new Set(state.pendingRemovals);
      state.unsyncedJobs = [];
      state.pendingRemovals.clear();
      let existing = loadJobs();
      if (pendingRemovals.size) {
        existing = existing.filter(job => !pendingRemovals.has(job.id));
      }
      const additions = pendingAdds.filter(job => !pendingRemovals.has(job.id));
      state.jobs = additions.length ? [...additions, ...existing] : existing;
      renderJobs();
      if (additions.length || pendingRemovals.size) {
        persistJobs();
        didSync = true;
      } else {
        syncPublicJobs();
        didSync = true;
      }
    } else if (state.owner && state.unsyncedJobs.length) {
      state.unsyncedJobs = [];
      persistJobs();
      didSync = true;
    } else if (state.owner && state.pendingRemovals.size) {
      const removalIds = Array.from(state.pendingRemovals);
      state.pendingRemovals.clear();
      const beforeLength = state.jobs.length;
      state.jobs = state.jobs.filter(job => !removalIds.includes(job.id));
      if (state.jobs.length !== beforeLength) {
        renderJobs();
        persistJobs();
        didSync = true;
      }
    }
    if (!didSync && state.owner && state.jobs.length) {
      syncPublicJobs();
    }
  }

  function initAuth() {
    const auth = window.MapsAuth;
    if (!auth) {
      hydrateFromAuth(null);
      return;
    }
    hydrateFromAuth(auth.current ? auth.current() : null);
    if (typeof auth.ready === "function") {
      auth.ready()
        .then(() => hydrateFromAuth(auth.current ? auth.current() : null))
        .catch(() => hydrateFromAuth(null));
    }
    if (typeof auth.onSession === "function") auth.onSession(hydrateFromAuth);
  }

  async function loadCompanies() {
    if (Array.isArray(window.__companies) && window.__companies.length) return window.__companies;
    const response = await fetch("/assets/data/companies.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar companies.json");
    const data = await response.json();
    window.__companies = Array.isArray(data) ? data : [];
    return window.__companies;
  }

  function collectJobs(list) {
    window.__jobs = [];
    list.forEach(company => {
      (company.jobs || []).forEach(job => {
        window.__jobs.push({
          ...job,
          company: company.name,
          city: company.city,
          sector: company.sector
        });
      });
    });
  }

  function filterJobs(filters) {
    if (!window.MapsFilters || typeof window.MapsFilters.filterCompanies !== "function") return [];
    const companies = window.MapsFilters.filterCompanies(window.__companies || [], filters);
    return companies.flatMap(company =>
      (company.jobs || []).map(job => ({
        ...job,
        company: company.name,
        city: company.city,
        sector: company.sector
      }))
    );
  }

  async function bootstrapFilters() {
    try {
      const companies = await loadCompanies();
      collectJobs(companies);
      window.filterJobs = filterJobs;
    } catch (error) {
      console.warn("Erro ao carregar jobs:", error);
    }
  }

  function init() {
    initDom();
    setAvatar("");
    setCompanyName("");
    renderJobs();
    bindEvents();
    initAuth();
    bootstrapFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
