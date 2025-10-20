const NAV_HTML = ``;

window.injectSharedNav = function injectSharedNav() {
  if (!NAV_HTML) return;
  if (!document.body) return;
  if (document.querySelector("header")) return;
  document.body.insertAdjacentHTML("afterbegin", NAV_HTML);
};

(() => {
  const DEFAULTS = {
    openClass: "is-open",
    altOpenClass: "active",
    overlay: false,
    lockScroll: true,
    closeOnLink: true,
    closeOnOutside: true,
    closeOnEsc: true,
    smoothScroll: true,
    shadow: true,
    highlight: null,
    breakpoint: 768,
    iconOpen: "ri-menu-line",
    iconClose: "ri-close-line"
  };

  const state = {
    nav: null,
    menu: null,
    toggle: null,
    overlay: null,
    links: [],
    config: { ...DEFAULTS },
    changeListeners: new Set(),
    isOpen: false,
    initialized: false,
    originalShadow: "",
    originalOverflow: ""
  };

  function truthy(value) {
    if (typeof value === "string") return /^(1|true|yes)$/i.test(value);
    return Boolean(value);
  }

  function mergeConfig(source = {}) {
    const config = { ...DEFAULTS };
    Object.keys(source).forEach(key => {
      const value = source[key];
      if (value !== undefined && value !== null && value !== "") config[key] = value;
    });
    if (!config.altOpenClass && config.openClass !== "active") config.altOpenClass = "active";
    return config;
  }

  function configFromBody() {
    const dataset = document.body?.dataset || {};
    const config = {};
    if (dataset.navOpenClass) config.openClass = dataset.navOpenClass;
    if (dataset.navOverlay !== undefined) config.overlay = truthy(dataset.navOverlay);
    if (dataset.navLockScroll !== undefined) config.lockScroll = truthy(dataset.navLockScroll);
    if (dataset.navCloseOnLink !== undefined) config.closeOnLink = truthy(dataset.navCloseOnLink);
    if (dataset.navCloseOnOutside !== undefined) config.closeOnOutside = truthy(dataset.navCloseOnOutside);
    if (dataset.navCloseOnEsc !== undefined) config.closeOnEsc = truthy(dataset.navCloseOnEsc);
    if (dataset.navSmoothScroll !== undefined) config.smoothScroll = truthy(dataset.navSmoothScroll);
    if (dataset.navShadow !== undefined) config.shadow = truthy(dataset.navShadow);
    if (dataset.navBreakpoint) config.breakpoint = parseInt(dataset.navBreakpoint, 10) || DEFAULTS.breakpoint;
    if (dataset.navActive) config.highlight = dataset.navActive;
    if (dataset.navIconOpen) config.iconOpen = dataset.navIconOpen;
    if (dataset.navIconClose) config.iconClose = dataset.navIconClose;
    return config;
  }

  function elements() {
    const nav = document.querySelector(".nav-pilula");
    if (!nav) return { nav: null, menu: null, toggle: null };
    const toggle = nav.querySelector(".nav-toggle") || document.querySelector(".nav-toggle");
    const menu = document.getElementById("navMenu") || nav.querySelector(".nav-links");
    return { nav, menu, toggle };
  }

  function ensureOverlay() {
    if (!state.config.overlay) return null;
    if (state.overlay) return state.overlay;
    const overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.addEventListener("click", () => api.close());
    document.body.appendChild(overlay);
    state.overlay = overlay;
    return overlay;
  }

  function lockScroll(lock) {
    if (!state.config.lockScroll) return;
    if (lock) {
      state.originalOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = state.originalOverflow;
    }
  }

  function updateIcon(open) {
    const icon = state.toggle?.querySelector("i");
    if (!icon) return;
    icon.className = open ? state.config.iconClose : state.config.iconOpen;
  }

  function updateAria(open) {
    state.toggle?.setAttribute("aria-expanded", String(open));
    state.menu?.setAttribute("data-nav-open", String(open));
  }

  function toggleClasses(open) {
    if (!state.menu) return;
    [state.config.openClass, state.config.altOpenClass]
      .filter(Boolean)
      .forEach(cls => state.menu.classList.toggle(cls, open));
  }

  function notify(open) {
    state.changeListeners.forEach(listener => {
      try {
        listener(open);
      } catch {
        /* ignore listener errors */
      }
    });
  }

  function handleLinkClick(event) {
    const link = event.currentTarget;
    const href = link.getAttribute("href") || "";
    if (!state.config.closeOnLink) return;
    if (href.startsWith("#") && state.config.smoothScroll) {
      event.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: "smooth" });
      api.close();
    } else if (!href.startsWith("#")) {
      api.close();
    }
  }

  function bindLinks() {
    state.links.forEach(link => {
      if (link.dataset.navBound) return;
      link.dataset.navBound = "true";
      link.addEventListener("click", handleLinkClick);
    });
  }

  function unbindLinks() {
    state.links.forEach(link => {
      if (!link.dataset.navBound) return;
      link.removeEventListener("click", handleLinkClick);
      delete link.dataset.navBound;
    });
  }

  function handleDocumentClick(event) {
    if (!state.config.closeOnOutside) return;
    if (!state.isOpen) return;
    const target = event.target;
    if (state.menu?.contains(target)) return;
    if (state.toggle && (target === state.toggle || state.toggle.contains(target))) return;
    api.close();
  }

  function handleKeydown(event) {
    if (!state.config.closeOnEsc) return;
    if (event.key === "Escape") api.close();
  }

  function handleResize() {
    if (!state.config.breakpoint) return;
    if (window.innerWidth >= state.config.breakpoint) api.close();
  }

  function updateShadow() {
    if (!state.config.shadow || !state.nav) return;
    const scrolled = window.scrollY > 8;
    state.nav.style.boxShadow = scrolled ? "0 10px 26px rgba(0,0,0,0.12)" : state.originalShadow;
  }

  function bindGlobalEvents() {
    document.addEventListener("click", handleDocumentClick, true);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateShadow, { passive: true });
  }

  function unbindGlobalEvents() {
    document.removeEventListener("click", handleDocumentClick, true);
    document.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("scroll", updateShadow);
  }

  const api = {
    init(config) {
      const { nav, menu, toggle } = elements();
      state.nav = nav;
      state.menu = menu;
      state.toggle = toggle;
      if (!nav || !menu || !toggle) return;
      state.config = mergeConfig(config);
      state.links = Array.from(menu.querySelectorAll("a.nav-link, .nav-link"));
      state.overlay = ensureOverlay();
      state.originalShadow = getComputedStyle(nav).boxShadow || "";
      lockScroll(false);
      updateShadow();
      if (!state.initialized) {
        toggle.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          api.toggle();
        });
        bindLinks();
        bindGlobalEvents();
        state.initialized = true;
      } else {
        unbindLinks();
        bindLinks();
      }
      if (state.config.highlight) api.highlight(state.config.highlight);
    },
    open() {
      if (state.isOpen) return;
      state.isOpen = true;
      lockScroll(true);
      toggleClasses(true);
      updateIcon(true);
      updateAria(true);
      state.overlay?.classList.add("active");
      notify(true);
    },
    close() {
      if (!state.isOpen) return;
      state.isOpen = false;
      lockScroll(false);
      toggleClasses(false);
      updateIcon(false);
      updateAria(false);
      state.overlay?.classList.remove("active");
      notify(false);
    },
    toggle() {
      state.isOpen ? api.close() : api.open();
    },
    highlight(target) {
      const normalized = String(target || "").toLowerCase();
      state.links.forEach(link => {
        const href = (link.getAttribute("href") || "").toLowerCase();
        const key = (link.dataset.navKey || link.textContent || "").trim().toLowerCase();
        const match = href === normalized || key === normalized || href.endsWith(normalized);
        link.classList.toggle("active", match);
        if (match) link.setAttribute("aria-current", "page");
      });
    },
    links() {
      return state.links.slice();
    },
    onChange(listener) {
      if (typeof listener === "function") state.changeListeners.add(listener);
      return () => state.changeListeners.delete(listener);
    },
    destroy() {
      api.close();
      unbindLinks();
      unbindGlobalEvents();
      if (state.overlay?.parentElement === document.body) state.overlay.remove();
      state.initialized = false;
    }
  };

  window.MapsNav = api;

  function init() {
    const config = mergeConfig(configFromBody());
    api.init(config);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
