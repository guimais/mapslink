(() => {
  const page = document.getElementById("envio-cv");
  if (!page) return;

  const table = page.querySelector(".table-empresa");
  const thead = table?.tHead;
  const tbody = table?.tBodies?.[0];
  if (!table || !thead || !tbody) return;

  const companyTitle = document.getElementById("empresa-titulo");
  const companyName = (companyTitle?.textContent || "empresa").trim();

  const searchInput = page.querySelector(".search-input input");
  const actionsBar = page.querySelector(".actions-bar");

  const ACCENTS = /[\u0300-\u036f]/g;
  const slug = value =>
    (value || "")
      .normalize("NFD")
      .replace(ACCENTS, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const STORAGE_KEY = `mapslink_envio_cv_${slug(companyName)}_v1`;
  const STORAGE_SORT = `${STORAGE_KEY}_sort`;

  const state = {
    applied: new Set(),
    sort: null,
    liveRegion: null,
    debounceTimer: null,
    resetTimer: null
  };

  function ensureStyles() {
    if (document.getElementById("ml-envio-styles")) return;
    const style = document.createElement("style");
    style.id = "ml-envio-styles";
    style.textContent = `
#result-count.envio-result{margin:8px 0 0;font-size:13px;font-weight:800;color:var(--muted);}
`;
    document.head.appendChild(style);
  }

  function createLiveRegion() {
    const region = document.createElement("div");
    region.className = "sr-only";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    document.body.appendChild(region);
    return region;
  }

  function announce(message) {
    if (!state.liveRegion) return;
    state.liveRegion.textContent = "";
    setTimeout(() => {
      state.liveRegion.textContent = message;
    }, 10);
  }

  function loadApplied() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state.applied = new Set(JSON.parse(raw));
    } catch {
      state.applied = new Set();
    }
  }

  function saveApplied() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.applied)));
    } catch {
      /* ignore quota errors */
    }
  }

  function saveSort(info) {
    state.sort = info;
    try {
      localStorage.setItem(STORAGE_SORT, JSON.stringify(info));
    } catch {}
  }

  function loadSort() {
    try {
      const raw = localStorage.getItem(STORAGE_SORT);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function ensureRowIds() {
    Array.from(tbody.rows).forEach((row, index) => {
      const button = row.querySelector(".prestar-vaga");
      if (!button) return;
      if (!button.dataset.id) {
        const title = row.querySelector("td:first-child .cell-text")?.textContent?.trim() || `vaga-${index + 1}`;
        const modality = row.querySelector("td:nth-child(3)")?.textContent?.trim() || "";
        button.dataset.id = `${slug(companyName)}-${slug(title)}-${slug(modality)}-${index}`;
      }
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
    });
  }

  function setButtonState(button, applied, title) {
    if (!button) return;
    const label = title ? `"${title}"` : "essa vaga";
    if (applied) {
      button.classList.add("btn-prestado");
      button.setAttribute("aria-pressed", "true");
      button.disabled = true;
      button.innerHTML = '<i class="ri-check-line" aria-hidden="true"></i> Aplicado';
      button.title = `Você já se candidatou para ${label}`;
    } else {
      button.classList.remove("btn-prestado");
      button.setAttribute("aria-pressed", "false");
      button.disabled = false;
      button.innerHTML = '<i class="ri-send-plane-2-line" aria-hidden="true"></i> Prestar Vaga';
      button.title = `Enviar currículo para ${label}`;
    }
  }

  function refreshButtons() {
    Array.from(tbody.querySelectorAll(".prestar-vaga")).forEach(button => {
      const row = button.closest("tr");
      const title = row?.querySelector("td:first-child .cell-text")?.textContent?.trim() || "";
      const applied = state.applied.has(button.dataset.id || "");
      setButtonState(button, applied, title);
    });
  }

  function applyFor(button) {
    const id = button.dataset.id || "";
    if (!id || state.applied.has(id)) return;
    const row = button.closest("tr");
    const title = row?.querySelector("td:first-child .cell-text")?.textContent?.trim() || "";
    state.applied.add(id);
    saveApplied();
    setButtonState(button, true, title);
    announce(`Currículo enviado para ${title || "a vaga selecionada"}.`);
  }

  function handleApply(event) {
    const button = event.target.closest(".prestar-vaga");
    if (!button) return;
    applyFor(button);
  }

  function handleApplyKey(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const button = event.target.closest(".prestar-vaga");
    if (!button) return;
    event.preventDefault();
    applyFor(button);
  }

  function matches(term, row) {
    if (!term) return true;
    const value = row.textContent || "";
    return value.toLowerCase().includes(term);
  }

  function updateCounter(count) {
    let badge = page.querySelector("#result-count");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "result-count";
      badge.className = "envio-result";
      actionsBar?.appendChild(badge);
    }
    badge.textContent = `${count} resultado(s)`;
  }

  function filterRows(term) {
    const value = (term || "").trim().toLowerCase();
    let visible = 0;
    Array.from(tbody.rows).forEach(row => {
      const show = matches(value, row);
      row.style.display = show ? "" : "none";
      if (show) visible += 1;
    });
    updateCounter(visible);
    announce(visible ? `${visible} vaga(s) encontrada(s)` : "Nenhuma vaga encontrada");
    return visible;
  }

  function debounce(fn, delay) {
    return event => {
      clearTimeout(state.debounceTimer);
      state.debounceTimer = setTimeout(() => fn(event), delay);
    };
  }

  function toggleSortState(state) {
    if (state === "ascending") return "descending";
    return "ascending";
  }

  function sortRows(columnIndex, direction) {
    const rows = Array.from(tbody.rows);
    const visible = rows.filter(row => row.style.display !== "none");
    const hidden = rows.filter(row => row.style.display === "none");

    visible.sort((a, b) => {
      const valueA = (a.cells[columnIndex]?.innerText || "").trim().toLowerCase();
      const valueB = (b.cells[columnIndex]?.innerText || "").trim().toLowerCase();
      if (valueA < valueB) return direction === "ascending" ? -1 : 1;
      if (valueA > valueB) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    [...visible, ...hidden].forEach(row => tbody.appendChild(row));
  }

  function setupSorting() {
    const headers = Array.from(thead.rows[0].cells);
    headers.forEach((header, index) => {
      const isActionsColumn = index === headers.length - 1;
      if (isActionsColumn) return;

      header.style.cursor = "pointer";
      header.tabIndex = 0;
      header.setAttribute("role", "columnheader");
      header.setAttribute("aria-sort", "none");
      header.title = `Ordenar por ${header.textContent.trim()}`;

      const triggerSort = () => {
        const nextDirection = toggleSortState(header.getAttribute("aria-sort"));
        headers.forEach((other, idx) => {
          if (idx !== index) other.setAttribute("aria-sort", "none");
        });
        header.setAttribute("aria-sort", nextDirection);
        sortRows(index, nextDirection);
        saveSort({ index, dir: nextDirection });
      };

      header.addEventListener("click", triggerSort);
      header.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          triggerSort();
        }
      });
    });

    const savedSort = loadSort();
    if (savedSort) {
      const header = headers[savedSort.index];
      if (header) {
        header.setAttribute("aria-sort", savedSort.dir);
        sortRows(savedSort.index, savedSort.dir);
      }
    }
  }

  function resetHistory() {
    if (!state.resetTimer) {
      state.resetTimer = setTimeout(() => {
        const ok = confirm(`Limpar histórico de vagas aplicadas para "${companyName}"?`);
        if (ok) {
          state.applied.clear();
          saveApplied();
          refreshButtons();
          announce("Histórico de aplicações limpo.");
        }
        state.resetTimer = null;
      }, 1000);
    }
  }

  function cancelReset() {
    if (!state.resetTimer) return;
    clearTimeout(state.resetTimer);
    state.resetTimer = null;
  }

  function bindResetShortcut() {
    window.addEventListener("keydown", event => {
      if (event.altKey && event.key.toLowerCase() === "r") resetHistory();
    });
    window.addEventListener("keyup", cancelReset);
  }

  function initSearch() {
    if (!searchInput) return;
    searchInput.addEventListener(
      "input",
      debounce(event => {
        filterRows(event.target.value);
        const wrapper = page.querySelector(".table-wrapper");
        if (wrapper) wrapper.scrollTop = 0;
      }, 200)
    );
  }

  function init() {
    ensureStyles();
    state.liveRegion = createLiveRegion();
    loadApplied();
    ensureRowIds();
    refreshButtons();
    filterRows(searchInput?.value || "");
    setupSorting();
    initSearch();
    bindResetShortcut();
    tbody.addEventListener("click", handleApply);
    tbody.addEventListener("keydown", handleApplyKey);
  }

  init();
})();
