(() => {
  if (window.__ml_enviocv_init__) return;
  window.__ml_enviocv_init__ = true;

  const JOBS_STORAGE = "mapslink:vagas";
  const APPLICATION_PREFIX = "mapslink:applications";
  const APPLIED_PREFIX = "mapslink_envio_aplicado";
  const EMPTY_IMAGE =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const ACCENTS = /[\u0300-\u036f]/g;

  const dom = {
    root: document.getElementById("envio-cv"),
    avatar: document.querySelector("[data-company-avatar]"),
    name: document.querySelector("[data-company-name]"),
    caption: document.querySelector("[data-company-caption]"),
    search: document.querySelector('[data-search-input]'),
    count: document.getElementById("result-count"),
    tbody: document.getElementById("lista-vagas-disponiveis")
  };

  if (!dom.root || !dom.tbody) return;

  const state = {
    owner: null,
    jobs: [],
    applications: [],
    filtered: [],
    applied: new Set(),
    searchTerm: "",
    liveRegion: null
  };

  function ensureLiveRegion() {
    if (state.liveRegion) return;
    const region = document.createElement("div");
    region.className = "sr-only";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    document.body.appendChild(region);
    state.liveRegion = region;
  }

  function announce(message) {
    if (!state.liveRegion) return;
    state.liveRegion.textContent = "";
    window.setTimeout(() => {
      state.liveRegion.textContent = message;
    }, 30);
  }

  function normalize(value) {
    return (value || "")
      .toString()
      .normalize("NFD")
      .replace(ACCENTS, "")
      .toLowerCase();
  }

  function storageKey(owner) {
    return owner ? `${JOBS_STORAGE}:${owner}` : null;
  }

  function appliedKey(owner) {
    return owner ? `${APPLIED_PREFIX}:${owner}` : `${APPLIED_PREFIX}:anon`;
  }

  function loadJobs(owner) {
    const key = storageKey(owner);
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      return list
        .slice()
        .sort((a, b) =>
          new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
        );
    } catch {
      return [];
    }
  }

  function applicationsKey(owner = state.owner) {
    return owner ? `${APPLICATION_PREFIX}:${owner}` : `${APPLICATION_PREFIX}:anonimo`;
  }

  function loadApplications(owner = state.owner) {
    const key = applicationsKey(owner);
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function saveApplications(list) {
    const key = applicationsKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
  }

  function loadApplied(owner) {
    try {
      const raw = localStorage.getItem(appliedKey(owner));
      if (!raw) return new Set();
      const list = JSON.parse(raw);
      return new Set(Array.isArray(list) ? list : []);
    } catch {
      return new Set();
    }
  }

  function saveApplied() {
    try {
      localStorage.setItem(appliedKey(state.owner), JSON.stringify(Array.from(state.applied)));
    } catch {}
  }

  function applyAvatar(src) {
    if (!dom.avatar) return;
    const has = !!src;
    dom.avatar.src = has ? src : EMPTY_IMAGE;
    dom.avatar.alt = has ? "Logo da empresa" : "";
    const badge = dom.avatar.closest(".avatar-badge");
    if (badge) badge.classList.toggle("is-empty", !has);
  }

  function setCompanyInfo(session) {
    const name = session?.company || session?.name || "Nome da empresa";
    const caption =
      session?.profile?.caption || "Veja a disponibilidade de vaga!";
    if (dom.name) dom.name.textContent = name;
    if (dom.caption) dom.caption.textContent = caption;
  }

  function setCount(value) {
    if (!dom.count) return;
    const label = value === 1 ? "resultado" : "resultados";
    dom.count.textContent = `${value} ${label}`;
  }

  function escapeHtml(text) {
    return String(text || "").replace(/[&<>"']/g, chr => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[chr] || chr;
    });
  }

  function createButton(job, disabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-primary btn-small prestar-vaga";
    button.dataset.applyId = job.id || "";
    button.dataset.jobTitle = job.title || "Vaga";
    button.dataset.jobId = job.id || "";
    button.dataset.jobArea = job.area || "";
    button.dataset.jobType = job.type || "";
    if (disabled) {
      button.disabled = true;
      button.innerHTML = '<i class="ri-lock-line" aria-hidden="true"></i> Encerrada';
      return button;
    }
    if (state.applied.has(job.id)) {
      button.disabled = true;
      button.classList.add("btn-prestado");
      button.innerHTML = '<i class="ri-check-line" aria-hidden="true"></i> Aplicado';
      button.setAttribute("aria-pressed", "true");
    } else {
      button.disabled = false;
      button.classList.remove("btn-prestado");
      button.innerHTML = '<i class="ri-send-plane-2-line" aria-hidden="true"></i> Prestar Vaga';
      button.setAttribute("aria-pressed", "false");
    }
    return button;
  }

  function recordApplication(job) {
    if (!state.owner || !job) return;
    const viewer = window.MapsAuth?.current?.();
    const candidateName =
      viewer && viewer.type === "personal"
        ? viewer.name || viewer.email || "Candidato"
        : "Candidato";
    const candidateAvatar =
      viewer && viewer.type === "personal" ? viewer.profile?.avatar || "" : "";
    const entry = {
      id: `app_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      jobId: job.id || null,
      title: job.title || "Vaga",
      area: job.area || "",
      type: job.type || "",
      appliedAt: new Date().toISOString(),
      status: "Em análise",
      candidate: candidateName,
      avatar: candidateAvatar
    };
    const applications = loadApplications();
    applications.push(entry);
    saveApplications(applications);
    state.applications = applications;
    try {
      localStorage.setItem("mapslink_curriculos_recebidos", JSON.stringify(applications.length));
    } catch {}
    if (window.MapsLink?.setCurriculos) {
      try {
        window.MapsLink.setCurriculos(applications.length);
      } catch {}
    }
  }

  function buildRow(job) {
    const tr = document.createElement("tr");
    const area = escapeHtml(job.area || "--");
    const type = escapeHtml(job.type || job.status || "--");
    const isClosed = normalize(job.status).includes("fech") || normalize(job.status).includes("encerr");

    tr.innerHTML = `
      <td><span class="cell-text">${escapeHtml(job.title || "Vaga")}</span></td>
      <td>${area || "--"}</td>
      <td>${type || "--"}</td>
      <td></td>
    `;
    const actionsCell = tr.lastElementChild;
    actionsCell.appendChild(createButton(job, isClosed));
    return tr;
  }

  function renderJobs(list) {
    dom.tbody.innerHTML = "";
    if (!list.length) {
      const row = document.createElement("tr");
      row.className = "tbl-empty";
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.textContent = dom.tbody.dataset.emptyText || "Nenhuma vaga disponível no momento.";
      row.appendChild(cell);
      dom.tbody.appendChild(row);
      setCount(0);
      return;
    }
    list.forEach(job => dom.tbody.appendChild(buildRow(job)));
    setCount(list.length);
  }

  function filterJobs(term) {
    const normalizedTerm = normalize(term);
    if (!normalizedTerm) {
      state.filtered = state.jobs.slice();
      return;
    }
    state.filtered = state.jobs.filter(job => {
      return [job.title, job.area, job.type, job.description]
        .some(field => normalize(field).includes(normalizedTerm));
    });
  }

  function handleSearch(event) {
    state.searchTerm = event.target.value || "";
    filterJobs(state.searchTerm);
    renderJobs(state.filtered);
  }

  function handleApply(event) {
    const button = event.target.closest("[data-apply-id]");
    if (!button || button.disabled) return;
    const id = button.dataset.applyId;
    if (!id) return;
    state.applied.add(id);
    saveApplied();
    button.disabled = true;
    button.classList.add("btn-prestado");
    button.innerHTML = '<i class="ri-check-line" aria-hidden="true"></i> Aplicado';
    button.setAttribute("aria-pressed", "true");
    announce(`Candidatura enviada para ${button.dataset.jobTitle || "a vaga"}.`);
    recordApplication({
      id: button.dataset.jobId || id,
      title: button.dataset.jobTitle || "Vaga",
      area: button.dataset.jobArea || "",
      type: button.dataset.jobType || ""
    });
  }

  function hydrate(session) {
    state.owner = session?.id || null;
    applyAvatar(session?.profile?.avatar || "");
    setCompanyInfo(session);
    state.jobs = loadJobs(state.owner);
    state.applied = loadApplied(state.owner);
    state.applications = loadApplications(state.owner);
    filterJobs(state.searchTerm);
    renderJobs(state.filtered);
  }

  function initAuth() {
    const auth = window.MapsAuth;
    if (!auth) {
      hydrate(null);
      return;
    }
    const refresh = () => hydrate(auth.current ? auth.current() : null);
    if (typeof auth.ready === "function") {
      auth.ready().then(refresh).catch(() => hydrate(null));
    } else {
      refresh();
    }
    if (typeof auth.onSession === "function") auth.onSession(hydrate);
  }

  function init() {
    ensureLiveRegion();
    dom.tbody.addEventListener("click", handleApply);
    if (dom.search) dom.search.addEventListener("input", handleSearch);
    initAuth();
  }

  init();
})();
