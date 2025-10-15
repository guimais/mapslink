const NAV_HTML = ``;

window.injectSharedNav = function injectSharedNav() {
  if (!document.body) return;
  if (!document.querySelector('header')) return;
  if (!NAV_HTML) return;
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
};

(() => {
  const win = window;
  const doc = document;

  const DEFAULTS = {
    openClass: 'is-open',
    altOpenClass: 'active',
    overlay: false,
    lockScroll: true,
    closeOnLink: true,
    closeOnOutside: true,
    closeOnEsc: true,
    smoothScroll: true,
    shadow: true,
    highlight: null,
    breakpoint: 768,
    iconOpen: 'ri-menu-line',
    iconClose: 'ri-close-line'
  };

  const state = {
    initialized: false,
    config: { ...DEFAULTS },
    nav: null,
    menu: null,
    toggle: null,
    overlay: null,
    links: [],
    isOpen: false,
    originalShadow: '',
    originalOverflow: '',
    changeListeners: new Set()
  };

  const applyConfig = config => {
    const merged = { ...DEFAULTS };
    Object.keys(config || {}).forEach(key => {
      const value = config[key];
      if (value !== undefined && value !== null && value !== '') {
        merged[key] = value;
      }
    });
    if (!merged.altOpenClass && merged.openClass !== 'active') {
      merged.altOpenClass = 'active';
    }
    return merged;
  };

  const getMenuElement = () => {
    const nav = doc.querySelector('.nav-pilula');
    if (!nav) return { nav: null, menu: null, toggle: null };
    const toggle =
      nav.querySelector('.nav-toggle') || doc.querySelector('.nav-toggle');
    const menu =
      doc.getElementById('navMenu') || nav.querySelector('.nav-links');
    return { nav, menu, toggle };
  };

  const ensureOverlay = () => {
    if (!state.config.overlay) return null;
    const existing = doc.querySelector('.nav-overlay');
    if (existing) return existing;
    const overlay = doc.createElement('div');
    overlay.className = 'nav-overlay';
    doc.body.appendChild(overlay);
    overlay.addEventListener('click', () => api.close());
    return overlay;
  };

  const setBodyLock = lock => {
    if (!state.config.lockScroll) return;
    if (lock) {
      state.originalOverflow = doc.body.style.overflow || '';
      doc.body.style.overflow = 'hidden';
    } else {
      doc.body.style.overflow = state.originalOverflow;
    }
  };

  const updateIcon = open => {
    const icon = state.toggle?.querySelector('i');
    if (!icon) return;
    icon.className = open ? state.config.iconClose : state.config.iconOpen;
  };

  const updateAria = open => {
    if (state.toggle) {
      state.toggle.setAttribute('aria-expanded', String(open));
    }
    if (state.menu) {
      state.menu.setAttribute('data-nav-open', String(open));
    }
  };

  const openClasses = () => {
    const values = [state.config.openClass, state.config.altOpenClass];
    return values.filter(Boolean);
  };

  const updateMenuState = open => {
    if (!state.menu) return;
    openClasses().forEach(cls => state.menu.classList.toggle(cls, open));
  };

  const notifyChange = open => {
    state.changeListeners.forEach(fn => {
      try {
        fn(open);
      } catch (err) {
        console.error('[MapsNav] listener error', err);
      }
    });
  };

  const handleDocumentClick = e => {
    if (!state.config.closeOnOutside || !state.isOpen) return;
    const target = e.target;
    if (
      state.nav?.contains(target) ||
      state.menu?.contains(target) ||
      state.toggle?.contains(target) ||
      state.overlay?.contains(target)
    ) {
      return;
    }
    api.close();
  };

  const handleKeydown = e => {
    if (!state.config.closeOnEsc || !state.isOpen) return;
    if (e.key === 'Escape') api.close();
  };

  const handleResize = () => {
    if (!state.isOpen) return;
    if (win.innerWidth > state.config.breakpoint) {
      api.close();
    }
  };

  const handleLinkClick = e => {
    const link = e.currentTarget;
    const href = link.getAttribute('href');
    const isHash = href && href.startsWith('#');

    if (isHash && state.config.smoothScroll) {
      const target = doc.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (!state.config.closeOnLink) return;
    if (win.innerWidth <= state.config.breakpoint) {
      setTimeout(() => api.close(), 60);
    }
  };

  const bindLinks = () => {
    state.links.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });
  };

  const unbindLinks = () => {
    state.links.forEach(link => {
      link.removeEventListener('click', handleLinkClick);
    });
  };

  const highlightLink = target => {
    if (!target) return;
    const norm = target.toLowerCase();
    const compare = value => (value || '').toLowerCase();
    let activeLink = null;

    state.links.forEach(link => {
      link.classList.remove('active');
      if (link.hasAttribute('aria-current')) {
        link.removeAttribute('aria-current');
      }
    });

    const byHref = state.links.find(link => {
      const href = compare(link.getAttribute('href'));
      if (!href) return false;
      return (
        href === norm ||
        href.endsWith(norm) ||
        (norm.startsWith('#') && href === norm) ||
        href.includes(norm)
      );
    });

    const byKey =
      byHref ||
      state.links.find(link => compare(link.dataset.navKey) === norm) ||
      state.links.find(link => compare(link.textContent) === norm);

    activeLink = byHref || byKey || null;

    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  };

  const updateShadow = () => {
    if (!state.config.shadow || !state.nav) return;
    const scrolled = win.scrollY > 8;
    state.nav.style.boxShadow = scrolled
      ? '0 10px 26px rgba(0,0,0,0.12)'
      : state.originalShadow;
  };

  const bindGlobalEvents = () => {
    doc.addEventListener('click', handleDocumentClick, true);
    doc.addEventListener('keydown', handleKeydown);
    win.addEventListener('resize', handleResize);
    win.addEventListener('scroll', updateShadow, { passive: true });
  };

  const unbindGlobalEvents = () => {
    doc.removeEventListener('click', handleDocumentClick, true);
    doc.removeEventListener('keydown', handleKeydown);
    win.removeEventListener('resize', handleResize);
    win.removeEventListener('scroll', updateShadow);
  };

  const init = config => {
    const elements = getMenuElement();
    state.nav = elements.nav;
    state.menu = elements.menu;
    state.toggle = elements.toggle;

    if (!state.nav || !state.menu || !state.toggle) return;

    state.config = applyConfig(config);
    state.links = Array.from(
      state.menu.querySelectorAll('a.nav-link, .nav-link')
    );
    state.overlay = ensureOverlay();
    state.originalShadow = state.nav
      ? getComputedStyle(state.nav).boxShadow || ''
      : '';

    if (!state.initialized) {
      state.toggle.addEventListener('click', evt => {
        evt.preventDefault();
        evt.stopPropagation();
        api.toggle();
      });
      bindLinks();
      bindGlobalEvents();
      state.initialized = true;
    } else {
      unbindLinks();
      bindLinks();
    }

    updateShadow();

    if (state.config.highlight) {
      highlightLink(state.config.highlight);
    }
  };

  const api = {
    init,
    open() {
      if (state.isOpen) return;
      state.isOpen = true;
      updateMenuState(true);
      setBodyLock(true);
      updateIcon(true);
      updateAria(true);
      if (state.overlay) state.overlay.classList.add('active');
      notifyChange(true);
    },
    close() {
      if (!state.isOpen) return;
      state.isOpen = false;
      updateMenuState(false);
      setBodyLock(false);
      updateIcon(false);
      updateAria(false);
      if (state.overlay) state.overlay.classList.remove('active');
      notifyChange(false);
    },
    toggle() {
      state.isOpen ? api.close() : api.open();
    },
    highlight(target) {
      highlightLink(target);
    },
    links() {
      return state.links.slice();
    },
    onChange(fn) {
      if (typeof fn === 'function') {
        state.changeListeners.add(fn);
      }
      return () => state.changeListeners.delete(fn);
    },
    destroy() {
      unbindLinks();
      unbindGlobalEvents();
      if (state.overlay && state.overlay.parentElement === doc.body) {
        state.overlay.remove();
      }
      state.initialized = false;
    }
  };

  win.MapsNav = api;
})();
