const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const DEFAULT_VIEW = { center: [-22.909938, -47.062633], zoom: 12 };
const MAP_STORAGE_KEY = 'mapslink:view';

const toFilterPayload = raw => ({
  region: (raw.region || '').trim().toLowerCase(),
  areas: Array.isArray(raw.areas) ? raw.areas.slice() : [],
  porte: Array.isArray(raw.porte) ? raw.porte.slice() : [],
  modalities: Array.isArray(raw.modalities) ? raw.modalities.slice() : [],
  openOnly: !!raw.openOnly,
  heat: !!raw.heat
});

const hasActiveFilters = filters => {
  if (!filters) return false;
  return Boolean(
    filters.region ||
    filters.openOnly ||
    filters.areas.length ||
    filters.porte.length ||
    filters.modalities.length
  );
};

const buildFilterPanel = () => {
  const panel = qs('#filterPanel');
  const toggleBtn = qs('.filter-toggle');
  if (!panel || !toggleBtn || panel.dataset.hydrated) return { panel: null, toggleBtn: null };

  panel.innerHTML = `
    <div class="fp">
      <header class="fp-header">
        <strong class="fp-title">Filtros</strong>
        <button id="closeFilters" type="button" aria-label="Fechar painel" class="fp-close">&times;</button>
      </header>

      <div class="fp-group">
        <span class="fp-subtle">Cidade, estado ou regiao</span>
        <label class="fp-input" aria-label="Cidade, estado ou regiao">
          <i class="ri-map-pin-2-line" aria-hidden="true"></i>
          <input type="text" id="f-region" placeholder="Ex.: Campinas, SP" />
        </label>
      </div>

      <div class="fp-section">
        <div class="fp-heading">Area de atuacao</div>
        <div class="fp-checklist">
          <label class="fp-check"><input type="checkbox" data-filter="ti"><span>Tecnologia</span></label>
          <label class="fp-check"><input type="checkbox" data-filter="health"><span>Saude</span></label>
          <label class="fp-check"><input type="checkbox" data-filter="edu"><span>Educacao</span></label>
          <label class="fp-check"><input type="checkbox" data-filter="mkt"><span>Marketing</span></label>
          <label class="fp-check"><input type="checkbox" data-filter="sales"><span>Vendas</span></label>
        </div>
      </div>

      <div class="fp-section">
        <div class="fp-heading">Porte da empresa</div>
        <div class="fp-pills" role="group" aria-label="Porte da empresa">
          <button type="button" class="pill" data-porte="small">Pequena</button>
          <button type="button" class="pill" data-porte="medium">Media</button>
          <button type="button" class="pill" data-porte="large">Grande</button>
          <button type="button" class="pill" data-porte="startup">Startup</button>
        </div>
      </div>

      <div class="fp-section">
        <div class="fp-heading">Modalidade de trabalho</div>
        <div class="fp-pills" role="group" aria-label="Modalidade de trabalho">
          <button type="button" class="pill" data-modal="presencial">Presencial</button>
          <button type="button" class="pill" data-modal="hibrido">Hibrido</button>
          <button type="button" class="pill" data-modal="remoto">Remoto</button>
        </div>
      </div>

      <div class="fp-switch-row">
        <span>Apenas com vagas abertas</span>
        <label class="fp-switch"><input type="checkbox" id="f-openings"><span class="fp-slider"></span></label>
      </div>
      <div class="fp-switch-row">
        <span>Mapa de calor</span>
        <label class="fp-switch"><input type="checkbox" id="f-heat"><span class="fp-slider"></span></label>
      </div>

      <button id="applyFilters" type="button" class="fp-apply">Aplicar filtros</button>
    </div>
  `;
  panel.dataset.hydrated = '1';

  panel.addEventListener('click', event => {
    const target = event.target;
    if (target.classList?.contains('pill')) target.classList.toggle('active');
  });

  return { panel, toggleBtn };
};

const setupFilterInteractions = (panel, toggleBtn, mapReady, appliedFiltersRef) => {
  if (!panel || !toggleBtn) return;

  const closePanel = () => {
    panel.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  const openPanel = () => {
    panel.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    panel.focus?.();
  };

  const readFilters = () => {
    const region = qs('#f-region', panel)?.value || '';
    const areas = qsa('input[data-filter]:checked', panel).map(input => input.dataset.filter);
    const porte = qsa('.pill[data-porte].active', panel).map(pill => pill.dataset.porte);
    const modalities = qsa('.pill[data-modal].active', panel).map(pill => pill.dataset.modal);
    const openOnly = qs('#f-openings', panel)?.checked || false;
    const heat = qs('#f-heat', panel)?.checked || false;
    return toFilterPayload({ region, areas, porte, modalities, openOnly, heat });
  };

  const escapeListener = event => {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  };

  toggleBtn.addEventListener('click', () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });

  panel.addEventListener('click', event => {
    if (event.target.id === 'closeFilters') closePanel();
  });

  document.addEventListener('keydown', escapeListener);
  document.addEventListener('click', event => {
    if (!panel.hidden && !panel.contains(event.target) && event.target !== toggleBtn) closePanel();
  });

  const applyBtn = qs('#applyFilters', panel);
  applyBtn?.addEventListener('click', () => {
    const nextFilters = readFilters();
    appliedFiltersRef.current = nextFilters;
    toggleBtn.classList.toggle('applied', hasActiveFilters(nextFilters));
    mapReady.then(controller => controller?.applyFilters?.(nextFilters));
    closePanel();
  });
};

const loadLeafletAssets = async () => {
  const inject = el =>
    new Promise((resolve, reject) => {
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });

  await inject(Object.assign(document.createElement('link'), {
    rel: 'stylesheet',
    href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  }));
  await inject(Object.assign(document.createElement('script'), {
    src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  }));
  await inject(Object.assign(document.createElement('script'), {
    src: 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js'
  }));
};

const initFullMap = async () => {
  const mapContainer = qs('#map');
  if (!mapContainer) return null;

  await loadLeafletAssets();

  const savedView = (() => {
    try {
      return JSON.parse(localStorage.getItem(MAP_STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  })();

  const startView = savedView || DEFAULT_VIEW;

  const map = L.map('map', { zoomControl: false }).setView(startView.center, startView.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  map.on('moveend', () => {
    const center = map.getCenter();
    localStorage.setItem(
      MAP_STORAGE_KEY,
      JSON.stringify({ center: [center.lat, center.lng], zoom: map.getZoom() })
    );
  });

  const locateBtn = L.control({ position: 'topright' });
  locateBtn.onAdd = () => {
    const button = L.DomUtil.create('button', '');
    button.type = 'button';
    button.title = 'Minha localizacao (g)';
    button.setAttribute('aria-label', 'Minha localizacao');
    button.style.cssText =
      'margin:6px;padding:8px;border-radius:9999px;border:1px solid rgba(0,0,0,0.25);background:#fff;cursor:pointer';
    button.textContent = 'GPS';
    button.addEventListener('click', () => geoLocate());
    return button;
  };
  locateBtn.addTo(map);

  const allCompanies = Array.isArray(window.mapsLinkCompanies)
    ? window.mapsLinkCompanies.map(company => ({
        ...company,
        nameLower: company.name.toLowerCase(),
        addressLower: (company.address || '').toLowerCase(),
        cityLower: (company.city || '').toLowerCase()
      }))
    : [];

  const markersLayer = L.layerGroup().addTo(map);
  const markerById = new Map();
  let customMarker = null;
  let heatLayer = null;
  let filteredCompanies = allCompanies.slice();
  let activeFilters = toFilterPayload({});

  const heatOptions = {
    radius: 36,
    blur: 24,
    maxZoom: 17,
    minOpacity: 0.25,
    max: Math.max(20, Math.max(1, allCompanies.length) * 3),
    gradient: {
      0.0: '#59ee90ff',
      0.25: '#1eff00ff',
      0.5: '#eab308',
      0.75: '#f97316',
      1.0: '#ef4444'
    }
  };

  const pulseCss = `
    .pulse-dot{position:relative;width:14px;height:14px;border-radius:50%;background:#ff3b30;border:2px solid #fff;box-shadow:0 0 0 2px rgba(255,59,48,0.35)}
    .pulse-dot::after{content:"";position:absolute;inset:-6px;border:2px solid rgba(255,59,48,0.65);border-radius:50%;animation:pulse 1.6s ease-out infinite}
    @keyframes pulse{0%{transform:scale(0.5);opacity:0.9}70%{transform:scale(1.6);opacity:0}100%{opacity:0}}
  `;
  const styleTag = document.createElement('style');
  styleTag.textContent = pulseCss;
  document.head.appendChild(styleTag);

  const addPulseMarker = (coords, popupText) => {
    if (!coords) return null;
    const icon = L.divIcon({ className: 'pulse-dot', html: '', iconSize: [14, 14] });
    const marker = L.marker(coords, { icon }).addTo(map);
    if (popupText) marker.bindPopup(popupText).openPopup();
    return marker;
  };

  const geoLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      map.flyTo(coords, 15, { duration: 0.8 });
      if (customMarker) map.removeLayer(customMarker);
      customMarker = addPulseMarker(coords, 'Voce esta aqui');
    });
  };

  const matchesFilters = company => {
    const region = activeFilters.region;
    if (region) {
      const inRegion = company.addressLower.includes(region) || company.cityLower.includes(region);
      if (!inRegion) return false;
    }
    if (activeFilters.openOnly && company.status !== 'open') return false;
    if (activeFilters.areas.length) {
      const ok = (company.areas || []).some(area => activeFilters.areas.includes(area));
      if (!ok) return false;
    }
    if (activeFilters.porte.length && !activeFilters.porte.includes(company.porte)) return false;
    if (activeFilters.modalities.length) {
      const ok = (company.modalities || []).some(mode => activeFilters.modalities.includes(mode));
      if (!ok) return false;
    }
    return true;
  };

  const updateHeatLayer = () => {
    if (heatLayer) {
      map.removeLayer(heatLayer);
      heatLayer = null;
    }
    if (!activeFilters.heat || !L.heatLayer) return;
    if (!filteredCompanies.length) return;
    const points = filteredCompanies.map(company => [company.coords[0], company.coords[1], 1]);
    heatLayer = L.heatLayer(points, heatOptions).addTo(map);
  };

  const render = () => {
    markersLayer.clearLayers();
    markerById.clear();
    filteredCompanies = allCompanies.filter(matchesFilters);

    const addedMarkers = filteredCompanies.map(company => {
      const marker = L.marker(company.coords);
      const statusLabel = company.status === 'open' ? 'Vagas abertas' : 'Sem vagas no momento';
      marker.bindPopup(`
        <strong>${company.name}</strong><br>
        ${company.address}<br>
        ${statusLabel}
      `);
      markersLayer.addLayer(marker);
      markerById.set(company.id, marker);
      return marker;
    });

    if (addedMarkers.length) {
      const group = L.featureGroup(addedMarkers);
      map.fitBounds(group.getBounds().pad(0.25));
    } else {
      map.setView(startView.center, startView.zoom);
    }

    updateHeatLayer();
  };

  render();

  document.addEventListener('keydown', event => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;
    if (event.key === '/') {
      event.preventDefault();
      qs('#search')?.focus();
    }
    if (event.key.toLowerCase() === 'f') qs('.filter-toggle')?.click();
    if (event.key.toLowerCase() === 'g') geoLocate();
  });

  document.addEventListener('fullscreenchange', () => {
    setTimeout(() => map.invalidateSize(), 200);
  });

  return {
    applyFilters(nextFilters) {
      activeFilters = toFilterPayload(nextFilters || {});
      render();
      return filteredCompanies.length;
    },
    focusCompany(query) {
      const normalized = (query || '').toLowerCase();
      if (!normalized) return false;
      const company =
        filteredCompanies.find(item => item.nameLower.includes(normalized)) ||
        allCompanies.find(item => item.nameLower.includes(normalized));
      if (!company) return false;
      map.flyTo(company.coords, 15, { duration: 0.8 });
      const marker = markerById.get(company.id);
      if (marker) marker.openPopup();
      else {
        if (customMarker) map.removeLayer(customMarker);
        customMarker = addPulseMarker(company.coords, company.name);
      }
      return true;
    },
    showGeocodeResult(lat, lon, label) {
      const coords = [lat, lon];
      map.flyTo(coords, 16, { duration: 0.9 });
      if (customMarker) map.removeLayer(customMarker);
      customMarker = addPulseMarker(coords, label);
    }
  };
};

const mapReady = initFullMap();

(() => {
  const appliedFiltersRef = { current: toFilterPayload({}) };
  const { panel, toggleBtn } = buildFilterPanel();
  setupFilterInteractions(panel, toggleBtn, mapReady, appliedFiltersRef);
})();

(() => {
  const form = qs('.search-bar');
  const input = qs('#search');
  if (!form || !input) return;

  const geocode = async query => {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'br');
    const response = await fetch(url.toString(), { headers: { 'Accept-Language': 'pt-BR' } });
    if (!response.ok) throw new Error('Falha na busca');
    const data = await response.json();
    return data[0];
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    const handled = await mapReady.then(controller => controller?.focusCompany?.(query));
    if (handled) {
      input.value = '';
      return;
    }

    form.classList.add('loading');
    try {
      const hit = await geocode(query);
      if (!hit) return;
      const lat = parseFloat(hit.lat);
      const lon = parseFloat(hit.lon);
      mapReady.then(controller => controller?.showGeocodeResult?.(lat, lon, hit.display_name));
    } catch (err) {
      console.warn(err);
    } finally {
      form.classList.remove('loading');
      input.value = '';
    }
  });
})();
