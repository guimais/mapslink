(() => {
  "use strict";

  if (window.__ml_perfilusuario_init__) return;
  window.__ml_perfilusuario_init__ = true;

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  const header = $(".nav-container");

  const navLinksAll =
    (window.MapsApp && typeof window.MapsApp.navLinks === "function")
      ? (window.MapsApp.navLinks() || [])
      : $$(".nav-link");

  const highlightNav = (target) => {
    if (window.MapsApp && typeof window.MapsApp.highlightNav === "function") {
      try { window.MapsApp.highlightNav(target); return true; } catch {}
    }
    return false;
  };

  const closeMenu = () => {
    if (window.MapsApp && typeof window.MapsApp.closeNav === "function") {
      try { window.MapsApp.closeNav(); } catch {}
    }
  };

  const toggleMenu = () => {
    if (window.MapsNav && typeof window.MapsNav.toggle === "function") {
      try { window.MapsNav.toggle(); } catch {}
    }
  };

  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 6) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  navLinksAll
    .filter((a) => (a.getAttribute("href") || "").startsWith("#"))
    .forEach((a) => {
      if (a.__pu_bound) return;
      a.__pu_bound = true;
      a.addEventListener("click", (e) => {
        const hash = a.getAttribute("href");
        const target = hash ? document.querySelector(hash) : null;
        if (!target) return;
        e.preventDefault();
        closeMenu();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", hash);
      });
    });

  const markActiveByPath = () => {
    const path = (location.pathname.split("/").pop() || "index.html").split("?")[0];
    if (highlightNav(path)) return;
    navLinksAll.forEach((link) => {
      const href = (link.getAttribute("href") || "").split("?")[0];
      if (!href || href.startsWith("#")) return;
      link.classList.toggle("active", href === path);
    });
  };

  const sectionLinks = navLinksAll.filter((a) => (a.getAttribute("href") || "").startsWith("#"));
  const sectionIds = ["#home", "#planos", "#maps", "#profile", "#about", "#contact"];
  const sections = sectionIds.map((id) => $(id)).filter(Boolean);

  if (sectionLinks.length && sections.length) {
    const map = new Map(sectionLinks.map((l) => [l.getAttribute("href"), l]));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          if (highlightNav(id)) return;
          sectionLinks.forEach((l) => l.classList.remove("active"));
          map.get(id)?.classList.add("active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0.01 }
    );
    sections.forEach((sec) => io.observe(sec));
    const start = location.hash && map.get(location.hash) ? location.hash : "#profile";
    if (!highlightNav(start)) map.get(start)?.classList.add("active");
  } else {
    markActiveByPath();
  }

  const toast = (() => {
    const id = "perfiluser-toast";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      Object.assign(el.style, {
        position: "fixed",
        left: "50%",
        bottom: "28px",
        transform: "translateX(-50%)",
        background: "rgba(16,37,105,.98)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "10px",
        fontSize: "14px",
        boxShadow: "0 8px 18px rgba(0,0,0,.18)",
        opacity: "0",
        pointerEvents: "none",
        transition: "opacity .2s ease",
        zIndex: "9999",
      });
      document.body.appendChild(el);
    }
    let t;
    return (msg) => {
      clearTimeout(t);
      el.textContent = msg;
      el.style.opacity = "1";
      t = setTimeout(() => (el.style.opacity = "0"), 1400);
    };
  })();

  $$(".perfil-contatos a").forEach((a) => {
    if (a.__pu_copy_bound) return;
    a.__pu_copy_bound = true;

    a.addEventListener("click", async (e) => {
      const href = a.getAttribute("href") || "";
      const toCopy = (() => {
        if (href.startsWith("mailto:")) return href.replace(/^mailto:/, "");
        if (href.startsWith("tel:")) return href.replace(/^tel:/, "");
        return (a.textContent || "").trim();
      })();

      try {
        await (navigator.clipboard?.writeText?.(toCopy));
        toast("Copiado: " + toCopy);
        if (/^https?:\/\//i.test(href)) {
          e.preventDefault();
          window.open(href, "_blank", "noopener");
        }
      } catch {
        toast("Não foi possível copiar");
      }
    });
  });

  // reveal simples (cards/blocos/curriculo-card)
  const revealTargets = $$(".card, .bloco, .curriculo-card");
  if (revealTargets.length) {
    revealTargets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      el.style.transition = "opacity .35s ease, transform .35s ease";
    });
    const revealer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => revealer.observe(el));
  }

  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "m") {
      e.preventDefault();
      toggleMenu();
    }
  });
})();

(() => {
  if (document.getElementById("cards-anim-styles")) {
  } else {
    const style = document.createElement("style");
    style.id = "cards-anim-styles";
    style.textContent = [
      ".js-card-hover{transition:transform .18s ease, box-shadow .18s ease, opacity .32s ease;}",
      ".js-card-init{opacity:0;transform:translateY(14px);}",
      ".js-card-in{opacity:1;transform:translateY(0);}",
      ".js-card-in.js-card-elevate:hover{transform:translateY(-2px); box-shadow:0 10px 24px rgba(0,0,0,.08)!important;}",
      ".js-card-pressed{transform:translateY(0) scale(.995)!important;}"
    ].join("");
    document.head.appendChild(style);
  }

  const init = () => {
    const cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
    if (!cards.length) return;

    let prefersReduced = false;
    try {
      prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}

    cards.forEach((el) => {
      if (el.__card_bound) return;
      el.__card_bound = true;

      el.classList.add("js-card-hover", "js-card-elevate");
      if (!prefersReduced) el.classList.add("js-card-init");

      el.addEventListener("pointerdown", () => el.classList.add("js-card-pressed"));
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        el.addEventListener(evt, () => el.classList.remove("js-card-pressed"));
      });
    });

    if (prefersReduced) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("js-card-in");
            entry.target.classList.remove("js-card-init");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    cards.forEach((el) => obs.observe(el));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

(() => {
  const styleId = "mini-cards-anim-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = [
      ".js-mini{transition:transform .2s ease, box-shadow .25s ease, opacity .35s ease, background-position .25s ease; position:relative; overflow:hidden;}",
      ".js-mini-light{background-image: radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.10), rgba(255,255,255,0) 45%); background-repeat:no-repeat;}",
      ".js-mini-init{opacity:0; transform:translateX(12px);}",
      ".js-mini-in{opacity:1; transform:none;}",
      ".js-mini:hover{transform:translateY(-2px); box-shadow:0 12px 26px rgba(0,0,0,.22);}",
      ".js-mini-press{transform:translateY(0) scale(.995)!important;}"
    ].join("");
    document.head.appendChild(style);
  }

  const init = () => {
    const minis = Array.prototype.slice.call(document.querySelectorAll(".curriculo-experiencias li"));
    if (!minis.length) return;

    let prefersReduced = false;
    try {
      prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}

    minis.forEach((el, idx) => {
      if (el.__mini_bound) return;
      el.__mini_bound = true;

      el.classList.add("js-mini", "js-mini-light");
      if (!prefersReduced) el.classList.add("js-mini-init");
      el.dataset.idx = idx;

      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = Math.round(e.clientX - r.left);
        const y = Math.round(e.clientY - r.top);
        el.style.setProperty("--mx", x + "px");
        el.style.setProperty("--my", y + "px");
      });

      el.addEventListener("pointerdown", () => el.classList.add("js-mini-press"));
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        el.addEventListener(evt, () => el.classList.remove("js-mini-press"));
      });
    });

    if (prefersReduced) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = (parseInt(el.dataset.idx || "0", 10) % 8) * 70;
          setTimeout(() => {
            el.classList.add("js-mini-in");
            el.classList.remove("js-mini-init");
          }, delay);
          obs.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    minis.forEach((el) => obs.observe(el));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
