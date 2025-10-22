(() => {
  if (window.__ml_selecaoperfil_init__) return;
  window.__ml_selecaoperfil_init__ = true;

  const PERFIL_KEY = "mapslink:perfil";

  function query(selector, root) {
    return (root || document).querySelector(selector);
  }

  function queryAll(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function highlightNav() {
    const path = (location.pathname.split("/").pop() || "index.html").split("?")[0];
    if (window.MapsApp?.highlightNav) {
      try {
        window.MapsApp.highlightNav(path);
        return;
      } catch {}
    }
    const links = window.MapsApp?.navLinks ? window.MapsApp.navLinks() : queryAll(".nav-link");
    links.forEach(link => {
      const href = (link.getAttribute("href") || "").split("?")[0];
      const isHash = href.startsWith("#");
      const active = (!isHash && (href.endsWith(path) || href === path)) || (path === "index.html" && href.includes("#home"));
      link.classList.toggle("active", active);
      if (!isHash) link.setAttribute("aria-current", active ? "page" : "false");
    });
  }

  function storeProfile(type) {
    try {
      localStorage.setItem(PERFIL_KEY, type);
    } catch {}
  }

  function goTo(type) {
    storeProfile(type);
    window.location.href = type === "empresarial" ? "loginempresa.html" : "loginpessoal.html";
  }

  function bindButton(button, type) {
    if (!button || button.dataset.bound) return;
    button.dataset.bound = "true";
    button.type = "button";
    button.addEventListener("click", () => goTo(type));
  }

  function bindCard(card) {
    if (!card || card.dataset.bound) return;
    card.dataset.bound = "true";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");
    const type = card.dataset.perfil === "empresarial" ? "empresarial" : "pessoal";
    const activate = event => {
      if (event?.target?.closest && event.target.closest(".perfil-cta")) return;
      goTo(type);
    };
    card.addEventListener("click", activate);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(event);
      }
    });
  }

  function initNavShadow() {
    const nav = query(".nav-pilula");
    if (!nav) return;
    const handler = () => {
      nav.dataset.scrolled = window.scrollY > 8 ? "1" : "0";
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
  }

  function initMotionToggle() {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      document.documentElement.style.setProperty("--ml-motion-scale", media.matches ? "0" : "1");
    };
    apply();
    media.addEventListener?.("change", apply);
  }

  function init() {
    initNavShadow();
    highlightNav();
    window.addEventListener("popstate", highlightNav);
    bindButton(query('[data-action="escolher-empresarial"]'), "empresarial");
    bindButton(query('[data-action="escolher-pessoal"]'), "pessoal");
    queryAll(".perfil-card").forEach(bindCard);
    initMotionToggle();
  }

  init();
})();
