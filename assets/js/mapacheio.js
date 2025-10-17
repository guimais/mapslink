(async function () {
  "use strict";

  if (!document.getElementById("map")) return;
  if (typeof window.L === "undefined") return;

  let map, markersLayer, currentFilters = {};

  function getCoords(c) {
    const k = c?.coordinates || c?.location || {};
    const lat = Number(k.lat), lng = Number(k.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }

  function popupHtml(c) {
    const t = (Array.isArray(c?.tags) ? c.tags : []).join(", ");
    const jobs = (Array.isArray(c?.jobs) ? c.jobs : [])
      .map(j => `<li><a href="${j.url}" target="_blank" rel="noopener">${j.title} (${j.type})</a></li>`)
      .join("");
    const hiring = c?.is_hiring
      ? `<span style="padding:.2rem .5rem;border-radius:9999px;background:#16a34a;color:#fff;font-size:.75rem;">Contratando</span>`
      : `<span style="padding:.2rem .5rem;border-radius:9999px;background:#94a3b8;color:#fff;font-size:.75rem;">Sem vagas</span>`;
    const logo = c?.logo ? `<img src="${c.logo}" alt="${c.name || ""}" style="height:28px;width:auto;display:block;margin-bottom:8px;">` : "";
    const site = c?.website ? `<a href="${c.website}" target="_blank" rel="noopener">${c.website.replace(/^https?:\/\//,"")}</a>` : "";
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
  }

  function addMarkers(list) {
    if (!markersLayer || !Array.isArray(list)) return;
    const bounds = [];
    list.forEach(c => {
      const coords = getCoords(c);
      if (!coords) return;
      const marker = L.marker(coords);
      marker.bindPopup(popupHtml(c));
      markersLayer.addLayer(marker);
      bounds.push(coords);
    });
    if (bounds.length) {
      try { map.fitBounds(bounds, { padding: [24, 24] }); } catch {}
    }
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

  function applyAndRender(filters) {
    currentFilters = { ...currentFilters, ...(filters || {}) };
    const source = Array.isArray(window.__companies) ? window.__companies : [];
    const result = (window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(source, currentFilters)
      : source);
    clearMarkers();
    addMarkers(result);
    return result;
  }

  if (!map) {
    map = L.map("map", { scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }

  const companies = await fetchCompanies();
  window.__companies = companies;

  const initial = window.MapsFilters?.filterCompanies
    ? window.MapsFilters.filterCompanies(companies, {})
    : companies;
  addMarkers(initial);

  window.applyFilters = function (filters) { return applyAndRender(filters); };
  window.setFilters = function (filters) { return applyAndRender(filters); };
  window.getFilterOptions = function () {
    return window.MapsFilters?.buildFilterOptions
      ? window.MapsFilters.buildFilterOptions(window.__companies || [])
      : { cities: [], states: [], industries: [], tags: [] };
  };
  window.resetMap = function () {
    clearMarkers();
    const all = window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(window.__companies || [], {})
      : (window.__companies || []);
    addMarkers(all);
    currentFilters = {};
  };
})();
