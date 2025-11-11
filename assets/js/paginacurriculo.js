const token = localStorage.getItem("jwt_token");
if (!token) {
  window.location.href = "loginempresa.html"; 
}
(() => {
  if (window.__ml_curriculo_init__) return;
  window.__ml_curriculo_init__ = true;

  const APPLICATION_PREFIX = "mapslink:applications";
  const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const FILTER_STORAGE = "mapslink:curriculo:filtros";
  const { normalizeText } = window.MapsUtils || {};

  const dom = {
    avatar: document.querySelector("[data-company-avatar]"),
    count: document.getElementById("curriculo-count"),
    search: document.querySelector("[data-search-input]"),
    status: document.getElementById("f-status"),
    role: document.getElementById("f-vaga"),
    start: document.getElementById("f-data-inicio"),
    end: document.getElementById("f-data-fim"),
    toggle: document.getElementById("btn-filtrar"),
    panel: document.getElementById("painel-filtro"),
    panelForm: document.getElementById("form-filtros"),
    close: document.querySelector("#painel-filtro .filter-close"),
    clear: document.getElementById("btn-limpar-filtros"),
    tbody: document.getElementById("lista-curriculos"),
    tableWrapper: document.querySelector(".table-wrapper"),
    exportBtn: document.getElementById("btn-exportar")
  };

  const state = {
    owner: null,
    entries: [],
    filtered: [],
    overlay: null
  };

  function storageKey(owner) {
    return owner ? `${APPLICATION_PREFIX}:${owner}` : null;
  }

  function loadApplications(owner) {
    const key = storageKey(owner);
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      return list
        .slice()
        .sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
    } catch {
      return [];
    }
  }

  function applyAvatar(src) {
    if (!dom.avatar) return;
    const has = !!src;
    dom.avatar.src = has ? src : EMPTY_IMAGE;
    dom.avatar.alt = has ? "Logo da empresa" : "";
    dom.avatar.closest(".avatar-badge")?.classList.toggle("is-empty", !has);
  }

  function updateCount(value) {
    if (!dom.count) return;
    const label = value === 1 ? "resultado" : "resultados";
    dom.count.textContent = `${value} ${label}`;
  }

  function formatDate(value) {
    if (!value) return { text: "--/--/----", iso: "" };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { text: "--/--/----", iso: "" };
    return {
      text: date.toLocaleDateString("pt-BR"),
      iso: date.toISOString().split("T")[0]
    };
  }

  function statusClass(status) {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("aprov")) return "status status-aprovado";
    if (normalized.includes("reprov")) return "status status-reprovada";
    if (normalized.includes("anal")) return "status status-analise";
    return "status";
  }

  function createRow(entry, index) {
    const tr = document.createElement("tr");
    const date = formatDate(entry.appliedAt);
    const avatar = entry.avatar || EMPTY_IMAGE;
    const name = entry.candidate || `Candidato ${index + 1}`;
    tr.innerHTML = `
      <td>
        <span class="avatar"><img src="${avatar}" alt=""></span>
        <span class="cell-text">${name}</span>
      </td>
      <td>${entry.title || "--"}</td>
      <td><time datetime="${date.iso}">${date.text}</time></td>
      <td><span class="${statusClass(entry.status)}">${entry.status || "Em análise"}</span></td>
      <td><button class="btn btn-small ver-cv" type="button" disabled>Ver CV</button></td>
    `;
    return tr;
  }

  function render() {
    if (!dom.tbody) return;
    dom.tbody.innerHTML = "";
    if (!state.filtered.length) {
      const row = document.createElement("tr");
      row.className = "tbl-empty";
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = dom.tbody.dataset.emptyText || "Nenhuma candidatura recebida ainda.";
      row.appendChild(cell);
      dom.tbody.appendChild(row);
      updateCount(0);
      return;
    }
    state.filtered.forEach((entry, index) => dom.tbody.appendChild(createRow(entry, index)));
    updateCount(state.filtered.length);
  }

  function parseDate(value) {
    if (!value) return null;
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  function getFilters() {
    return {
      search: normalizeText(dom.search?.value || ""),
      status: normalizeText(dom.status?.value || ""),
      role: normalizeText(dom.role?.value || ""),
      start: parseDate(dom.start?.value),
      end: parseDate(dom.end?.value)
    };
  }

  function matches(entry, filters) {
    const name = normalizeText(entry.candidate || "");
    const role = normalizeText(entry.title || "");
    const status = normalizeText(entry.status || "");
    const date = entry.appliedAt ? new Date(entry.appliedAt) : null;

    if (filters.search && !name.includes(filters.search) && !role.includes(filters.search)) return false;
    if (filters.role && !role.includes(filters.role)) return false;
    if (filters.status && status !== filters.status) return false;
    if (filters.start && date && date < filters.start) return false;
    if (filters.end && date && date > filters.end) return false;
    return true;
  }

  function applyFilters() {
    const filters = getFilters();
    state.filtered = state.entries.filter(entry => matches(entry, filters));
    render();
    const active = Object.values(filters).some(value => value);
    dom.toggle?.classList.toggle("active", active);
    try {
      localStorage.setItem(
        FILTER_STORAGE,
        JSON.stringify({
          status: dom.status?.value || "",
          role: dom.role?.value || "",
          start: dom.start?.value || "",
          end: dom.end?.value || "",
          search: dom.search?.value || ""
        })
      );
    } catch {}
  }

  function restoreFilters() {
    try {
      const saved = JSON.parse(localStorage.getItem(FILTER_STORAGE) || "null");
      if (!saved) return;
      if (dom.status) dom.status.value = saved.status || "";
      if (dom.role) dom.role.value = saved.role || "";
      if (dom.start) dom.start.value = saved.start || "";
      if (dom.end) dom.end.value = saved.end || "";
      if (dom.search) dom.search.value = saved.search || "";
    } catch {}
  }

  function maskDate(input) {
    let digits = (input.value || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length >= 5) {
      input.value = digits.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
    } else if (digits.length >= 3) {
      input.value = digits.replace(/(\d{2})(\d{0,2})/, "$1/$2");
    } else {
      input.value = digits;
    }
  }

  function ensureOverlay() {
    if (state.overlay) return state.overlay;
    let overlay = document.getElementById("ui-backdrop");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "ui-backdrop";
      overlay.className = "ui-backdrop";
      document.body.appendChild(overlay);
    }
    overlay.addEventListener("click", closePanel, { once: false });
    state.overlay = overlay;
    return overlay;
  }

  function positionPanel() {
    const panel = dom.panel;
    const toggle = dom.toggle;
    if (!panel || panel.hidden || !toggle) return;
    const rect = toggle.getBoundingClientRect();
    const width = Math.min(520, window.innerWidth * 0.92);
    const top = rect.bottom + 10 + window.scrollY;
    let left = rect.right - width + window.scrollX;
    left = Math.max(16 + window.scrollX, Math.min(left, window.scrollX + window.innerWidth - width - 16));
    Object.assign(panel.style, { width: `${width}px`, top: `${top}px`, left: `${left}px` });
  }

  function openPanel() {
    const panel = dom.panel;
    if (!panel) return;
    ensureOverlay().classList.add("show");
    document.body.classList.add("is-filter-open");
    if (panel.parentElement !== document.body) document.body.appendChild(panel);
    panel.hidden = false;
    positionPanel();
    requestAnimationFrame(() => panel.classList.add("open"));
    dom.toggle?.setAttribute("aria-expanded", "true");
    panel.querySelector("input,select,button")?.focus();
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, { passive: true });
  }

  function closePanel() {
    const panel = dom.panel;
    if (!panel || panel.hidden) return;
    ensureOverlay().classList.remove("show");
    document.body.classList.remove("is-filter-open");
    panel.classList.remove("open");
    setTimeout(() => (panel.hidden = true), 180);
    dom.toggle?.setAttribute("aria-expanded", "false");
    window.removeEventListener("resize", positionPanel);
    window.removeEventListener("scroll", positionPanel);
  }

  function handleOutsideClick(event) {
    const panel = dom.panel;
    if (!panel || panel.hidden) return;
    if (panel.contains(event.target)) return;
    if (dom.toggle && (event.target === dom.toggle || dom.toggle.contains(event.target))) return;
    closePanel();
  }

  function exportData() {
    if (!state.filtered.length) {
      alert("Não há candidaturas para exportar.");
      return;
    }
    const header = ["Nome", "Vaga", "Data", "Status"];
    const rows = state.filtered.map(entry => [
      `"${entry.candidate || ""}"`,
      `"${entry.title || ""}"`,
      `"${formatDate(entry.appliedAt).text}"`,
      `"${entry.status || "Em análise"}"`
    ]);
    const csv = [header.join(";"), ...rows.map(row => row.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "curriculos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function initListeners() {
    dom.search?.addEventListener("input", applyFilters);
    dom.start?.addEventListener("input", () => maskDate(dom.start));
    dom.end?.addEventListener("input", () => maskDate(dom.end));
    dom.toggle?.addEventListener("click", event => {
      event.stopPropagation();
      if (dom.panel?.hidden) openPanel();
      else closePanel();
    });
    dom.close?.addEventListener("click", closePanel);
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closePanel();
    });
    dom.panelForm?.addEventListener("submit", event => {
      event.preventDefault();
      applyFilters();
      closePanel();
    });
    dom.clear?.addEventListener("click", () => {
      dom.panelForm?.reset();
      applyFilters();
    });
    dom.exportBtn?.addEventListener("click", exportData);
  }

  function hydrate(session) {
    state.owner = session?.id || null;
    applyAvatar(session?.profile?.avatar || "");
    state.entries = loadApplications(state.owner);
    state.filtered = state.entries.slice();
    applyFilters();
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
    restoreFilters();
    initListeners();
    initAuth();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
