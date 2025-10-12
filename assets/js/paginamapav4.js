(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('is-open');
    });
  }

  const btnFiltro = document.getElementById('btnFiltro');
  const painelFiltros = document.getElementById('painelFiltros');
  const layout = document.querySelector('.maps-layout');
  const mqDrawer = window.matchMedia('(max-width: 1200px)');
  let overlay = null;

  const ensureDesktopState = () => {
    if (!painelFiltros) return;
    if (!mqDrawer.matches) {
      painelFiltros.hidden = false;
      painelFiltros.classList.remove('is-open');
      btnFiltro?.setAttribute('aria-expanded', 'false');
      if (overlay) overlay.remove();
      overlay = null;
      document.documentElement.style.removeProperty('overflow');
    } else {
      painelFiltros.hidden = true;
      painelFiltros.classList.remove('is-open');
      btnFiltro?.setAttribute('aria-expanded', 'false');
      if (overlay) overlay.remove();
      overlay = null;
      document.documentElement.style.removeProperty('overflow');
    }
  };

  const createOverlay = () => {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(15,23,42,0.28)';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.28s ease';
    overlay.style.zIndex = '998';
    overlay.addEventListener('click', closeDrawer);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => (overlay.style.opacity = '1'));
    return overlay;
  };

  const openDrawer = () => {
    if (!painelFiltros) return;
    if (mqDrawer.matches) painelFiltros.hidden = true;
    else painelFiltros.hidden = false;
    painelFiltros.classList.add('is-open');
    btnFiltro?.setAttribute('aria-expanded', 'true');
    btnFiltro?.classList.add('is-active');
    if (mqDrawer.matches) {
      createOverlay();
      document.documentElement.style.overflow = 'hidden';
    }
  };

  const closeDrawer = () => {
    if (!painelFiltros) return;
    painelFiltros.classList.remove('is-open');
    btnFiltro?.setAttribute('aria-expanded', 'false');
    btnFiltro?.classList.remove('is-active');
    if (overlay) overlay.style.opacity = '0';
    const handler = () => {
      if (!painelFiltros.classList.contains('is-open')) {
        painelFiltros.hidden = true;
        if (overlay) overlay.remove();
        overlay = null;
        document.documentElement.style.removeProperty('overflow');
      }
    };
    painelFiltros.addEventListener('transitionend', handler, { once: true });
  };

  if (btnFiltro && painelFiltros) {
    btnFiltro.addEventListener('click', () => {
      if (mqDrawer.matches) {
        if (painelFiltros.classList.contains('is-open')) closeDrawer();
        else openDrawer();
      } else if (layout) {
        const wasClosed = layout.classList.toggle('filters-closed');
        const expanded = !wasClosed;
        btnFiltro.setAttribute('aria-expanded', String(expanded));
        btnFiltro.classList.toggle('is-active', expanded);
        if (expanded) {
          painelFiltros.classList.add('filters-opening');
          setTimeout(() => painelFiltros.classList.remove('filters-opening'), 400);
        }
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && painelFiltros.classList.contains('is-open')) closeDrawer();
    });
  }

  if (layout) {
    layout.addEventListener('transitionend', event => {
      if (event.propertyName === 'grid-template-columns') {
        window.leafletDemo?.invalidate?.();
      }
    });
  }

  const vagasToggle = document.querySelector('.linha-toggle .toggle');
  const applyOpenPositionsFilter = onlyOpen => {
    const cards = document.querySelectorAll('.card-empresa');
    cards.forEach(card => {
      const isClosed = !!card.querySelector('.badge-vagas.fechada');
      card.style.display = onlyOpen && isClosed ? 'none' : '';
    });
  };
  if (vagasToggle) {
    vagasToggle.addEventListener('click', () => {
      const current = vagasToggle.getAttribute('aria-pressed') === 'true';
      const next = !current;
      vagasToggle.setAttribute('aria-pressed', String(next));
      applyOpenPositionsFilter(next);
    });
  }

  const fullBtn = document.querySelector('.mapa-control.fullscreen');
  if (fullBtn) {
    fullBtn.addEventListener('click', () => {
      window.location.href = 'mapacheio.html';
    });
  }

  const buscaMapa = document.querySelector('.busca-mapa input');
  if (buscaMapa) {
    buscaMapa.addEventListener('keypress', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const query = buscaMapa.value.trim().toLowerCase();
        if (query) window.leafletDemo?.search?.(query);
        buscaMapa.value = '';
      }
    });
  }

  ensureDesktopState();
  mqDrawer.addEventListener('change', ensureDesktopState);

  const mapEl = document.getElementById('map');
  let heatLayerRef = null;

  if (mapEl && window.L) {
    const leafletMap = L.map(mapEl, { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMap);

    const companies = Array.isArray(window.mapsLinkCompanies) ? window.mapsLinkCompanies : [];
    const markerById = new Map();
    const markers = companies.map(company => {
      const marker = L.marker(company.coords).addTo(leafletMap);
      marker.bindPopup(`<b>${company.name}</b><br>${company.address}`);
      markerById.set(company.id, marker);
      return marker;
    });

    if (markers.length) {
      const group = L.featureGroup(markers);
      leafletMap.fitBounds(group.getBounds().pad(0.2));
    } else {
      leafletMap.setView([-22.909938, -47.062633], 12);
    }

    const heatData = companies.map(company => [company.coords[0], company.coords[1], 1]);
    const heatOptions = {
      radius: 36,
      blur: 24,
      maxZoom: 17,
      minOpacity: 0.25,
      max: Math.max(20, Math.max(1, companies.length) * 3),
      gradient: {
        0.0: '#59ee90ff',
        0.25: '#1eff00ff',
        0.5: '#eab308',
        0.75: '#f97316',
        1.0: '#ef4444'
      }
    };
    heatLayerRef = L.heatLayer && heatData.length ? L.heatLayer(heatData, heatOptions) : null;

    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => leafletMap.invalidateSize(), 200);
    });

    window.leafletDemo = {
      invalidate() {
        leafletMap.invalidateSize();
      },
      search(query) {
        const normalized = (query || '').toLowerCase();
        if (!normalized) return;
        const company = companies.find(item => item.name.toLowerCase().includes(normalized));
        if (company) {
          leafletMap.setView(company.coords, 15);
          markerById.get(company.id)?.openPopup();
        }
      },
      setHeat(on) {
        if (!heatLayerRef) return;
        if (on) {
          heatLayerRef.addTo(leafletMap);
        } else {
          leafletMap.removeLayer(heatLayerRef);
        }
      }
    };
  } else {
    window.leafletDemo = window.leafletDemo || {
      invalidate() {},
      search() {},
      setHeat() {}
    };
  }

  const toggleHeat = document.getElementById('toggleHeat');
  if (toggleHeat) {
    toggleHeat.addEventListener('click', () => {
      const current = toggleHeat.getAttribute('aria-pressed') === 'true';
      const next = !current;
      toggleHeat.setAttribute('aria-pressed', String(next));
      window.leafletDemo?.setHeat?.(next);
    });
  }
})();
