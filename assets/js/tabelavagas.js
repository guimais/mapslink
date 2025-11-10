(() => {
  if (window.__ml_tabelavagas_init__) return;
  window.__ml_tabelavagas_init__ = true;

  const STORAGE_PREFIX = "mapslink:vagas";
  const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  const dom = {
    avatar: null,
    tbody: null
  };

  function initDom() {
    dom.avatar = document.querySelector("[data-company-avatar]");
    dom.tbody = document.getElementById("lista-vagas-publicas");
  }

  function applyAvatar(src) {
    if (!dom.avatar) return;
    const has = !!src;
    dom.avatar.src = has ? src : EMPTY_IMAGE;
    dom.avatar.alt = has ? "Logo da empresa" : "";
    const badge = dom.avatar.closest(".hero-badge");
    if (badge) badge.classList.toggle("is-empty", !has);
  }

  function storageKey(owner) {
    return owner ? `${STORAGE_PREFIX}:${owner}` : null;
  }

  function loadJobs(owner) {
    const key = storageKey(owner);
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function formatDate(value) {
    if (!value) return { text: "--/--/----", iso: "" };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { text: "--/--/----", iso: "" };
    const text = date.toLocaleDateString("pt-BR");
    return { text, iso: date.toISOString().split("T")[0] };
  }

  function escapeHtml(text) {
    return String(text || "").replace(/[&<>"']/g, chr => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[chr] || chr;
    });
  }

  function statusClass(status) {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("fech") || normalized.includes("encerr")) return "status status-fechada";
    return "status";
  }

  function buildRow(job) {
    const tr = document.createElement("tr");
    const title = escapeHtml(job.title || "Vaga");
    const area = escapeHtml(job.area || "--");
    const type = escapeHtml(job.type || "--");
    const status = escapeHtml(job.status || "Aberta");
    const date = formatDate(job.publishedAt);
    tr.innerHTML = `
      <td><span class="strong">${title}</span></td>
      <td>${area}</td>
      <td>${type}</td>
      <td><time datetime="${date.iso}">${date.text}</time></td>
      <td class="col-status"><span class="${statusClass(status)}">${status}</span></td>
    `;
    return tr;
  }

  function renderJobs(jobs) {
    if (!dom.tbody) return;
    dom.tbody.innerHTML = "";
    if (!jobs.length) {
      const row = document.createElement("tr");
      row.className = "tbl-empty";
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = dom.tbody.dataset.emptyText || "Nenhuma vaga disponível.";
      row.appendChild(cell);
      dom.tbody.appendChild(row);
      return;
    }
    jobs.forEach(job => dom.tbody.appendChild(buildRow(job)));
  }

  function hydrate(session) {
    applyAvatar(session?.profile?.avatar || "");
    const owner = session?.id || null;
    const jobs = owner ? loadJobs(owner) : [];
    renderJobs(jobs);
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
    initDom();
    hydrate(null);
    initAuth();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

