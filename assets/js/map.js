(() => {
  if (!document.getElementById("map")) return;
  if (typeof window.L === "undefined") return;

  const state = {
    map: null,
    layer: null,
    filters: {},
    companies: []
  };

  function coords(company) {
    const source = company?.coordinates || company?.location || {};
    const lat = Number(source.lat);
    const lng = Number(source.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }

  function popup(company) {
    const tags = Array.isArray(company?.tags) ? company.tags.join(", ") : "";
    const jobs = Array.isArray(company?.jobs)
      ? company.jobs
          .map(job => {
            if (!job) return "";
            const title = job.title || "Vaga";
            const type = job.type ? ` (${job.type})` : "";
            const url = job.url ? ` href="${job.url}" target="_blank" rel="noopener"` : "";
            return `<li><a${url}>${title}${type}</a></li>`;
          })
          .join("")
      : "";
    const hiring = company?.is_hiring
      ? '<span style="padding:.2rem .5rem;border-radius:9999px;background:#16a34a;color:#fff;font-size:.75rem;">Contratando</span>'
      : '<span style="padding:.2rem .5rem;border-radius:9999px;background:#94a3b8;color:#fff;font-size:.75rem;">Sem vagas</span>';
    const logo = company?.logo
      ? `<img src="${company.logo}" alt="${company.name || ""}" style="height:28px;width:auto;display:block;margin-bottom:8px;">`
      : "";
    const website = company?.website
      ? `<div style="font-size:12px;margin:6px 0"><a href="${company.website}" target="_blank" rel="noopener">${company.website.replace(/^https?:\/\//, "")}</a></div>`
      : "";
    const addressParts = [company?.address, company?.city, company?.state].filter(Boolean);
    const address = addressParts.length ? addressParts.join(" - ") : "";

    return `
      <div style="min-width:220px;max-width:280px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;">
        ${logo}
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <strong style="font-size:14px;line-height:1.2">${company?.name || ""}</strong>
          ${hiring}
        </div>
        <div style="font-size:12px;color:#334155;margin-top:4px">${company?.industry ?? company?.sector ?? ""}</div>
        <div style="font-size:12px;color:#475569;margin:6px 0">${address}</div>
        ${website}
        ${tags ? `<div style="font-size:12px;color:#0f172a;margin:6px 0">Tags: ${tags}</div>` : ""}
        ${jobs ? `<ul style="padding-left:18px;margin:6px 0 0;font-size:12px">${jobs}</ul>` : ""}
      </div>
    `;
  }

  function clearMarkers() {
    state.layer?.clearLayers();
  }

  function renderMarkers(list) {
    if (!state.layer) return;
    const bounds = [];
    list.forEach(company => {
      const position = coords(company);
      if (!position) return;
      const marker = L.marker(position);
      marker.bindPopup(popup(company));
      state.layer.addLayer(marker);
      bounds.push(position);
    });
    if (bounds.length) {
      try {
        state.map.fitBounds(bounds, { padding: [24, 24] });
      } catch {}
    }
  }

  async function loadCompanies() {
    if (Array.isArray(window.__companies) && window.__companies.length) {
      state.companies = window.__companies;
      return state.companies;
    }
    const url = location.pathname.includes("/pages/")
      ? "../assets/data/companies.json"
      : "assets/data/companies.json";
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar companies.json");
      const data = await response.json();
      state.companies = Array.isArray(data) ? data : [];
      window.__companies = state.companies;
    } catch {
      state.companies = Array.isArray(window.__companies) ? window.__companies : [];
    }
    return state.companies;
  }

  function applyFilters(filters = {}) {
    state.filters = { ...state.filters, ...filters };
    const source = Array.isArray(state.companies) ? state.companies : [];
    const filtered = window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(source, state.filters)
      : source;
    clearMarkers();
    renderMarkers(filtered);
    return filtered;
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

  function initMap() {
    state.map = L.map("map", { scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(state.map);
    state.layer = L.layerGroup().addTo(state.map);
  }

  async function init() {
    initMap();
    await loadCompanies();
    const initial = window.MapsFilters?.filterCompanies
      ? window.MapsFilters.filterCompanies(state.companies, {})
      : state.companies;
    renderMarkers(initial);
    exposeHelpers();
  }

  init();
})();
