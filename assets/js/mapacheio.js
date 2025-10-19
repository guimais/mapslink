(async function () {
  "use strict";

  const mapElement = document.getElementById("map");
  if (!mapElement) return;
  if (typeof window.L === "undefined") return;

  const filterToggle = document.querySelector(".filter-toggle");
  const filterPanel = document.getElementById("filterPanel");

  let map;
  let markersLayer;
  let heatLayer = null;
  let heatEnabled = false;
  let currentFilters = {};
  let currentResults = [];
  let filterPanelOpen = false;

  const toLower = value => String(value ?? "").toLowerCase();

  const escapeHtml = value =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const normalizeInput = value => {
    if (value == null) return null;
    const trimmed = String(value).trim();
    return trimmed ? trimmed : null;
  };

  const arrayify = value =>
    value == null ? [] : Array.isArray(value) ? value : [value];

  function getFilterOptions() {
    if (typeof window.getFilterOptions === "function") {
      try {
        return window.getFilterOptions() || {};
      } catch (error) {
        console.error("Maps Link: falha ao carregar opções de filtro", error);
      }
    }
    if (
      window.MapsFilters?.buildFilterOptions &&
      Array.isArray(window.__companies)
    ) {
      return window.MapsFilters.buildFilterOptions(window.__companies);
    }
    return {
      industries: [],
      sizes: [],
      workModes: []
    };
  }

  function hasActiveFilters() {
    if (heatEnabled) return true;
    return Object.keys(currentFilters).length > 0;
  }

  function updateFilterIndicator() {
    if (!filterToggle) return;
    const active = hasActiveFilters();
    filterToggle.classList.toggle("applied", active);
    filterToggle.setAttribute("data-has-filters", active ? "true" : "false");
  }

  function handleFilterKeydown(event) {
    if (event.key !== "Escape" || !filterPanelOpen) return;
    event.preventDefault();
    closeFilterPanel();
    filterToggle?.focus();
  }

  function handleFilterOutside(event) {
    if (!filterPanelOpen || !filterPanel) return;
    const target = event.target;
    if (filterPanel.contains(target)) return;
    if (filterToggle && (target === filterToggle || filterToggle.contains(target))) {
      return;
    }
    closeFilterPanel();
  }

  function buildCheckboxList(items, selectedSet, name) {
    if (!items.length) {
      return `<span class="fp-subtle">Nenhuma opção disponível.</span>`;
    }
    return items
      .map(item => {
        const label = escapeHtml(item);
        const checked = selectedSet.has(toLower(item)) ? " checked" : "";
        return `<label class="fp-check"><input type="checkbox" name="${name}" value="${label}"${checked}><span>${label}</span></label>`;
      })
      .join("");
  }

  function buildPillGroup(items, selectedSet, attr) {
    if (!items.length) {
      return `<span class="fp-subtle">Sem dados cadastrados.</span>`;
    }
    return items
      .map(item => {
        const label = escapeHtml(item);
        const active = selectedSet.has(toLower(item)) ? " active" : "";
        return `<button type="button" class="pill${active}" ${attr}="${label}">${label}</button>`;
      })
      .join("");
  }

  function renderFilterPanel() {
    if (!filterPanel) return;

    const options = getFilterOptions();
    const industries = Array.isArray(options.industries) ? options.industries : [];
    const sizes = Array.isArray(options.sizes) ? options.sizes : [];
    const workModes = Array.isArray(options.workModes) ? options.workModes : [];

    const selectedIndustries = new Set(
      arrayify(currentFilters.industries).map(toLower)
    );
    const selectedSizes = new Set(arrayify(currentFilters.sizes).map(toLower));
    const selectedModes = new Set(
      arrayify(currentFilters.workModes).map(toLower)
    );
    const hiringActive =
      currentFilters.isHiring === true ||
      currentFilters.isHiring === "true";
    const locationValue = currentFilters.location ?? currentFilters.q ?? "";

    filterPanel.innerHTML = `
      <form class="fp" aria-label="Filtros do mapa">
        <header class="fp-header">
          <div class="fp-header-text">
            <span class="fp-title">Filtros</span>
            <p class="fp-subtitle">Cidade, Estado ou Região</p>
          </div>
          <button type="button" class="fp-close" aria-label="Fechar filtros">
            <i class="ri-close-line" aria-hidden="true"></i>
          </button>
        </header>

        <div class="fp-group">
          <label class="fp-input">
            <i class="ri-map-pin-line" aria-hidden="true"></i>
            <input type="search" name="location" placeholder="Cidade, Estado ou Região" value="${escapeHtml(locationValue)}">
          </label>
        </div>

        <div class="fp-section">
          <p class="fp-heading">Área de Atuação</p>
          <div class="fp-checklist">
            ${buildCheckboxList(industries, selectedIndustries, "industries")}
          </div>
        </div>

        <div class="fp-section">
          <p class="fp-heading">Porte da Empresa</p>
          <div class="fp-pills" data-size-group>
            ${buildPillGroup(sizes, selectedSizes, "data-size")}
          </div>
        </div>

        <div class="fp-section">
          <p class="fp-heading">Modalidade de Trabalho</p>
          <div class="fp-pills" data-mode-group>
            ${buildPillGroup(workModes, selectedModes, "data-mode")}
          </div>
        </div>

        <div class="fp-section fp-section--toggles">
          <label class="fp-switch-row">
            <span>Apenas com Vagas Abertas</span>
            <span class="fp-switch">
              <input type="checkbox" name="isHiring" value="true"${hiringActive ? " checked" : ""}>
              <span class="fp-slider" aria-hidden="true"></span>
            </span>
          </label>
          <label class="fp-switch-row">
            <span>Mapa de Calor</span>
            <span class="fp-switch">
              <input type="checkbox" name="heatmap" value="true"${heatEnabled ? " checked" : ""}>
              <span class="fp-slider" aria-hidden="true"></span>
            </span>
          </label>
        </div>

        <div class="fp-actions">
          <button type="submit" class="fp-apply">Aplicar Filtros</button>
        </div>
      </form>
    `;

    const form = filterPanel.querySelector("form");
    const closeBtn = filterPanel.querySelector(".fp-close");
    const searchField = filterPanel.querySelector('input[name="location"]');
    const sizeButtons = Array.from(filterPanel.querySelectorAll("[data-size]"));
    const modeButtons = Array.from(filterPanel.querySelectorAll("[data-mode]"));

    closeBtn?.addEventListener("click", () => {
      closeFilterPanel();
      filterToggle?.focus();
    });

    sizeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
      });
    });

    modeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
      });
    });

    form?.addEventListener("submit", event => {
      event.preventDefault();
      const formData = new FormData(form);

      const selectedIndustriesList = Array.from(
        form.querySelectorAll('input[name="industries"]:checked')
      ).map(input => input.value);

      const selectedSizesList = sizeButtons
        .filter(btn => btn.classList.contains("active"))
        .map(btn => btn.dataset.size)
        .filter(Boolean);

      const selectedModesList = modeButtons
        .filter(btn => btn.classList.contains("active"))
        .map(btn => btn.dataset.mode)
        .filter(Boolean);

      const location = normalizeInput(formData.get("location"));
      const hiring = formData.get("isHiring") ? true : null;
      heatEnabled = !!formData.get("heatmap");

      applyAndRender({
        location,
        q: location,
        industries: selectedIndustriesList,
        sizes: selectedSizesList,
        workModes: selectedModesList,
        isHiring: hiring
      });
      renderHeat(currentResults, heatEnabled);
      closeFilterPanel();
      filterToggle?.focus();
    });

    searchField?.focus({ preventScroll: true });
  }

  function openFilterPanel() {
    if (!filterPanel || filterPanelOpen) return;
    renderFilterPanel();
    filterPanel.hidden = false;
    filterPanelOpen = true;
    filterToggle?.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", handleFilterKeydown, true);
  }

  function closeFilterPanel() {
    if (!filterPanel || !filterPanelOpen) return;
    filterPanel.hidden = true;
    filterPanelOpen = false;
    filterToggle?.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", handleFilterKeydown, true);
  }

  function toggleFilterPanel(event) {
    event?.preventDefault();
    if (filterPanelOpen) closeFilterPanel();
    else openFilterPanel();
  }

  if (filterToggle && filterPanel) {
    filterToggle.addEventListener("click", toggleFilterPanel);
    document.addEventListener("click", handleFilterOutside, true);
  }

  function getCoords(company) {
    const source = company?.coordinates || company?.location || {};
    const lat = Number(source.lat);
    const lng = Number(source.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }

  function popupHtml(company) {
    const tags = Array.isArray(company?.tags) ? company.tags : [];
    const jobs = Array.isArray(company?.jobs) ? company.jobs : [];
    const tagsHtml = tags
      .filter(Boolean)
      .map(tag => `<span class="ml-popup__chip">${tag}</span>`)
      .join("");
    const jobsHtml = jobs
      .map(job => {
        const title = job?.title || "Vaga";
        const type = job?.type
          ? `<span class="ml-popup__job-type">${job.type}</span>`
          : "";
        const display = `<span class="ml-popup__job-name">${title}</span>`;
        if (job?.url) {
          return `<li class="ml-popup__job"><a href="${job.url}" target="_blank" rel="noopener">${display}${type}</a></li>`;
        }
        return `<li class="ml-popup__job"><span class="ml-popup__job-static">${display}${type}</span></li>`;
      })
      .join("");
    const badgeText = company?.is_hiring ? "Contratando" : "Sem vagas";
    const badgeClass = company?.is_hiring
      ? "ml-popup__badge--open"
      : "ml-popup__badge--closed";
    const addressParts = [
      company?.address ? company.address : "",
      [company?.city, company?.state].filter(Boolean).join(" - ")
    ].filter(Boolean);
    const address = addressParts.join(" · ");
    const website = company?.website
      ? company.website.replace(/^https?:\/\//, "")
      : "";
    const name = company?.name || "Empresa";
    const ariaLabel = name.replace(/"/g, "&quot;");
    const initials = name.trim().charAt(0).toUpperCase() || "M";
    const logo = company?.logo
      ? `<img src="${company.logo}" alt="${ariaLabel}" class="ml-popup__logo">`
      : `<span class="ml-popup__logo ml-popup__logo--placeholder">${initials}</span>`;
    const vagasUrl = location.pathname.includes("/pages/")
      ? "tabelavagas.html"
      : "pages/tabelavagas.html";
    return `
      <article class="ml-popup" role="group" aria-label="${ariaLabel}">
        <header class="ml-popup__header">
          <div class="ml-popup__avatar">${logo}</div>
          <div class="ml-popup__headline">
            <h3 class="ml-popup__title">${name}</h3>
            ${company?.industry || company?.sector ? `<p class="ml-popup__subtitle">${company?.industry ?? company?.sector ?? ""}</p>` : ""}
          </div>
          <span class="ml-popup__badge ${badgeClass}">${badgeText}</span>
        </header>
        <div class="ml-popup__body">
          ${address ? `<p class="ml-popup__text">${address}</p>` : ""}
          ${website ? `<a class="ml-popup__link" href="${company.website}" target="_blank" rel="noopener">${website}</a>` : ""}
          ${tagsHtml ? `<div class="ml-popup__chips">${tagsHtml}</div>` : ""}
        </div>
        ${jobsHtml ? `<div class="ml-popup__jobs"><p class="ml-popup__jobs-title">Vagas em destaque</p><ul class="ml-popup__jobs-list">${jobsHtml}</ul></div>` : ""}
        <footer class="ml-popup__footer">
          <a href="${vagasUrl}" class="ml-popup__cta">Ver vagas</a>
        </footer>
      </article>
    `;
  }

  function clearMarkers() {
    if (markersLayer) markersLayer.clearLayers();
  }

  function addMarkers(list) {
    if (!markersLayer || !Array.isArray(list)) return;
    const bounds = [];
    list.forEach(company => {
      const coords = getCoords(company);
      if (!coords) return;
      const marker = L.marker(coords);
      marker.bindPopup(popupHtml(company), { className: "ml-popup-wrapper" });
      markersLayer.addLayer(marker);
      bounds.push(coords);
    });
    if (bounds.length) {
      try {
        map.fitBounds(bounds, { padding: [24, 24] });
      } catch {
        /* noop */
      }
    }
  }

  function renderHeat(list, on) {
    if (!window.L?.heatLayer) return;
    if (heatLayer) {
      heatLayer.remove();
      heatLayer = null;
    }
    if (!on) return;
    const points = (list || [])
      .map(company => {
        const coords = getCoords(company);
        return coords ? [coords[0], coords[1], 1] : null;
      })
      .filter(Boolean);
    if (!points.length) return;
    heatLayer = L.heatLayer(points, {
      radius: 36,
      blur: 24,
      maxZoom: 17,
      minOpacity: 0.25
    });
    heatLayer.addTo(map);
  }

  function applyAndRender(filters = {}) {
    const merged = { ...currentFilters, ...filters };

    Object.keys(merged).forEach(key => {
      const value = merged[key];
      const isNullish = value === null || value === undefined;
      const isString = typeof value === "string";
      const trimmed = isString ? value.trim() : value;
      const isEmptyString = isString && trimmed === "";
      const isArray = Array.isArray(value);
      const filteredArray = isArray ? value.filter(Boolean) : null;
      const isEmptyArray = isArray && filteredArray.length === 0;

      if (isNullish || isEmptyString || isEmptyArray) {
        delete merged[key];
      } else if (isArray) {
        merged[key] = filteredArray;
      } else if (isString) {
        merged[key] = trimmed;
      }
    });

    currentFilters = merged;

    const source = Array.isArray(window.__companies) ? window.__companies : [];
    const result = window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(source, currentFilters)
      : source;

    currentResults = result;
    clearMarkers();
    addMarkers(result);
    renderHeat(result, heatEnabled);
    updateFilterIndicator();
    return result;
  }

  if (!map) {
    map = L.map(mapElement, { scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }

  async function fetchCompanies() {
    const dataUrl = location.pathname.includes("/pages/")
      ? "../assets/data/companies.json"
      : "assets/data/companies.json";
    try {
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar companies.json");
      return await response.json();
    } catch {
      return Array.isArray(window.__companies) ? window.__companies : [];
    }
  }

  const companies = await fetchCompanies();
  window.__companies = companies;

  const initial = window.MapsFilters?.filterCompanies
    ? window.MapsFilters.filterCompanies(companies, {})
    : companies;

  currentResults = initial;
  addMarkers(initial);
  renderHeat(initial, heatEnabled);
  updateFilterIndicator();

  window.applyFilters = filters => applyAndRender(filters);
  window.setFilters = filters => applyAndRender(filters);
  window.getFilterOptions = () => {
    return window.MapsFilters?.buildFilterOptions
      ? window.MapsFilters.buildFilterOptions(window.__companies || [])
      : {
          industries: [],
          sizes: [],
          workModes: []
        };
  };
  window.resetMap = function () {
    currentFilters = {};
    heatEnabled = false;
    clearMarkers();
    const all = window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(window.__companies || [], {})
      : window.__companies || [];
    currentResults = all;
    addMarkers(all);
    renderHeat(all, heatEnabled);
    updateFilterIndicator();
    if (filterPanelOpen) {
      renderFilterPanel();
    }
  };
})(); 
