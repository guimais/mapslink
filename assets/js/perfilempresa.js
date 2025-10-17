(() => {
  "use strict";

  if (window.__ml_perfilempresa_init__) return;
  window.__ml_perfilempresa_init__ = true;

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const navLinks = (window.MapsApp && typeof window.MapsApp.navLinks === "function")
    ? (window.MapsApp.navLinks() || [])
    : Array.from($$(".nav-link"));

  function sameUrl(aHref, url) {
    try {
      const a = new URL(aHref, location.href);
      const b = new URL(url, location.href);
      if (a.hash || b.hash) return a.hash === b.hash;
      return a.origin === b.origin && a.pathname === b.pathname;
    } catch {
      return aHref === url;
    }
  }

  function setActiveLink(url) {
    if (window.MapsApp && typeof window.MapsApp.highlightNav === "function") {
      try { window.MapsApp.highlightNav(url); return; } catch {}
    }
    navLinks.forEach(a => {
      const href = a.getAttribute("href") || "";
      const isActive =
        sameUrl(a.href || href, url) ||
        (href.startsWith("#") && href === (location.hash || ""));
      a.classList.toggle("active", !!isActive);
      if (href.startsWith("#")) {
        a.setAttribute("aria-current", isActive ? "page" : "false");
      }
    });
  }

  setActiveLink(location.href);

  navLinks
    .filter(a => (a.getAttribute("href") || "").startsWith("#"))
    .forEach(a => {
      if (a.__pfb_bound) return;
      a.__pfb_bound = true;
      a.addEventListener("click", e => {
        const id = a.getAttribute("href");
        const el = id && $(id);
        if (!el) return;
        e.preventDefault();
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
        history.pushState(null, "", id);
        setActiveLink(location.href);
        if (window.MapsApp && typeof window.MapsApp.closeNav === "function") {
          try { window.MapsApp.closeNav(); } catch {}
        }
      });
    });

  window.addEventListener("popstate", () => setActiveLink(location.href));

  const agendaEl = $("#agenda-entrevistas .agenda-numero");
  const curriculosCard = $("#curriculos-recebidos");

  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }
  };

  const agendaHoje = store.get("mapslink_agenda_hoje", 3);
  if (agendaEl) agendaEl.textContent = agendaHoje;

  const curriculosCount = store.get("mapslink_curriculos_recebidos", 0);
  if (curriculosCard) {
    let badge = curriculosCard.querySelector(".badge-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "badge-count";
 
      Object.assign(badge.style, {
        marginLeft: "8px",
        fontWeight: "800",
        background: "var(--surface-2)",
        borderRadius: "9999px",
        padding: "4px 10px",
        fontSize: "14px",
        display: "inline-block"
      });
      const title = curriculosCard.querySelector(".card-title") || curriculosCard.querySelector("h2");
      if (title) title.appendChild(badge);
    }
    badge.textContent = curriculosCount;
  }

  window.MapsLink = Object.assign({}, window.MapsLink, {
    setAgendaHoje(n) {
      const num = +n;
      if (!Number.isFinite(num)) return;
      store.set("mapslink_agenda_hoje", num);
      if (agendaEl) agendaEl.textContent = num;
    },
    setCurriculos(n) {
      const num = +n;
      if (!Number.isFinite(num)) return;
      store.set("mapslink_curriculos_recebidos", num);
      if (curriculosCard) {
        const b = curriculosCard.querySelector(".badge-count");
        if (b) b.textContent = num;
      }
    }
  });
})();
