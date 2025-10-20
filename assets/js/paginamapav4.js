(() => {
  "use strict";

  if (window.__ml_mapv4_init__) return;
  window.__ml_mapv4_init__ = true;

  const btnFiltro = document.getElementById("btnFiltro");
  const painelFiltros = document.getElementById("painelFiltros");
  const layout = document.querySelector(".maps-layout");
  const mqDrawer = window.matchMedia("(max-width: 1200px)");
  const listEl = document.querySelector(".cards-empresas");
  const searchInput = document.querySelector('.busca-mapa input[name="q"]');
  const vagasToggle = document.querySelector(".linha-toggle .toggle");
  const heatToggle = document.getElementById("toggleHeat");
  const mapEl = document.getElementById("map");

  if (!mapEl) return;
  if (typeof window.L === "undefined") return;

  let overlay = null,
    map,
    markersLayer,
    markerById = new Map(),
    heatLayer = null,
    currentFilters = {},
    currentList = [];

  function ensureDesktopState() {
    if (!painelFiltros) return;
    const isDrawer = mqDrawer.matches;
    painelFiltros.classList.remove("is-open");
    btnFiltro?.setAttribute("aria-expanded", "false");
    btnFiltro?.classList.remove("is-active");
    if (overlay) overlay.remove();
    overlay = null;
    document.documentElement.style.removeProperty("overflow");
    if (isDrawer) {
      painelFiltros.hidden = true;
      layout?.classList.remove("filters-closed");
    } else {
      painelFiltros.hidden = false;
      if (layout && !layout.classList.contains("filters-closed")) {
        layout.classList.add("filters-closed");
      }
    }
  }

  function createOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(15,23,42,0.28)";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.28s ease";
    overlay.style.zIndex = "998";
    overlay.addEventListener("click", closeDrawer, { once: false });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => (overlay.style.opacity = "1"));
    return overlay;
  }

  function openDrawer() {
    if (!painelFiltros) return;
    painelFiltros.hidden = mqDrawer.matches ? true : false;
    painelFiltros.classList.add("is-open");
    btnFiltro?.setAttribute("aria-expanded", "true");
    btnFiltro?.classList.add("is-active");
    if (mqDrawer.matches) {
      createOverlay();
      document.documentElement.style.overflow = "hidden";
    }
  }

  function closeDrawer() {
    if (!painelFiltros) return;
    painelFiltros.classList.remove("is-open");
    btnFiltro?.setAttribute("aria-expanded", "false");
    btnFiltro?.classList.remove("is-active");
    if (overlay) overlay.style.opacity = "0";
    const handler = () => {
      if (!painelFiltros.classList.contains("is-open")) {
        painelFiltros.hidden = true;
        if (overlay) overlay.remove();
        overlay = null;
        document.documentElement.style.removeProperty("overflow");
      }
    };
    painelFiltros.addEventListener("transitionend", handler, { once: true });
  }

  if (btnFiltro && painelFiltros) {
    btnFiltro.addEventListener("click", () => {
      if (mqDrawer.matches) {
        if (painelFiltros.classList.contains("is-open")) closeDrawer();
        else openDrawer();
      } else if (layout) {
        const wasClosed = layout.classList.toggle("filters-closed");
        const expanded = !wasClosed;
        btnFiltro.setAttribute("aria-expanded", String(expanded));
        btnFiltro.classList.toggle("is-active", expanded);
        if (expanded) {
          painelFiltros.classList.add("filters-opening");
          setTimeout(() => painelFiltros.classList.remove("filters-opening"), 400);
        }
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && painelFiltros.classList.contains("is-open")) closeDrawer();
    });
  }

  if (layout) {
    layout.addEventListener("transitionend", (e) => {
      if (e.propertyName === "grid-template-columns") window._leafletMap?.invalidateSize();
    });
  }

  function getCoords(c) {
    const k = c?.coordinates || c?.location || {};
    const lat = Number(k.lat),
      lng = Number(k.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }

  function popupHtml(c) {
    const tags = Array.isArray(c?.tags) ? c.tags : [];
    const jobs = Array.isArray(c?.jobs) ? c.jobs : [];
    const tagsHtml = tags
      .filter(Boolean)
      .map((tag) => `<span class="ml-popup__chip">${tag}</span>`)
      .join("");
    const jobsHtml = jobs
      .map((j) => {
        const jobTitle = j?.title || "Vaga";
        const jobType = j?.type
          ? `<span class="ml-popup__job-type">${j.type}</span>`
          : "";
        const jobName = `<span class="ml-popup__job-name">${jobTitle}</span>`;
        if (j?.url) {
          return `<li class="ml-popup__job"><a href="${j.url}" target="_blank" rel="noopener">${jobName}${jobType}</a></li>`;
        }
        return `<li class="ml-popup__job"><span class="ml-popup__job-static">${jobName}${jobType}</span></li>`;
      })
      .join("");
    const badgeText = c?.is_hiring ? "Contratando" : "Sem vagas";
    const badgeClass = c?.is_hiring ? "ml-popup__badge--open" : "ml-popup__badge--closed";
    const addressParts = [
      c?.address ? c.address : "",
      [c?.city, c?.state].filter(Boolean).join(" - "),
    ].filter(Boolean);
    const address = addressParts.join(" · ");
    const website = c?.website ? c.website.replace(/^https?:\/\//, "") : "";
    const name = c?.name || "Empresa";
    const ariaLabel = name.replace(/"/g, "&quot;");
    const initials = name.trim().charAt(0).toUpperCase() || "M";
    const logo = c?.logo
      ? `<img src="${c.logo}" alt="${ariaLabel}" class="ml-popup__logo">`
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
            ${c?.industry || c?.sector ? `<p class="ml-popup__subtitle">${c?.industry ?? c?.sector ?? ""}</p>` : ""}
          </div>
          <span class="ml-popup__badge ${badgeClass}">${badgeText}</span>
        </header>
        <div class="ml-popup__body">
          ${address ? `<p class="ml-popup__text">${address}</p>` : ""}
          ${website ? `<a class="ml-popup__link" href="${c.website}" target="_blank" rel="noopener">${website}</a>` : ""}
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
    markerById.clear();
  }

  function addMarkers(list) {
    if (!markersLayer || !Array.isArray(list)) return;
    const bounds = [];
    list.forEach((c) => {
      const coords = getCoords(c);
      if (!coords) return;
      const marker = L.marker(coords);
      marker.bindPopup(popupHtml(c), { className: "ml-popup-wrapper" });
      markersLayer.addLayer(marker);
      markerById.set(c.id || c.name, marker);
      bounds.push(coords);
    });
    if (bounds.length) {
      try { map.fitBounds(bounds, { padding: [24, 24] }); } catch {}
    }
  }

  function renderList(list) {
    if (!listEl) return;
    listEl.innerHTML = (list || [])
      .map((c) => {
        const hiringCls = c.is_hiring ? "aberta" : "fechada";
        const hiringTxt = c.is_hiring ? "Vagas Abertas" : "Vagas Fechadas";
        return `
        <li class="card-empresa" data-id="${c.id}">
          <span class="badge-vagas ${hiringCls}"><i class="ri-briefcase-2-${c.is_hiring ? "fill" : "line"}"></i> ${hiringTxt}</span>
          <h3 class="empresa-nome">${c.name}</h3>
          <p class="empresa-endereco">${c.address ? c.address + " - " : ""}${c.city || ""}${c.state ? ", " + c.state : ""}</p>
          <button class="btn-detalhes" type="button">Mais detalhes</button>
        </li>
      `;
      })
      .join("");

    listEl.querySelectorAll(".card-empresa .btn-detalhes").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const li = e.currentTarget.closest(".card-empresa");
        const id = li?.getAttribute("data-id");
        const m = markerById.get(id);
        if (m) {
          const p = m.getLatLng();
          map.setView(p, Math.max(map.getZoom(), 15));
          m.openPopup();
        }
      });
    });
  }

  function renderHeat(list, on) {
    if (!L.heatLayer) return;
    if (heatLayer) {
      heatLayer.remove();
      heatLayer = null;
    }
    if (!on) return;
    const points = (list || [])
      .map((c) => {
        const coords = getCoords(c);
        return coords ? [coords[0], coords[1], 1] : null;
      })
      .filter(Boolean);
    if (!points.length) return;
    heatLayer = L.heatLayer(points, {
      radius: 36,
      blur: 24,
      maxZoom: 17,
      minOpacity: 0.25,
      max: Math.max(20, Math.max(1, points.length) * 3),
    });
    heatLayer.addTo(map);
  }

  function applyAndRender(filters) {
    currentFilters = { ...currentFilters, ...(filters || {}) };
    const source = Array.isArray(window.__companies) ? window.__companies : [];
    const result = window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(source, currentFilters)
      : source;
    currentList = result;
    clearMarkers();
    addMarkers(result);
    renderList(result);
    const on = heatToggle && heatToggle.getAttribute("aria-pressed") === "true";
    renderHeat(result, on);
    return result;
  }

  async function fetchCompanies() {
    const dataUrl = location.pathname.includes("/pages/")
      ? "../assets/data/companies.json"
      : "assets/data/companies.json";
    try {
      const res = await fetch(dataUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao carregar companies.json");
      return await res.json();
    } catch {
      return Array.isArray(window.__companies) ? window.__companies : [];
    }
  }

  (async () => {
    const companies = await fetchCompanies();
    window.__companies = companies;

    map = L.map(mapEl, { scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    window._leafletMap = map; 

    currentList = window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(window.__companies, {})
      : (window.__companies || []);
    addMarkers(currentList);
    renderList(currentList);

    window.applyFilters = function (f) { return applyAndRender(f); };
    window.setFilters = function (f) { return applyAndRender(f); };
    window.getFilterOptions = function () {
      return window.MapsFilters?.buildFilterOptions
        ? window.MapsFilters.buildFilterOptions(window.__companies || [])
        : { cities: [], states: [], industries: [], tags: [] };
    };
    window.resetMap = function () { currentFilters = {}; return applyAndRender({}); };
  })();

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value || "";
      applyAndRender({ q });
    });
  }
  if (vagasToggle) {
    vagasToggle.addEventListener("click", () => {
      const current = vagasToggle.getAttribute("aria-pressed") === "true";
      const next = !current;
      vagasToggle.setAttribute("aria-pressed", String(next));
      applyAndRender({ isHiring: next });
    });
  }
  if (heatToggle) {
    heatToggle.addEventListener("click", () => {
      const current = heatToggle.getAttribute("aria-pressed") === "true";
      const next = !current;
      heatToggle.setAttribute("aria-pressed", String(next));
      renderHeat(currentList, next);
    });
  }

  ensureDesktopState();
  mqDrawer.addEventListener("change", ensureDesktopState);

  const fullBtn = document.querySelector(".mapa-control.fullscreen");
  if (fullBtn) {
    fullBtn.addEventListener("click", () => {
      window.location.href = "mapacheio.html";
    });
  }
})();
