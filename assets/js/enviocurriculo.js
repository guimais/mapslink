const token = localStorage.getItem("jwt_token");
if (!token) {
  window.location.href = "loginpessoal.html"; 
}

(() => {
  if (window.__ml_enviocv_init__) return;
  window.__ml_enviocv_init__ = true;

  const JOBS_STORAGE = "mapslink:vagas";
  const APPLICATION_PREFIX = "mapslink:applications";
  const APPLIED_PREFIX = "mapslink_envio_aplicado";
  const EMPTY_IMAGE =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const JobsStore = window.MapsJobsStore || null;
  const PUBLIC_JOBS_KEY = JobsStore?.publicKey || `${JOBS_STORAGE}:public`;
  const JOBS_EVENT = JobsStore?.event || "mapslink:jobs-updated";
  const CV_STORAGE_KEY = "mapslink:perfil:curriculo_pdf";
  const { normalizeText } = window.MapsUtils || {};

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
    liveRegion: null,
    jobOwners: new Map()
  };

  function getCurrentSession() {
    const auth = window.MapsAuth;
    if (!auth || typeof auth.current !== "function") return null;
    try {
      return auth.current();
    } catch {
      return null;
    }
  }

  function primeCandidateSession() {
    if (state.owner) return state.owner;
    const session = getCurrentSession();
    if (!session?.id) return null;
    state.owner = session.id;
    state.applied = loadApplied(state.owner);
    state.applications = loadApplications(state.owner);
    applyAvatar(session?.profile?.avatar || "");
    setCompanyInfo(session);
    return state.owner;
  }

  function normalizeKey(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim().toLowerCase();
  }

  function jobButtonKey(job) {
    return job?.publicId || job?.id || `${job?.title || "vaga"}-${job?.area || ""}`;
  }

  function rememberJobOwner(job) {
    if (!job) return "";
    const owner = (job.ownerId || job.owner || "").toString().trim();
    if (!owner) return "";
    const composite = normalizeKey(`${job.title || ""}|${job.companyName || job.company || ""}`);
    [job.id, job.publicId, jobButtonKey(job), composite].forEach(key => {
      const normalized = normalizeKey(key);
      if (normalized) state.jobOwners.set(normalized, owner);
    });
    return owner;
  }

  function indexJobOwners(list) {
    state.jobOwners.clear();
    (list || []).forEach(rememberJobOwner);
  }

  function resolveOwnerId(job, fallbackKey) {
    if (!job) return "";
    if (job.ownerId) return job.ownerId;
    const candidates = [
      job.publicId,
      job.id,
      fallbackKey,
      `${job.title || ""}|${job.companyName || job.company || ""}`
    ];
    for (const key of candidates) {
      const normalized = normalizeKey(key);
      if (normalized && state.jobOwners.has(normalized)) {
        return state.jobOwners.get(normalized);
      }
    }
    if (window.MapsJobsStore?.loadPublic) {
      const catalog = window.MapsJobsStore.loadPublic();
      const match = (catalog || []).find(entry => {
        return candidates.some(key => {
          if (!key) return false;
          return entry.id === key || entry.publicId === key;
        });
      });
      if (match) return rememberJobOwner(match);
    }
    return "";
  }

  function findJobByKey(key) {
    const normalized = normalizeKey(key);
    if (!normalized) return null;
    return (
      state.jobs.find(job => {
        return (
          normalizeKey(job.id) === normalized ||
          normalizeKey(job.publicId) === normalized ||
          normalizeKey(jobButtonKey(job)) === normalized
        );
      }) || null
    );
  }

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

  function appliedKey(owner) {
    return owner ? `${APPLIED_PREFIX}:${owner}` : `${APPLIED_PREFIX}:anon`;
  }
  function legacyCollectJobs() {
    const jobs = [];
    try {
      const total = window.localStorage?.length ?? 0;
      for (let index = 0; index < total; index += 1) {
        const key = window.localStorage.key(index);
        if (!key || !key.startsWith(`${JOBS_STORAGE}:`) || key === PUBLIC_JOBS_KEY) continue;
        const raw = window.localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) jobs.push(...parsed);
      }
    } catch {}
    return jobs;
  }

  function loadPublicJobs() {
    const source = JobsStore?.loadPublic ? JobsStore.loadPublic() : legacyCollectJobs();
    return source
      .slice()
      .sort(
        (a, b) =>
          (Date.parse(b?.publishedAt || b?.createdAt || 0) || 0) -
          (Date.parse(a?.publishedAt || a?.createdAt || 0) || 0)
      );
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
      if (!Array.isArray(list)) return [];
      return list
        .slice()
        .sort(
          (a, b) =>
            (Date.parse(b?.appliedAt || b?.createdAt || 0) || 0) -
            (Date.parse(a?.appliedAt || a?.createdAt || 0) || 0)
        );
    } catch {
      return [];
    }
  }

  function saveApplications(list, owner = state.owner) {
    const key = applicationsKey(owner);
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
    const jobKey = jobButtonKey(job);
    const ownerId = resolveOwnerId(job, jobKey);
    button.dataset.applyId = jobKey;
    button.dataset.jobTitle = job.title || "Vaga";
    button.dataset.jobId = job.id || jobKey;
    button.dataset.jobPublicId = job.publicId || "";
    button.dataset.jobArea = job.area || "";
    button.dataset.jobType = job.type || "";
    button.dataset.jobCompany = job.companyName || job.company || "";
    button.dataset.jobOwner = ownerId || "";
    if (disabled) {
      button.disabled = true;
      button.innerHTML = '<i class="ri-lock-line" aria-hidden="true"></i> Encerrada';
      return button;
    }
    if (state.applied.has(jobKey)) {
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

  function loadCandidateCv() {
    try {
      const raw = localStorage.getItem(CV_STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (!data || typeof data !== "object" || !data.dataUrl) return null;
      return {
        name: data.name || "curriculo.pdf",
        size: data.size || null,
        updatedAt: data.updatedAt || Date.now(),
        dataUrl: data.dataUrl
      };
    } catch {
      return null;
    }
  }

  function recordApplication(job) {
    if (!job) return;
    const candidateId = state.owner || primeCandidateSession();
    if (!candidateId) {
      alert("Faca login como candidato para aplicar.");
      return;
    }
    const viewer = getCurrentSession();
    const candidateName =
      viewer && viewer.type === "personal"
        ? viewer.profile?.fullName || viewer.name || viewer.email || "Candidato"
        : "Candidato";
    const candidateAvatar = viewer && viewer.type === "personal" ? viewer.profile?.avatar || "" : "";
    const cv = loadCandidateCv();
    const entry = {
      id: `app_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      jobId: job.id || null,
      publicId: job.publicId || null,
      title: job.title || "Vaga",
      area: job.area || "",
      type: job.type || "",
      company: job.company || "",
      ownerId: job.ownerId || resolveOwnerId(job, job.publicId || job.id || ""),
      appliedAt: new Date().toISOString(),
      status: "Em analise",
      candidate: candidateName,
      avatar: candidateAvatar,
      cv
    };
    const applications = loadApplications(candidateId);
    applications.push(entry);
    saveApplications(applications, candidateId);
    state.owner = candidateId;
    state.applications = applications;

    if (entry.ownerId) {
      const companyEntries = loadApplications(entry.ownerId);
      companyEntries.push(entry);
      saveApplications(companyEntries, entry.ownerId);
    }

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
    const isClosed = normalizeText(job.status || "").includes("fech") || normalizeText(job.status || "").includes("encerr");

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

  function refreshJobsList() {
    state.jobs = loadPublicJobs();
    indexJobOwners(state.jobs);
    filterJobs(state.searchTerm);
    renderJobs(state.filtered);
  }

  function filterJobs(term) {
    const normalizedTerm = normalizeText(term || "");
    if (!normalizedTerm) {
      state.filtered = state.jobs.slice();
      return;
    }
    state.filtered = state.jobs.filter(job => {
      return [job.title, job.area, job.type, job.description]
        .some(field => normalizeText(field || "").includes(normalizedTerm));
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
    if (!primeCandidateSession()) {
      alert("Faca login como candidato para se candidatar a vagas.");
      return;
    }
    const matchedJob = findJobByKey(id);
    const ownerId =
      button.dataset.jobOwner || resolveOwnerId(matchedJob, button.dataset.jobPublicId || id);
    state.applied.add(id);
    saveApplied();
    button.disabled = true;
    button.classList.add("btn-prestado");
    button.innerHTML = '<i class="ri-check-line" aria-hidden="true"></i> Aplicado';
    button.setAttribute("aria-pressed", "true");
    announce(`Candidatura enviada para ${button.dataset.jobTitle || "a vaga"}.`);
    recordApplication({
      id: button.dataset.jobId || matchedJob?.id || id,
      publicId: button.dataset.jobPublicId || matchedJob?.publicId || "",
      title: button.dataset.jobTitle || matchedJob?.title || "Vaga",
      area: button.dataset.jobArea || matchedJob?.area || "",
      type: button.dataset.jobType || matchedJob?.type || "",
      company: button.dataset.jobCompany || matchedJob?.companyName || matchedJob?.company || "",
      ownerId: ownerId || ""
    });
  }

  function hydrate(session) {
    state.owner = session?.id || null;
    applyAvatar(session?.profile?.avatar || "");
    setCompanyInfo(session);
    state.applied = loadApplied(state.owner);
    state.applications = loadApplications(state.owner);
    refreshJobsList();
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
    window.addEventListener("storage", event => {
      if (event.key === PUBLIC_JOBS_KEY) refreshJobsList();
    });
    window.addEventListener(JOBS_EVENT, refreshJobsList);
    const initialSession = getCurrentSession();
    if (initialSession) hydrate(initialSession);
    else refreshJobsList();
    initAuth();
  }

  init();
})();
