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

  function hydrateFromAuth(data) {
    if (!data || data.type !== "business") return;
    const profile = data.profile || {};
    const nameEl = $("#empresa-nome-exibicao");
    if (nameEl && (data.company || data.name)) nameEl.textContent = data.company || data.name;
    const descEl = $(".empresa-hero-desc");
    if (descEl && profile.caption) descEl.textContent = profile.caption;
    const tagsEl = $(".empresa-hero-tags");
    if (tagsEl && Array.isArray(profile.tags) && profile.tags.length) {
      tagsEl.innerHTML = profile.tags.map(tag => `<li>${tag}</li>`).join("");
    }
    const metaValues = $$(".empresa-meta .meta-value");
    if (metaValues[0] && profile.sector) metaValues[0].textContent = profile.sector;
    if (metaValues[1] && profile.headquarters) metaValues[1].textContent = profile.headquarters;
    if (metaValues[2] && profile.model) metaValues[2].textContent = profile.model;
    const contact = profile.contact || {};
    const contactSpans = $$(".empresa-contatos span");
    if (contactSpans[0] && (contact.instagram || data.company)) contactSpans[0].textContent = contact.instagram || data.company;
    if (contactSpans[1] && (contact.linkedin || profile.caption)) contactSpans[1].textContent = contact.linkedin || profile.caption;
    if (contactSpans[2] && contact.email) contactSpans[2].textContent = contact.email;
    if (contactSpans[3] && (contact.address || contact.phone)) contactSpans[3].textContent = contact.address || contact.phone;
    const bioEl = $("#bio-empresa p");
    if (bioEl && profile.bio) bioEl.textContent = profile.bio;
    if (profile.agendaToday || profile.agendaToday === 0) {
      if (agendaEl) agendaEl.textContent = profile.agendaToday;
      if (window.localStorage) {
        try { localStorage.setItem("mapslink_agenda_hoje", JSON.stringify(profile.agendaToday)); } catch {}
      }
    }
    if (curriculosCard) {
      const badge = curriculosCard.querySelector(".badge-count");
      if (badge && (profile.curriculos || profile.curriculos === 0)) badge.textContent = profile.curriculos;
      if (profile.curriculos || profile.curriculos === 0) {
        try { localStorage.setItem("mapslink_curriculos_recebidos", JSON.stringify(profile.curriculos)); } catch {}
      }
    }
  }

  const auth = window.MapsAuth;
  if (auth && typeof auth.ready === "function") {
    auth.ready().then(() => hydrateFromAuth(auth.current()));
    if (auth.onSession) auth.onSession(data => hydrateFromAuth(data));
  }

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
