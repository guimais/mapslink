(() => {
  if (window.__ml_perfilempresa_init__) return;
  window.__ml_perfilempresa_init__ = true;

  const ACCENTS = /[\u0300-\u036f]/g;

  function query(selector, root) {
    return (root || document).querySelector(selector);
  }

  function queryAll(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").normalize("NFD").replace(ACCENTS, "").toLowerCase();
  }

  function navLinks() {
    if (window.MapsApp?.navLinks) {
      try {
        return window.MapsApp.navLinks() || [];
      } catch {
        return queryAll(".nav-link");
      }
    }
    return queryAll(".nav-link");
  }

  function highlightNav(target) {
    if (window.MapsApp?.highlightNav) {
      try {
        window.MapsApp.highlightNav(target);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  function sameUrl(a, b) {
    try {
      const left = new URL(a, location.href);
      const right = new URL(b, location.href);
      if (left.hash || right.hash) return left.hash === right.hash;
      return left.origin === right.origin && left.pathname === right.pathname;
    } catch {
      return a === b;
    }
  }

  function setActiveLink(url) {
    if (highlightNav(url)) return;
    const links = navLinks();
    links.forEach(link => {
      const href = link.getAttribute("href") || "";
      const active = sameUrl(link.href || href, url) || (href.startsWith("#") && href === (location.hash || ""));
      link.classList.toggle("active", active);
      if (href.startsWith("#")) link.setAttribute("aria-current", active ? "page" : "false");
    });
  }

  function bindAnchors() {
    navLinks()
      .filter(link => (link.getAttribute("href") || "").startsWith("#"))
      .forEach(link => {
        if (link.dataset.bound) return;
        link.dataset.bound = "true";
        link.addEventListener("click", event => {
          const id = link.getAttribute("href");
          const target = id && query(id);
          if (!target) return;
          event.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: "smooth" });
          history.pushState(null, "", id);
          setActiveLink(location.href);
          if (window.MapsApp?.closeNav) {
            try {
              window.MapsApp.closeNav();
            } catch {}
          }
        });
      });
  }

  function hydrateFromAuth(data) {
    if (!data || data.type !== "business") return;
    const profile = data.profile || {};
    const name = query("#empresa-nome-exibicao");
    if (name && (data.company || data.name)) name.textContent = data.company || data.name;
    const desc = query(".empresa-hero-desc");
    if (desc && profile.caption) desc.textContent = profile.caption;
    const tags = query(".empresa-hero-tags");
    if (tags && Array.isArray(profile.tags) && profile.tags.length) {
      tags.innerHTML = profile.tags.map(tag => `<li>${tag}</li>`).join("");
    }
    const meta = queryAll(".empresa-meta .meta-value");
    if (meta[0] && profile.sector) meta[0].textContent = profile.sector;
    if (meta[1] && profile.headquarters) meta[1].textContent = profile.headquarters;
    if (meta[2] && profile.model) meta[2].textContent = profile.model;
    const contact = profile.contact || {};
    const contactSpans = queryAll(".empresa-contatos span");
    if (contactSpans[0] && (contact.instagram || data.company)) contactSpans[0].textContent = contact.instagram || data.company;
    if (contactSpans[1] && (contact.linkedin || profile.caption)) contactSpans[1].textContent = contact.linkedin || profile.caption;
    if (contactSpans[2] && contact.email) contactSpans[2].textContent = contact.email;
    if (contactSpans[3] && (contact.address || contact.phone)) contactSpans[3].textContent = contact.address || contact.phone;
    const bio = query("#bio-empresa p");
    if (bio && profile.bio) bio.textContent = profile.bio;
    if (profile.agendaToday || profile.agendaToday === 0) {
      const agenda = query("#agenda-entrevistas .agenda-numero");
      if (agenda) agenda.textContent = profile.agendaToday;
      storage.set("mapslink_agenda_hoje", profile.agendaToday);
    }
    if (profile.curriculos || profile.curriculos === 0) {
      const card = query("#curriculos-recebidos");
      if (card) {
        ensureBadge(card).textContent = profile.curriculos;
      }
      storage.set("mapslink_curriculos_recebidos", profile.curriculos);
    }
  }

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw != null ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }
  };

  function ensureBadge(card) {
    let badge = card.querySelector(".badge-count");
    if (badge) return badge;
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
    const title = card.querySelector(".card-title") || card.querySelector("h2");
    if (title) title.appendChild(badge);
    return badge;
  }

  function hydrateFromStorage() {
    const agenda = storage.get("mapslink_agenda_hoje", null);
    if (agenda != null) {
      const el = query("#agenda-entrevistas .agenda-numero");
      if (el) el.textContent = agenda;
    }
    const curriculos = storage.get("mapslink_curriculos_recebidos", null);
    if (curriculos != null) {
      const card = query("#curriculos-recebidos");
      if (card) ensureBadge(card).textContent = curriculos;
    }
  }

  function initAuth() {
    const auth = window.MapsAuth;
    if (!auth?.ready) {
      hydrateFromStorage();
      return;
    }
    auth.ready().then(() => {
      hydrateFromAuth(auth.current());
      hydrateFromStorage();
    });
    if (auth.onSession) auth.onSession(hydrateFromAuth);
  }

  function bindSearchHighlights() {
    const search = document.querySelector('input[data-filter="curriculos"]');
    const rows = queryAll(".curriculos-table tbody tr");
    if (!search || !rows.length) return;
    search.addEventListener("input", () => {
      const term = normalize(search.value);
      rows.forEach(row => {
        const text = normalize(row.textContent);
        row.style.display = term && !text.includes(term) ? "none" : "";
      });
    });
  }

  function init() {
    setActiveLink(location.href);
    bindAnchors();
    window.addEventListener("popstate", () => setActiveLink(location.href));
    initAuth();
    bindSearchHighlights();
    window.MapsLink = Object.assign({}, window.MapsLink, {
      setAgendaHoje(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return;
        storage.set("mapslink_agenda_hoje", num);
        const el = query("#agenda-entrevistas .agenda-numero");
        if (el) el.textContent = num;
      },
      setCurriculos(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return;
        storage.set("mapslink_curriculos_recebidos", num);
        const card = query("#curriculos-recebidos");
        if (card) ensureBadge(card).textContent = num;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
