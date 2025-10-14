// Helpers sem side-effects (nao alteram UI nem fluxo atual)
window.$ = (sel, root = document) => root.querySelector(sel);
window.$$ = (sel, root = document) => [...root.querySelectorAll(sel)];

window.loadJSON = async path => {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Falha ao carregar ${path}`);
  return res.json();
};

window.readParams = () =>
  Object.fromEntries(new URLSearchParams(location.search));

window.writeParams = (params = {}) => {
  const sp = new URLSearchParams(params);
  history.replaceState(null, '', `${location.pathname}?${sp.toString()}`);
};

(() => {
  const win = window;
  const doc = document;
  const body = doc.body;
  const data = body ? body.dataset || {} : {};

  const parseBool = (value, fallback) => {
    if (value === undefined) return fallback;
    if (value === '' || value === null) return fallback;
    const norm = String(value).toLowerCase();
    if (['false', '0', 'no', 'off'].includes(norm)) return false;
    if (['true', '1', 'yes', 'on'].includes(norm)) return true;
    return fallback;
  };

  const pickNumber = (value, fallback) => {
    if (value === undefined) return fallback;
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const navConfig = {};
  if (data.navOpenClass) navConfig.openClass = data.navOpenClass;
  if (data.navAltClass) navConfig.altOpenClass = data.navAltClass;
  navConfig.overlay = parseBool(data.navOverlay, false);
  navConfig.lockScroll = parseBool(data.navLockScroll, true);
  navConfig.closeOnLink = parseBool(data.navCloseOnLink, true);
  navConfig.closeOnOutside = parseBool(data.navCloseOnOutside, true);
  navConfig.closeOnEsc = parseBool(data.navCloseOnEsc, true);
  navConfig.smoothScroll = parseBool(
    data.navSmoothScroll ?? data.navSmooth,
    true
  );
  navConfig.shadow = parseBool(data.navShadow, true);
  navConfig.breakpoint = pickNumber(data.navBreakpoint, 768);
  if (data.navIconOpen) navConfig.iconOpen = data.navIconOpen;
  if (data.navIconClose) navConfig.iconClose = data.navIconClose;
  navConfig.highlight = data.navHighlight || data.navActive || null;

  const mapsApp = {
    dataset: data,
    highlightNav(target) {
      if (win.MapsNav && typeof win.MapsNav.highlight === 'function') {
        win.MapsNav.highlight(target);
      }
    },
    navLinks() {
      return win.MapsNav && typeof win.MapsNav.links === 'function'
        ? win.MapsNav.links()
        : [];
    },
    closeNav() {
      if (win.MapsNav && typeof win.MapsNav.close === 'function') {
        win.MapsNav.close();
      }
    },
    openNav() {
      if (win.MapsNav && typeof win.MapsNav.open === 'function') {
        win.MapsNav.open();
      }
    }
  };

  win.MapsApp = Object.assign({}, win.MapsApp, mapsApp);

  const bootstrap = () => {
    if (!win.MapsNav || typeof win.MapsNav.init !== 'function') return;
    win.MapsNav.init(navConfig);
    if (navConfig.highlight) {
      win.MapsNav.highlight(navConfig.highlight);
    }
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
