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

  const GEO_CACHE_PREFIX = "mapslink:geocode:";
  const GEO_CACHE_TTL = 1000 * 60 * 60 * 24 * 30;
  const geocodeQueue = new Map();

  function normalizeKey(value) {
    return (value || "").trim().toLowerCase();
  }

  function encodeKey(value) {
    const normalized = normalizeKey(value);
    if (!normalized) return "";
    try {
      return `${GEO_CACHE_PREFIX}${btoa(unescape(encodeURIComponent(normalized))).replace(/=+$/, "")}`;
    } catch {
      return `${GEO_CACHE_PREFIX}${encodeURIComponent(normalized)}`;
    }
  }

  function readGeocodeCache(address) {
    const key = encodeKey(address);
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data) return null;
      if (data.cachedAt && Date.now() - data.cachedAt > GEO_CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }
      const { cachedAt, ...value } = data;
      if (!Number.isFinite(value.lat) || !Number.isFinite(value.lng)) return null;
      return value;
    } catch {
      return null;
    }
  }

  function writeGeocodeCache(address, value) {
    const key = encodeKey(address);
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({ ...value, cachedAt: Date.now() }));
    } catch {}
  }

  function ownerJobsKey(owner) {
    return owner ? `mapslink:vagas:${owner}` : "";
  }

  function loadOwnerJobs(owner) {
    const key = ownerJobsKey(owner);
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function cleanJobs(list) {
    return (Array.isArray(list) ? list : [])
      .map(job => ({
        title: (job?.title || "").trim(),
        type: (job?.type || "").trim(),
        status: job?.status || "",
        url: job?.url || ""
      }))
      .filter(job => job.title.length);
  }

  function jobsAreOpen(list) {
    if (!list.length) return true;
    return list.some(job => !/fechad/i.test(job.status || ""));
  }

  function extractCityState(value) {
    if (!value) return { city: "", state: "" };
    const cleaned = value.replace(/\s+/g, " ").trim();
    if (!cleaned) return { city: "", state: "" };
    const stateMatch = cleaned.match(/\b([A-Z]{2})\b(?!.*\b[A-Z]{2}\b)/);
    const state = stateMatch ? stateMatch[1] : "";
    let city = "";
    if (state && stateMatch) {
      const before = cleaned
        .slice(0, stateMatch.index)
        .split(/[,|-]/)
        .map(part => part.trim())
        .filter(Boolean);
      city = before.pop() || "";
    } else {
      const parts = cleaned
        .split(/[,|-]/)
        .map(part => part.trim())
        .filter(Boolean);
      city = parts.length > 1 ? parts[parts.length - 1] : parts[0] || "";
    }
    return { city, state };
  }

  function normalizeCoords(raw) {
    if (!raw || typeof raw !== "object") return null;
    const lat = Number(raw.lat ?? raw.latitude);
    const lng = Number(raw.lng ?? raw.lon ?? raw.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  function buildCompanyFromUser(user) {
    if (!user) return null;
    const profile = user.profile || {};
    const contact = profile.contact || {};
    const locationMeta = typeof profile.location === "object" ? profile.location : {};
    const coords = normalizeCoords(locationMeta);
    const tags = Array.isArray(profile.tags) ? profile.tags.filter(Boolean) : [];
    const jobs = cleanJobs(loadOwnerJobs(user.id));
    const fallbackLocation = extractCityState(locationMeta.formatted || profile.headquarters || contact.address || "");
    const city = locationMeta.city || locationMeta.town || fallbackLocation.city || "";
    const state = locationMeta.state || locationMeta.region || fallbackLocation.state || "";
    const address = contact.address || locationMeta.formatted || profile.headquarters || "";
    const company = {
      id: user.id,
      name: user.company || user.name || "Empresa",
      industry: profile.sector || "",
      city,
      state,
      address,
      website: profile.site || contact.website || contact.site || "",
      logo: profile.avatar || "",
      tags,
      is_hiring: jobsAreOpen(jobs),
      jobs: jobs.slice(0, 4),
      coordinates: coords,
      source: "user"
    };
    return company;
  }

  function geocodeQuery(company) {
    if (!company) return "";
    const parts = [company.address, [company.city, company.state].filter(Boolean).join(", ")].filter(Boolean);
    return parts.join(", ").trim();
  }

  async function geocodeAddress(address) {
    const normalized = normalizeKey(address);
    if (!normalized) return null;
    const cached = readGeocodeCache(normalized);
    if (cached) return cached;
    if (geocodeQueue.has(normalized)) return geocodeQueue.get(normalized);
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(address)}`;
    const promise = fetch(url, {
      headers: { "Accept-Language": "pt-BR" }
    })
      .then(async response => {
        if (!response.ok) throw new Error(`Geocode HTTP ${response.status}`);
        const data = await response.json();
        const hit = Array.isArray(data) ? data[0] : null;
        if (!hit) return null;
        const lat = Number(hit.lat);
        const lng = Number(hit.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const result = {
          lat,
          lng,
          city:
            hit.address?.city ||
            hit.address?.town ||
            hit.address?.village ||
            hit.address?.municipality ||
            hit.address?.county ||
            "",
          state: hit.address?.state || hit.address?.region || hit.address?.state_district || "",
          formatted: hit.display_name || address
        };
        writeGeocodeCache(normalized, result);
        return result;
      })
      .catch(() => null)
      .finally(() => {
        geocodeQueue.delete(normalized);
      });
    geocodeQueue.set(normalized, promise);
    return promise;
  }

  async function ensureCompanyCoordinates(company) {
    if (!company) return null;
    const hasCoords = Number.isFinite(company?.coordinates?.lat) && Number.isFinite(company?.coordinates?.lng);
    if (hasCoords) return company;
    const query = geocodeQuery(company);
    if (!query) return company;
    const geo = await geocodeAddress(query);
    if (!geo) return company;
    company.coordinates = { lat: geo.lat, lng: geo.lng };
    if (!company.city && geo.city) company.city = geo.city;
    if (!company.state && geo.state) company.state = geo.state;
    if (!company.address && geo.formatted) company.address = geo.formatted;
    return company;
  }

  async function loadUserCompanies() {
    const auth = window.MapsAuth;
    if (!auth || typeof auth.ready !== "function") return [];
    try {
      const users = await auth.ready();
      const business = (Array.isArray(users) ? users : []).filter(user => user?.type === "business");
      const mapped = business.map(buildCompanyFromUser).filter(Boolean);
      const enriched = await Promise.all(mapped.map(company => ensureCompanyCoordinates(company)));
      return enriched.filter(Boolean);
    } catch {
      return [];
    }
  }

  function companyKey(company) {
    if (!company) return "";
    if (company.id) return `id:${company.id}`;
    const name = normalizeKey(company.name);
    return name ? `name:${name}` : "";
  }

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
      } catch {}
    }
  }

  function renderList(list) {
    if (!state.list) return;
    state.list.innerHTML = (list || [])
      .map(company => {
        const open = company.is_hiring;
        const cls = open ? "aberta" : "fechada";
        const text = open ? "Vagas Abertas" : "Vagas Fechadas";
        const segments = [];
        if (company.address) segments.push(company.address);
        const locality = [company.city, company.state].filter(Boolean).join(", ");
        if (locality) segments.push(locality);
        const address = segments.join(" - ") || "Endereco nao informado";
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

  async function fetchStaticCompanies() {
    const dataUrl = location.pathname.includes("/pages/") ? "../assets/data/companies.json" : "assets/data/companies.json";
    try {
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar companies.json");
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      window.__staticCompanies = list;
      return list;
    } catch {
      if (Array.isArray(window.__staticCompanies)) return window.__staticCompanies;
      if (Array.isArray(window.__companies)) {
        return window.__companies.filter(company => company?.source !== "user");
      }
      return [];
    }
  }

  async function fetchCompanies() {
    const [base, custom] = await Promise.all([fetchStaticCompanies(), loadUserCompanies()]);
    const seen = new Set();
    const merged = [];
    (custom || []).forEach(company => {
      if (!company) return;
      const key = companyKey(company);
      if (key) seen.add(key);
      merged.push(company);
    });
    (base || []).forEach(company => {
      if (!company) return;
      const key = companyKey(company);
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      merged.push(company);
    });
    return merged;
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
