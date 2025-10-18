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
  }

  function addMarkers(list) {
    if (!markersLayer || !Array.isArray(list)) return;
    const bounds = [];
    list.forEach(c => {
      const coords = getCoords(c);
      if (!coords) return;
      const marker = L.marker(coords);
      marker.bindPopup(popupHtml(c), { className: "ml-popup-wrapper" });
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
