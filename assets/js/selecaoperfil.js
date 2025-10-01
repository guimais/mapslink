(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const nav = $(".nav-pilula");
  const navToggle = $(".nav-toggle");
  const navMenu = $("#navMenu");

  const setMenuState = (isOpen) => {
    if (!navMenu) return;
    navMenu.classList.toggle("is-open", isOpen);
    if (navToggle) navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("lock-scroll", isOpen);
    if (isOpen) {
      const first = navMenu.querySelector("a,button,[tabindex]:not([tabindex='-1'])");
      if (first) first.focus({ preventScroll: true });
    } else if (navToggle) {
      navToggle.focus({ preventScroll: true });
    }
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = !navMenu.classList.contains("is-open");
      setMenuState(open);
    });
  }

  if (navMenu) {
    navMenu.addEventListener("click", (e) => {
      const el = e.target.closest("a");
      if (!el) return;
      if (navMenu.classList.contains("is-open")) setMenuState(false);
    });
  }

  document.addEventListener("click", (e) => {
    if (!navMenu || !navToggle) return;
    const isOpen = navMenu.classList.contains("is-open");
    if (!isOpen) return;
    const withinNav = e.target.closest(".nav-pilula");
    if (!withinNav) setMenuState(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu && navMenu.classList.contains("is-open")) {
      setMenuState(false);
    }
  });

  const onScroll = () => {
    if (!nav) return;
    const scrolled = window.scrollY > 8;
    nav.dataset.scrolled = scrolled ? "1" : "0";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const markActive = () => {
    const path = location.pathname.split("/").pop() || "index.html";
    $$(".nav-link").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const isHashOnly = href.startsWith("#");
      const matches =
        (!isHashOnly && href.endsWith(path)) ||
        (path === "index.html" && href.includes("#home"));
      a.classList.toggle("active", !!matches);
    });
  };
  markActive();

  const PERFIL_KEY = "mapslink:perfil";

  const escolherPerfil = (tipo) => {
    try {
      localStorage.setItem(PERFIL_KEY, tipo);
    } catch (_) {}
    const destino =
      tipo === "empresarial" ? "perfilempresa.html" : "perfilusuario.html";
    window.location.href = destino;
  };

  const btnEmp = $('[data-action="escolher-empresarial"]');
  const btnPes = $('[data-action="escolher-pessoal"]');
  if (btnEmp) btnEmp.addEventListener("click", () => escolherPerfil("empresarial"));
  if (btnPes) btnPes.addEventListener("click", () => escolherPerfil("pessoal"));

  $$(".perfil-card").forEach((card) => {
    card.setAttribute("tabindex", "0"); 
    card.addEventListener("click", (e) => {
      if (e.target.closest(".perfil-cta")) return;
      const tipo = card.dataset.perfil === "empresarial" ? "empresarial" : "pessoal";
      escolherPerfil(tipo);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const tipo = card.dataset.perfil === "empresarial" ? "empresarial" : "pessoal";
        escolherPerfil(tipo);
      }
    });
  });

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReduced.matches) {
    document.documentElement.style.setProperty("--ml-motion-scale", "0");
  } else {
    document.documentElement.style.setProperty("--ml-motion-scale", "1");
  }
})();

