const token = localStorage.getItem("jwt_token");
if (!token) {
  window.location.href = "loginempresa.html"; 
}
(() => {
  if (window.__ml_perfilempresa_init__) return;
  window.__ml_perfilempresa_init__ = true;

  const { normalizeText } = window.MapsUtils || {};
  const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const AVATAR_SELECTOR = ".empresa-hero-avatar img";
  const AVATAR_WRAPPER_SELECTOR = ".empresa-hero-avatar";

  function valueToString(value) {
    if (value === 0) return "0";
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (!value) return "";
    return String(value).trim();
  }

  function setText(node, value) {
    if (!node) return;
    const text = valueToString(value);
    const has = text !== "";
    if (has) {
      node.textContent = text;
      if (node.classList) node.classList.remove("is-placeholder");
    } else if (node.dataset?.placeholder) {
      node.textContent = node.dataset.placeholder;
      if (node.classList) node.classList.add("is-placeholder");
    } else {
      node.textContent = "";
      if (node.classList) node.classList.remove("is-placeholder");
    }
    if (node.classList) node.classList.toggle("is-empty", !has);
  }

  function setList(node, values, formatter) {
    if (!node) return;
    const items = Array.isArray(values)
      ? values
          .map(item => (typeof item === "string" ? item.trim() : item))
          .filter(item => item || item === 0)
      : [];
    if (!items.length) {
      const placeholder = node.dataset?.placeholder || "";
      node.innerHTML = placeholder ? `<li class="placeholder-item">${placeholder}</li>` : "";
      node.dataset.empty = "true";
      if (node.classList) {
        node.classList.add("is-empty");
        node.classList.toggle("is-placeholder", !!placeholder);
      }
      return;
    }
    node.innerHTML = items.map(formatter).join("");
    node.dataset.empty = "false";
    if (node.classList) {
      node.classList.remove("is-empty");
      node.classList.remove("is-placeholder");
    }
  }

  function setAvatar(src) {
    const wrapper = query(AVATAR_WRAPPER_SELECTOR);
    const img = query(AVATAR_SELECTOR);
    if (!wrapper || !img) return;
    const has = !!src;
    img.src = has ? src : EMPTY_IMAGE;
    img.alt = has ? "Logo ou foto da empresa" : "";
    wrapper.classList.toggle("is-empty", !has);
  }

  function query(selector, root) {
    return (root || document).querySelector(selector);
  }

  function queryAll(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
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
    const valid = data?.type === "business";
    const profile = valid && data.profile ? data.profile : {};
    setAvatar(valid && profile.avatar ? profile.avatar : "");
    setText(query("#empresa-nome-exibicao"), valid ? data.company || data.name : "");
    setText(query(".empresa-hero-desc"), profile.caption);
    const tagList = Array.isArray(profile.tags)
      ? profile.tags
      : typeof profile.tags === "string"
        ? profile.tags.split(",").map(tag => tag.trim()).filter(Boolean)
        : [];
    setList(query(".empresa-hero-tags"), tagList, tag => `<li>${tag}</li>`);
    const meta = queryAll(".empresa-meta .meta-value");
    [profile.sector, profile.headquarters, profile.model].forEach((value, index) => setText(meta[index], value));
    const contact = profile.contact || {};
    const contacts = [
      contact.instagram || "",
      contact.linkedin || "",
      contact.email || "",
      profile.site || "",
      contact.address || contact.phone || ""
    ];
    queryAll(".empresa-contatos span").forEach((node, index) => setText(node, contacts[index]));
    setText(query("#bio-empresa p"), profile.bio);
    const agenda = query("#agenda-entrevistas .agenda-numero");
    setText(agenda, profile.agendaToday ?? "");
    storage.set("mapslink_agenda_hoje", profile.agendaToday ?? null);
    const card = query("#curriculos-recebidos");
    if (card) {
      const badge = ensureBadge(card);
      const amount = valueToString(profile.curriculos ?? "");
      if (amount) {
        badge.textContent = amount;
        badge.style.display = "inline-block";
      } else {
        badge.textContent = "";
        badge.style.display = "none";
      }
    }
    storage.set("mapslink_curriculos_recebidos", profile.curriculos ?? null);
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
        if (value === null || value === undefined) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
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
    const agendaValue = storage.get("mapslink_agenda_hoje", null);
    setText(query("#agenda-entrevistas .agenda-numero"), agendaValue ?? "");
    const curriculosValue = storage.get("mapslink_curriculos_recebidos", null);
    const card = query("#curriculos-recebidos");
    if (card) {
      const badge = ensureBadge(card);
      const amount = valueToString(curriculosValue ?? "");
      if (amount) {
        badge.textContent = amount;
        badge.style.display = "inline-block";
      } else {
        badge.textContent = "";
        badge.style.display = "none";
      }
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
      const term = normalizeText(search.value || "");
      rows.forEach(row => {
        const text = normalizeText(row.textContent || "");
        row.style.display = term && !text.includes(term) ? "none" : "";
      });
    });
  }

  function init() {
    hydrateFromAuth(null);
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
        setText(query("#agenda-entrevistas .agenda-numero"), num);
      },
      setCurriculos(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return;
        storage.set("mapslink_curriculos_recebidos", num);
        const card = query("#curriculos-recebidos");
        if (card) {
          const badge = ensureBadge(card);
          badge.textContent = valueToString(num);
          badge.style.display = "inline-block";
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();





