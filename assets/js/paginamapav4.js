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
    painelFiltros.hidden = !mqDrawer.matches ? false : true;
    painelFiltros.classList.remove("is-open");
    btnFiltro?.setAttribute("aria-expanded", "false");
    if (overlay) overlay.remove();
    overlay = null;
    document.documentElement.style.removeProperty("overflow");
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
    const t = (Array.isArray(c?.tags) ? c.tags : []).join(", ");
    const jobs = (Array.isArray(c?.jobs) ? c.jobs : [])
      .map(
        (j) =>
          `<li><a href="${j.url}" target="_blank" rel="noopener">${j.title} (${j.type})</a></li>`
      )
      .join("");
    const hiring = c?.is_hiring
      ? `<span style="padding:.2rem .5rem;border-radius:9999px;background:#16a34a;color:#fff;font-size:.75rem;">Contratando</span>`
      : `<span style="padding:.2rem .5rem;border-radius:9999px;background:#94a3b8;color:#fff;font-size:.75rem;">Sem vagas</span>`;
    const logo = c?.logo
      ? `<img src="${c.logo}" alt="${c.name || ""}" style="height:28px;width:auto;display:block;margin-bottom:8px;">`
      : "";
    const site = c?.website
      ? `<a href="${c.website}" target="_blank" rel="noopener">${c.website.replace(/^https?:\/\//, "")}</a>`
      : "";
    return `
      <div style="min-width:220px;max-width:280px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;">
        ${logo}
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <strong style="font-size:14px;line-height:1.2">${c?.name || ""}</strong>
          ${hiring}
        </div>
        <div style="font-size:12px;color:#334155;margin-top:4px">${c?.industry ?? c?.sector ?? ""}</div>
        <div style="font-size:12px;color:#475569;margin:6px 0">${c?.address ? c.address + " · " : ""}${c?.city || ""}${c?.state ? " - " + c.state : ""}</div>
        ${site ? `<div style="font-size:12px;margin:6px 0">${site}</div>` : ""}
        ${t ? `<div style="font-size:12px;color:#0f172a;margin:6px 0">Tags: ${t}</div>` : ""}
        ${jobs ? `<ul style="padding-left:18px;margin:6px 0 0 0;font-size:12px">${jobs}</ul>` : ""}
      </div>
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
      marker.bindPopup(popupHtml(c));
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
