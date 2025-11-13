const token = localStorage.getItem("jwt_token");
if (!token) {
  window.location.href = "loginempresa.html";
}
(() => {
  if (window.__ml_curriculo_init__) return;
  window.__ml_curriculo_init__ = true;

  const APPLICATION_PREFIX = "mapslink:applications";
  const APPLICATION_RESET_KEY = `${APPLICATION_PREFIX}:reset:v2`;
  const EMPTY_IMAGE =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
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
    exportBtn: document.getElementById("btn-exportar"),
  };

  const state = {
    owner: null,
    entries: [],
    filtered: [],
    overlay: null,
    entriesMap: new Map(),
  };

  function storageKey(owner) {
    return owner ? `${APPLICATION_PREFIX}:${owner}` : null;
  }

  function sanitizeEntry(entry, index) {
    if (!entry || typeof entry !== "object") return null;
    const candidateName =
      typeof entry.candidate === "string" ? entry.candidate.trim() : "";
    if (!candidateName) return null;
    const safe = { ...entry };
    safe.id = safe.id || `app_${index}_${Date.now().toString(36)}`;
    safe.candidate = candidateName;
    safe.status = safe.status || "Em análise";
    safe.appliedAt =
      safe.appliedAt || safe.createdAt || new Date().toISOString();
    safe.avatar = safe.avatar || "";
    if (!safe.cv || typeof safe.cv !== "object" || !safe.cv.dataUrl) {
      safe.cv = null;
    }
    return safe;
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
        .sort(
          (a, b) =>
            (Date.parse(b?.appliedAt || b?.createdAt || 0) || 0) -
            (Date.parse(a?.appliedAt || a?.createdAt || 0) || 0),
        )
        .map((entry, index) => sanitizeEntry(entry, index))
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  function refreshEntries() {
    if (!state.owner) {
      state.entries = [];
      state.filtered = [];
      render();
      return;
    }
    state.entries = loadApplications(state.owner);
    state.entriesMap = new Map(state.entries.map((entry) => [entry.id, entry]));
    applyFilters();
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
      iso: date.toISOString().split("T")[0],
    };
  }

  function statusClass(status) {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("aprov")) return "status status-aprovado";
    if (normalized.includes("reprov")) return "status status-reprovada";
    if (normalized.includes("anal")) return "status status-analise";
    return "status";
  }

  function dataUrlToBlob(dataUrl) {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:"))
      return null;
    const [meta, payload] = dataUrl.split(",");
    if (!payload) return null;
    try {
      const mime = (meta.match(/data:(.*?);/) || [])[1] || "application/pdf";
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: mime });
    } catch {
      return null;
    }
  }

  function openCv(entry) {
    if (!entry?.cv?.dataUrl) return;
    const blob = dataUrlToBlob(entry.cv.dataUrl);
    if (!blob) {
      alert("Não foi possível abrir este currículo.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank", "noopener");
    if (!win) {
      alert("Permita pop-ups para visualizar o currículo.");
      URL.revokeObjectURL(url);
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function createRow(entry, index) {
    const tr = document.createElement("tr");
    tr.dataset.entryId = entry.id || `entry-${index}`;
    const date = formatDate(entry.appliedAt);
    const hasCv = !!(entry.cv && entry.cv.dataUrl);

    const candidateCell = document.createElement("td");
    const avatarWrap = document.createElement("span");
    avatarWrap.className = "avatar";
    const img = document.createElement("img");
    img.src = entry.avatar || EMPTY_IMAGE;
    img.alt = entry.candidate
      ? `Foto de ${entry.candidate}`
      : "Foto do candidato";
    avatarWrap.appendChild(img);
    const nameSpan = document.createElement("span");
    nameSpan.className = "cell-text";
    nameSpan.textContent = entry.candidate || "Candidato";
    candidateCell.append(avatarWrap, nameSpan);

    const roleCell = document.createElement("td");
    roleCell.textContent = entry.title || "--";

    const dateCell = document.createElement("td");
    const time = document.createElement("time");
    time.dateTime = date.iso;
    time.textContent = date.text;
    dateCell.appendChild(time);

    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = statusClass(entry.status);
    statusBadge.textContent = entry.status || "Em análise";
    statusCell.appendChild(statusBadge);

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-small ver-cv";
    button.dataset.viewCv = entry.id || "";
    if (hasCv) {
      button.textContent = "Ver CV";
      button.title = (entry.cv && entry.cv.name) || "Visualizar currículo";
    } else {
      button.textContent = "CV indisponível";
      button.disabled = true;
    }
    actionCell.appendChild(button);

    tr.append(candidateCell, roleCell, dateCell, statusCell, actionCell);
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
      cell.textContent =
        dom.tbody.dataset.emptyText || "Nenhuma candidatura recebida ainda.";
      row.appendChild(cell);
      dom.tbody.appendChild(row);
      updateCount(0);
      return;
    }
    state.filtered.forEach((entry, index) =>
      dom.tbody.appendChild(createRow(entry, index)),
    );
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
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    )
      return null;
    return date;
  }

  function getFilters() {
    return {
      search: normalizeText(dom.search?.value || ""),
      status: normalizeText(dom.status?.value || ""),
      role: normalizeText(dom.role?.value || ""),
      start: parseDate(dom.start?.value),
      end: parseDate(dom.end?.value),
    };
  }

  function matches(entry, filters) {
    const name = normalizeText(entry.candidate || "");
    const role = normalizeText(entry.title || "");
    const status = normalizeText(entry.status || "");
    const date = entry.appliedAt ? new Date(entry.appliedAt) : null;

    if (
      filters.search &&
      !name.includes(filters.search) &&
      !role.includes(filters.search)
    )
      return false;
    if (filters.role && !role.includes(filters.role)) return false;
    if (filters.status && status !== filters.status) return false;
    if (filters.start && date && date < filters.start) return false;
    if (filters.end && date && date > filters.end) return false;
    return true;
  }

  function applyFilters() {
    const filters = getFilters();
    state.filtered = state.entries.filter((entry) => matches(entry, filters));
    render();
    const active = Object.values(filters).some((value) => value);
    dom.toggle?.classList.toggle("active", active);
    try {
      localStorage.setItem(
        FILTER_STORAGE,
        JSON.stringify({
          status: dom.status?.value || "",
          role: dom.role?.value || "",
          start: dom.start?.value || "",
          end: dom.end?.value || "",
          search: dom.search?.value || "",
        }),
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
    left = Math.max(
      16 + window.scrollX,
      Math.min(left, window.scrollX + window.innerWidth - width - 16),
    );
    Object.assign(panel.style, {
      width: `${width}px`,
      top: `${top}px`,
      left: `${left}px`,
    });
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
    if (
      dom.toggle &&
      (event.target === dom.toggle || dom.toggle.contains(event.target))
    )
      return;
    closePanel();
  }

  function exportData() {
    if (!state.filtered.length) {
      alert("Não há candidaturas para exportar.");
      return;
    }
    const header = ["Nome", "Vaga", "Data", "Status"];
    const rows = state.filtered.map((entry) => [
      `"${entry.candidate || ""}"`,
      `"${entry.title || ""}"`,
      `"${formatDate(entry.appliedAt).text}"`,
      `"${entry.status || "Em análise"}"`,
    ]);
    const csv = [header.join(";"), ...rows.map((row) => row.join(";"))].join(
      "\n",
    );
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

  function handleCvClick(event) {
    const button = event.target.closest("[data-view-cv]");
    if (!button || button.disabled) return;
    const id = button.dataset.viewCv;
    if (!id) return;
    const entry = state.entries.find((item) => item.id === id);
    if (!entry || !entry.cv) {
      alert("Currículo não disponível para este candidato.");
      return;
    }
    openCv(entry);
  }

  function handleStorageEvent(event) {
    if (!state.owner) return;
    if (event.key === storageKey(state.owner)) {
      refreshEntries();
    }
  }

  function initListeners() {
    dom.search?.addEventListener("input", applyFilters);
    dom.start?.addEventListener("input", () => maskDate(dom.start));
    dom.end?.addEventListener("input", () => maskDate(dom.end));
    dom.toggle?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (dom.panel?.hidden) openPanel();
      else closePanel();
    });
    dom.close?.addEventListener("click", closePanel);
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closePanel();
    });
    dom.panelForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      applyFilters();
      closePanel();
    });
    dom.clear?.addEventListener("click", () => {
      dom.panelForm?.reset();
      applyFilters();
    });
    dom.exportBtn?.addEventListener("click", exportData);
    dom.tbody?.addEventListener("click", handleCvClick);
  }

  function hydrate(session) {
    state.owner = session?.id || null;
    applyAvatar(session?.profile?.avatar || "");
    refreshEntries();
  }

  function initAuth() {
    const auth = window.MapsAuth;
    if (!auth) {
      hydrate(null);
      return;
    }
    const refresh = () => hydrate(auth.current ? auth.current() : null);
    if (typeof auth.ready === "function") {
      auth
        .ready()
        .then(refresh)
        .catch(() => hydrate(null));
    } else {
      refresh();
    }
    if (typeof auth.onSession === "function") auth.onSession(hydrate);
  }

  function init() {
    restoreFilters();
    initListeners();
    initAuth();
    window.addEventListener("storage", handleStorageEvent);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
function resetApplicationsOnce() {
  try {
    if (localStorage.getItem(APPLICATION_RESET_KEY)) return;
    const prefix = `${APPLICATION_PREFIX}:`;
    const keysToRemove = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith(prefix)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
    localStorage.setItem(APPLICATION_RESET_KEY, String(Date.now()));
  } catch {}
}

resetApplicationsOnce();
