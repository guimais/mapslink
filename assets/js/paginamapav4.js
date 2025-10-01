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
    overlay.style.background = 'rgba(15,23,42,.28)';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .28s ease';
    overlay.style.zIndex = '998';
    overlay.addEventListener('click', closeDrawer);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => (overlay.style.opacity = '1'));
    return overlay;
  };

  const openDrawer = () => {
    if (!painelFiltros) return;
    // Mantém o atributo [hidden] no mobile para ativar o estilo offcanvas definido no CSS
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

  function closeDrawer() {
    if (!painelFiltros) return;
    painelFiltros.classList.remove('is-open');
    btnFiltro?.setAttribute('aria-expanded', 'false');
    btnFiltro?.classList.remove('is-active');
    if (overlay) overlay.style.opacity = '0';
    painelFiltros.addEventListener(
      'transitionend',
      () => {
        if (!painelFiltros.classList.contains('is-open')) {
          painelFiltros.hidden = true;
          if (overlay) overlay.remove();
          overlay = null;
          document.documentElement.style.removeProperty('overflow');
        }
      },
      { once: true }
    );
  }

  if (btnFiltro && painelFiltros) {
    btnFiltro.addEventListener('click', () => {
      if (mqDrawer.matches) {
        if (painelFiltros.classList.contains('is-open')) closeDrawer();
        else openDrawer();
      } else if (layout) {
        const willClose = !layout.classList.contains('filters-closed');
        const closed = layout.classList.toggle('filters-closed');
        btnFiltro.setAttribute('aria-expanded', String(!closed));
        btnFiltro.classList.toggle('is-active', !closed);
        if (!willClose) {
          painelFiltros.classList.add('filters-opening');
          setTimeout(() => painelFiltros.classList.remove('filters-opening'), 400);
        }
        
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && painelFiltros.classList.contains('is-open')) closeDrawer();
    });
  }

  if (layout) {
    layout.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'grid-template-columns') {
        window.leafletDemo?.invalidate?.();
      }
    });
  }

  const vagasToggle = document.querySelector('.linha-toggle .toggle');
  const applyOpenPositionsFilter = (on) => {
    const cards = document.querySelectorAll('.card-empresa');
    cards.forEach(card => {
      const isClosed = !!card.querySelector('.badge-vagas.fechada');
      if (on && isClosed) {
        card.style.display = 'none';
      } else {
        card.style.display = '';
      }
    });
  };
  if (vagasToggle) {
    vagasToggle.addEventListener('click', () => {
      const ativo = vagasToggle.getAttribute('aria-pressed') === 'true';
      const next = !ativo;
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
    buscaMapa.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = buscaMapa.value.trim().toLowerCase();
        if (window.leafletDemo && q) window.leafletDemo.search(q);
        buscaMapa.value = '';
      }
    });
  }

  ensureDesktopState();
  mqDrawer.addEventListener('change', ensureDesktopState);

  const mapEl = document.getElementById('map');
  if (mapEl && window.L) {
    const leafletMap = L.map(mapEl, { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMap);

    const places = [
      { name: 'SIDI', coords: [-22.8339, -47.0739] },
      { name: 'SAMSUNG', coords: [-22.942, -47.060] },
      { name: 'CNPEM', coords: [-22.8197, -47.0647] }
    ];
    const markers = places.map(p => L.marker(p.coords).addTo(leafletMap).bindPopup(`<b>${p.name}</b>`));
    const group = L.featureGroup(markers);
    leafletMap.fitBounds(group.getBounds().pad(0.2));

    const heatData = places.map(p => [p.coords[0], p.coords[1], 1]);
    const heatOptions = {
      radius: 36,
      blur: 24,
      maxZoom: 17,
      minOpacity: 0.25,
      max: Math.max(20, places.length * 3),
      gradient: {
        0.0: '#59ee90ff',  
        0.25: '#1eff00ff', 
        0.5: '#eab308',  
        0.75: '#f97316', 
        1.0: '#ef4444'   
      }
    };
    const heat = (L.heatLayer ? L.heatLayer(heatData, heatOptions) : null);

    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => leafletMap.invalidateSize(), 200);
    });

    window.leafletDemo = {
      invalidate() { leafletMap.invalidateSize(); },
      search(q) {
        const foundIdx = places.findIndex(p => p.name.toLowerCase().includes(q));
        if (foundIdx >= 0) {
          leafletMap.setView(places[foundIdx].coords, 15);
          markers[foundIdx].openPopup();
        }
      },
      setHeat(on) {
        if (!heat) return;
        if (on) {
          heat.addTo(leafletMap);
        } else {
          leafletMap.removeLayer(heat);
        }
      }
    };
  }

  const toggleHeat = document.getElementById('toggleHeat');
  if (toggleHeat) {
    toggleHeat.addEventListener('click', () => {
      const ativo = toggleHeat.getAttribute('aria-pressed') === 'true';
      const next = !ativo;
      toggleHeat.setAttribute('aria-pressed', String(next));
      window.leafletDemo?.setHeat?.(next);
    });
  }
})();
