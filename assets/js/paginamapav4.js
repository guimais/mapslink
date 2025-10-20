(() => {
  if (window.__ml_mapv4_init__) return;
  window.__ml_mapv4_init__ = true;

  const L = window.L;
  const mapContainer = document.getElementById("map");
  if (!mapContainer || !L) return;

  const state = {
    panelButton: document.getElementById("btnFiltro"),
    panel: document.getElementById("painelFiltros"),
    layout: document.querySelector(".maps-layout"),
    mqDrawer: window.matchMedia("(max-width: 1200px)"),
    list: document.querySelector(".cards-empresas"),
    search: document.querySelector('.busca-mapa input[name="q"]'),
    vagasToggle: document.querySelector(".linha-toggle .toggle"),
    heatToggle: document.getElementById("toggleHeat"),
    overlay: null,
    map: null,
    markersLayer: null,
    markers: new Map(),
    heatLayer: null,
    filters: {},
    companies: [],
    filtered: []
  };

  function isDrawerMode() {
    return state.mqDrawer.matches;
  }

  function resetOverflow() {
    document.documentElement.style.removeProperty("overflow");
  }

  function ensureDesktopState() {
    if (!state.panel) return;
    state.panel.classList.remove("is-open");
    state.panel.hidden = isDrawerMode();
    if (!isDrawerMode()) state.panel.hidden = false;
    if (state.panelButton) {
      state.panelButton.setAttribute("aria-expanded", "false");
      state.panelButton.classList.remove("is-active");
    }
    if (state.layout) {
      if (isDrawerMode()) state.layout.classList.remove("filters-closed");
      else state.layout.classList.add("filters-closed");
    }
    if (state.overlay) {
      state.overlay.remove();
      state.overlay = null;
    }
    resetOverflow();
  }

  function createOverlay() {
    if (state.overlay) return state.overlay;
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(15,23,42,0.28)";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.28s ease";
    overlay.style.zIndex = "998";
    overlay.addEventListener("click", closeDrawer);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });
    state.overlay = overlay;
    return overlay;
  }

  function openDrawer() {
    if (!state.panel) return;
    state.panel.hidden = false;
    state.panel.classList.add("is-open");
    if (state.panelButton) {
      state.panelButton.setAttribute("aria-expanded", "true");
      state.panelButton.classList.add("is-active");
    }
    if (isDrawerMode()) {
      createOverlay();
      document.documentElement.style.overflow = "hidden";
    }
  }

  function closeDrawer() {
    if (!state.panel) return;
    state.panel.classList.remove("is-open");
    if (state.panelButton) {
      state.panelButton.setAttribute("aria-expanded", "false");
      state.panelButton.classList.remove("is-active");
    }
    if (state.overlay) state.overlay.style.opacity = "0";
    const onTransition = () => {
      if (state.panel.classList.contains("is-open")) return;
      if (isDrawerMode()) state.panel.hidden = true;
      if (state.overlay) {
        state.overlay.remove();
        state.overlay = null;
      }
      resetOverflow();
    };
    state.panel.addEventListener("transitionend", onTransition, { once: true });
  }

  function togglePanelDesktop() {
    if (!state.layout || !state.panelButton || !state.panel) return;
    const wasClosed = state.layout.classList.toggle("filters-closed");
    const expanded = !wasClosed;
    state.panelButton.setAttribute("aria-expanded", String(expanded));
    state.panelButton.classList.toggle("is-active", expanded);
    state.panel.hidden = !expanded;
    if (expanded) {
      state.panel.classList.add("filters-opening");
      setTimeout(() => state.panel.classList.remove("filters-opening"), 400);
    }
  }

  function coordsOf(company) {
    const raw = company?.coordinates || company?.location || {};
    const lat = Number(raw.lat);
    const lng = Number(raw.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }

  function popupTemplate(company) {
    const tags = Array.isArray(company?.tags) ? company.tags : [];
    const jobs = Array.isArray(company?.jobs) ? company.jobs : [];
    const tagsHtml = tags.filter(Boolean).map(tag => `<span class="ml-popup__chip">${tag}</span>`).join("");
    const jobsHtml = jobs
      .map(job => {
        const title = job?.title || "Vaga";
        const type = job?.type ? `<span class="ml-popup__job-type">${job.type}</span>` : "";
        const label = `<span class="ml-popup__job-name">${title}</span>`;
        if (job?.url) {
          return `<li class="ml-popup__job"><a href="${job.url}" target="_blank" rel="noopener">${label}${type}</a></li>`;
        }
        return `<li class="ml-popup__job"><span class="ml-popup__job-static">${label}${type}</span></li>`;
      })
      .join("");

    const hiring = company?.is_hiring;
    const badgeText = hiring ? "Contratando" : "Sem vagas";
    const badgeClass = hiring ? "ml-popup__badge--open" : "ml-popup__badge--closed";
    const addressParts = [
      company?.address || "",
      [company?.city, company?.state].filter(Boolean).join(" - ")
    ].filter(Boolean);
    const address = addressParts.join(" - ");
    const website = company?.website ? company.website.replace(/^https?:\/\//, "") : "";
    const name = company?.name || "Empresa";
    const aria = name.replace(/"/g, "&quot;");
    const initials = name.trim().charAt(0).toUpperCase() || "M";
    const logo = company?.logo
      ? `<img src="${company.logo}" alt="${aria}" class="ml-popup__logo">`
      : `<span class="ml-popup__logo ml-popup__logo--placeholder">${initials}</span>`;
    const vagasUrl = location.pathname.includes("/pages/") ? "tabelavagas.html" : "pages/tabelavagas.html";

    return `
      <article class="ml-popup" role="group" aria-label="${aria}">
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
    if (state.markersLayer) state.markersLayer.clearLayers();
    state.markers.clear();
  }

  function addMarkers(list) {
    if (!state.markersLayer || !Array.isArray(list)) return;
    const bounds = [];
    list.forEach(company => {
      const coords = coordsOf(company);
      if (!coords) return;
      const marker = L.marker(coords);
      marker.bindPopup(popupTemplate(company), { className: "ml-popup-wrapper" });
      state.markersLayer.addLayer(marker);
      state.markers.set(company.id || company.name, marker);
      bounds.push(coords);
    });
    if (bounds.length) {
      try {
        state.map.fitBounds(bounds, { padding: [24, 24] });
      } catch {
        /* no-op */
      }
    }
  }

  function renderList(list) {
    if (!state.list) return;
    state.list.innerHTML = (list || [])
      .map(company => {
        const open = company.is_hiring;
        const cls = open ? "aberta" : "fechada";
        const text = open ? "Vagas Abertas" : "Vagas Fechadas";
        const address = `${company.address ? `${company.address} - ` : ""}${company.city || ""}${company.state ? `, ${company.state}` : ""}`;
        return `
          <li class="card-empresa" data-id="${company.id}">
            <span class="badge-vagas ${cls}"><i class="ri-briefcase-2-${open ? "fill" : "line"}"></i> ${text}</span>
            <h3 class="empresa-nome">${company.name}</h3>
            <p class="empresa-endereco">${address}</p>
            <button class="btn-detalhes" type="button">Mais detalhes</button>
          </li>
        `;
      })
      .join("");

    state.list.querySelectorAll(".card-empresa .btn-detalhes").forEach(button => {
      button.addEventListener("click", event => {
        const card = event.currentTarget.closest(".card-empresa");
        const id = card?.getAttribute("data-id");
        const marker = state.markers.get(id);
        if (!marker) return;
        const point = marker.getLatLng();
        state.map.setView(point, Math.max(state.map.getZoom(), 15));
        marker.openPopup();
      });
    });
  }

  function renderHeat(list, enabled) {
    if (!L.heatLayer) return;
    if (state.heatLayer) {
      state.heatLayer.remove();
      state.heatLayer = null;
    }
    if (!enabled) return;
    const points = (list || [])
      .map(company => {
        const coords = coordsOf(company);
        return coords ? [coords[0], coords[1], 1] : null;
      })
      .filter(Boolean);
    if (!points.length) return;
    state.heatLayer = L.heatLayer(points, {
      radius: 36,
      blur: 24,
      maxZoom: 17,
      minOpacity: 0.25,
      max: Math.max(20, Math.max(1, points.length) * 3)
    });
    state.heatLayer.addTo(state.map);
  }

  function heatEnabled() {
    return !!(state.heatToggle && state.heatToggle.getAttribute("aria-pressed") === "true");
  }

  function applyFilters(nextFilters) {
    state.filters = { ...state.filters, ...(nextFilters || {}) };
    const source = Array.isArray(state.companies) ? state.companies : [];
    const filtered = window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(source, state.filters)
      : source;
    state.filtered = filtered;
    clearMarkers();
    addMarkers(filtered);
    renderList(filtered);
    renderHeat(filtered, heatEnabled());
    return filtered;
  }

  async function fetchCompanies() {
    const dataUrl = location.pathname.includes("/pages/") ? "../assets/data/companies.json" : "assets/data/companies.json";
    try {
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar companies.json");
      return await response.json();
    } catch {
      return Array.isArray(window.__companies) ? window.__companies : [];
    }
  }

  function exposeHelpers() {
    window.applyFilters = filters => applyFilters(filters);
    window.setFilters = filters => applyFilters(filters);
    window.getFilterOptions = () => {
      if (window.MapsFilters?.buildFilterOptions) {
        return window.MapsFilters.buildFilterOptions(state.companies || []);
      }
      return { cities: [], states: [], industries: [], tags: [] };
    };
    window.resetMap = () => {
      state.filters = {};
      return applyFilters({});
    };
  }

  function bindPanelControls() {
    if (!state.panel || !state.panelButton) return;
    state.panelButton.addEventListener("click", () => {
      if (isDrawerMode()) {
        if (state.panel.classList.contains("is-open")) closeDrawer();
        else openDrawer();
      } else {
        togglePanelDesktop();
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && state.panel.classList.contains("is-open")) closeDrawer();
    });
    if (state.layout) {
      state.layout.addEventListener("transitionend", event => {
        if (event.propertyName === "grid-template-columns") {
          window._leafletMap?.invalidateSize();
        }
      });
    }
  }

  function bindFilterControls() {
    if (state.search) {
      state.search.addEventListener("input", () => {
        applyFilters({ q: state.search.value || "" });
      });
    }
    if (state.vagasToggle) {
      state.vagasToggle.addEventListener("click", () => {
        const current = state.vagasToggle.getAttribute("aria-pressed") === "true";
        const next = !current;
        state.vagasToggle.setAttribute("aria-pressed", String(next));
        applyFilters({ isHiring: next });
      });
    }
    if (state.heatToggle) {
      state.heatToggle.addEventListener("click", () => {
        const current = state.heatToggle.getAttribute("aria-pressed") === "true";
        const next = !current;
        state.heatToggle.setAttribute("aria-pressed", String(next));
        renderHeat(state.filtered, next);
      });
    }
    const fullButton = document.querySelector(".mapa-control.fullscreen");
    if (fullButton) {
      fullButton.addEventListener("click", () => {
        window.location.href = "mapacheio.html";
      });
    }
  }

  async function init() {
    ensureDesktopState();
    state.mqDrawer.addEventListener("change", ensureDesktopState);
    bindPanelControls();
    bindFilterControls();

    state.companies = await fetchCompanies();
    window.__companies = state.companies;

    state.map = L.map(mapContainer, { scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(state.map);
    state.markersLayer = L.layerGroup().addTo(state.map);
    window._leafletMap = state.map;

    state.filtered = window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(state.companies, {})
      : (state.companies || []);
    addMarkers(state.filtered);
    renderList(state.filtered);

    exposeHelpers();
  }

  init();
})();
