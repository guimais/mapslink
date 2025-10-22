(() => {
  if (window.__ml_curriculo_init__) return;
  window.__ml_curriculo_init__ = true;

  const ACCENTS = /[\u0300-\u036f]/g;
  const STORAGE_KEY = "cvFilters";

  const elements = {
    table: document.querySelector(".table-cv"),
    search: document.getElementById("busca-cv"),
    toggle: document.getElementById("btn-filtrar"),
    panel: document.getElementById("painel-filtro"),
    panelForm: document.getElementById("form-filtros"),
    close: document.querySelector("#painel-filtro .filter-close"),
    clear: document.getElementById("btn-limpar-filtros"),
    start: document.getElementById("f-data-inicio"),
    end: document.getElementById("f-data-fim"),
    status: document.getElementById("f-status"),
    role: document.getElementById("f-vaga")
  };

  if (!elements.table || !elements.table.tBodies?.[0]?.rows?.length) return;

  const state = {
    overlay: null,
    rows: Array.from(elements.table.tBodies[0].rows)
  };

  function normalize(value) {
    return (value || "").normalize("NFD").replace(ACCENTS, "").toLowerCase();
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

  function rowDate(row) {
    const time = row.querySelector("td:nth-child(3) time");
    if (time?.dateTime) return new Date(time.dateTime);
    const text = row.querySelector("td:nth-child(3)")?.textContent?.trim() || "";
    const [day, month, year] = text.split("/").map(Number);
    if (day && month && year) return new Date(year, month - 1, day);
    return null;
  }

  function getFilters() {
    return {
      search: normalize(elements.search?.value),
      status: normalize(elements.status?.value),
      role: normalize(elements.role?.value),
      start: parseDate(elements.start?.value),
      end: parseDate(elements.end?.value)
    };
  }

  function matches(row, filters) {
    const name = normalize(row.querySelector("td:nth-child(1) .cell-text")?.textContent);
    const role = normalize(row.querySelector("td:nth-child(2)")?.textContent);
    const status = normalize(row.querySelector("td:nth-child(4) .status")?.textContent);
    const date = rowDate(row);

    if (filters.search && !name.includes(filters.search) && !role.includes(filters.search)) return false;
    if (filters.role && !role.includes(filters.role)) return false;
    if (filters.status && status !== filters.status) return false;
    if (filters.start && date && date < filters.start) return false;
    if (filters.end && date && date > filters.end) return false;
    return true;
  }

  function applyFilters() {
    const filters = getFilters();
    state.rows.forEach(row => {
      row.style.display = matches(row, filters) ? "" : "none";
    });
    const active = Object.values(filters).some(value => value);
    elements.toggle?.classList.toggle("active", active);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          status: elements.status?.value || "",
          role: elements.role?.value || "",
          start: elements.start?.value || "",
          end: elements.end?.value || "",
          search: elements.search?.value || ""
        })
      );
    } catch {}
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
    const { panel, toggle } = elements;
    if (!panel || panel.hidden || !toggle) return;
    const rect = toggle.getBoundingClientRect();
    const width = Math.min(520, window.innerWidth * 0.92);
    const top = rect.bottom + 10 + window.scrollY;
    let left = rect.right - width + window.scrollX;
    left = Math.max(16 + window.scrollX, Math.min(left, window.scrollX + window.innerWidth - width - 16));
    Object.assign(panel.style, { width: `${width}px`, top: `${top}px`, left: `${left}px` });
  }

  function openPanel() {
    const { panel, toggle } = elements;
    if (!panel) return;
    ensureOverlay().classList.add("show");
    document.body.classList.add("is-filter-open");
    if (panel.parentElement !== document.body) document.body.appendChild(panel);
    panel.hidden = false;
    positionPanel();
    requestAnimationFrame(() => panel.classList.add("open"));
    toggle?.setAttribute("aria-expanded", "true");
    const focusable = panel.querySelector("input,select,button");
    focusable?.focus();
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, { passive: true });
  }

  function closePanel() {
    const { panel, toggle } = elements;
    if (!panel || panel.hidden) return;
    ensureOverlay().classList.remove("show");
    document.body.classList.remove("is-filter-open");
    panel.classList.remove("open");
    setTimeout(() => {
      panel.hidden = true;
    }, 180);
    toggle?.setAttribute("aria-expanded", "false");
    window.removeEventListener("resize", positionPanel);
    window.removeEventListener("scroll", positionPanel);
  }

  function restoreFilters() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      if (elements.status) elements.status.value = saved.status || "";
      if (elements.role) elements.role.value = saved.role || "";
      if (elements.start) elements.start.value = saved.start || "";
      if (elements.end) elements.end.value = saved.end || "";
      if (elements.search) elements.search.value = saved.search || "";
    } catch {}
  }

  function handleOutsideClick(event) {
    const { panel, toggle } = elements;
    if (!panel || panel.hidden) return;
    if (panel.contains(event.target)) return;
    if (toggle && (event.target === toggle || toggle.contains(event.target))) return;
    closePanel();
  }

  function initListeners() {
    elements.search?.addEventListener("input", applyFilters);
    elements.start?.addEventListener("input", () => maskDate(elements.start));
    elements.end?.addEventListener("input", () => maskDate(elements.end));
    elements.toggle?.addEventListener("click", event => {
      event.stopPropagation();
      if (elements.panel?.hidden) openPanel();
      else closePanel();
    });
    elements.close?.addEventListener("click", closePanel);
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closePanel();
    });
    elements.panelForm?.addEventListener("submit", event => {
      event.preventDefault();
      applyFilters();
      closePanel();
    });
    elements.clear?.addEventListener("click", () => {
      elements.panelForm?.reset();
      applyFilters();
    });
  }

  function init() {
    initListeners();
    restoreFilters();
    applyFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
