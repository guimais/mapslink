const token = localStorage.getItem("jwt_token");
if (!token) {
  window.location.href = "loginpessoal.html"; 
}

(() => {
  if (window.__ml_perfilusuario_init__) return;
  window.__ml_perfilusuario_init__ = true;

  const sectionIds = ["#home", "#planos", "#maps", "#profile", "#about", "#contact"];

  const selectors = {
    header: ".nav-container",
    heroDesc: ".perfil-hero-desc",
    heroTags: ".perfil-hero-tags",
    metaValues: ".perfil-meta .meta-value",
    bio: "#perfil-bio p",
    status: "#perfil-status .agenda-numero",
    contacts: ".perfil-contatos span",
    experiences: ".perfil-experiencias-list",
    contactLinks: ".perfil-contatos a",
    avatar: ".perfil-hero-avatar img",
    avatarWrapper: ".perfil-hero-avatar",
    revealTargets: ".card, .bloco, .curriculo-card",
    cards: ".card",
    miniCards: ".curriculo-experiencias li"
  };

  const CV_STORAGE_KEY = "mapslink:perfil:curriculo_pdf";
  const CV_MAX_SIZE = 5 * 1024 * 1024;

  const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  function valueToString(value) {
    if (value === 0) return "0";
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (!value) return "";
    return String(value).trim();
  }

  function hasContent(value) {
    return valueToString(value) !== "";
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
    const wrapper = query(selectors.avatarWrapper);
    const img = query(selectors.avatar);
    if (!wrapper || !img) return;
    const has = !!src;
    img.src = has ? src : EMPTY_IMAGE;
    img.alt = has ? "Foto do perfil" : "";
    wrapper.classList.toggle("is-empty", !has);
  }

  const state = {
    navLinks: [],
    sections: [],
    toast: null
  };

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

  function closeMenu() {
    if (window.MapsApp?.closeNav) {
      try {
        window.MapsApp.closeNav();
      } catch {}
    }
  }

  function toggleMenu() {
    if (window.MapsNav?.toggle) {
      try {
        window.MapsNav.toggle();
      } catch {}
    }
  }

  function setupScrollHeader() {
    const header = query(selectors.header);
    if (!header) return;
    const handleScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 6);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  function setupNav() {
    state.navLinks = navLinks();
    state.sections = sectionIds.map(id => query(id)).filter(Boolean);

    state.navLinks
      .filter(link => (link.getAttribute("href") || "").startsWith("#"))
      .forEach(link => {
        if (link.dataset.bound) return;
        link.dataset.bound = "true";
        link.addEventListener("click", event => {
          const hash = link.getAttribute("href");
          const target = hash ? document.querySelector(hash) : null;
          if (!target) return;
          event.preventDefault();
          closeMenu();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.pushState(null, "", hash);
        });
      });

    if (!state.sections.length) {
      markActiveLink();
      return;
    }

    const sectionLinks = state.navLinks.filter(link => (link.getAttribute("href") || "").startsWith("#"));
    if (!sectionLinks.length) {
      markActiveLink();
      return;
    }

    const map = new Map(sectionLinks.map(link => [link.getAttribute("href"), link]));

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        if (highlightNav(id)) return;
        sectionLinks.forEach(link => link.classList.remove("active"));
        map.get(id)?.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0.01 });

    state.sections.forEach(section => observer.observe(section));

    const start = location.hash && map.get(location.hash) ? location.hash : "#profile";
    if (!highlightNav(start)) map.get(start)?.classList.add("active");
  }

  function markActiveLink() {
    const path = (location.pathname.split("/").pop() || "index.html").split("?")[0];
    const activeKey = (document.body?.dataset?.navActive || "").trim().toLowerCase();
    if (highlightNav(path)) return;
    state.navLinks.forEach(link => {
      const hrefRaw = (link.getAttribute("href") || "").split("?")[0];
      if (!hrefRaw || hrefRaw.startsWith("#")) return;
      const href = hrefRaw.split("/").pop();
      const key = (link.dataset?.navKey || link.textContent || "").trim().toLowerCase();
      const match = href === path || (activeKey && key === activeKey);
      link.classList.toggle("active", match);
      if (match) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function createToast() {
    const id = "perfiluser-toast";
    let element = document.getElementById(id);
    if (!element) {
      element = document.createElement("div");
      element.id = id;
      Object.assign(element.style, {
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
        zIndex: "9999"
      });
      document.body.appendChild(element);
    }
    let timer;
    return message => {
      clearTimeout(timer);
      element.textContent = message;
      element.style.opacity = "1";
      timer = setTimeout(() => {
        element.style.opacity = "0";
      }, 1400);
    };
  }

  function formatFileSize(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) return "0 KB";
    let size = value / 1024;
    if (size < 1) return "< 1 KB";
    const units = ["KB", "MB", "GB"];
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }
    const precision = size >= 10 ? 0 : 1;
    return `${size.toFixed(precision)} ${units[unit]}`;
  }

  function formatUpdatedAt(timestamp) {
    if (!timestamp) return "";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp));
    } catch {
      return "";
    }
  }

  function readStoredCv() {
    try {
      const raw = localStorage.getItem(CV_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return typeof parsed.dataUrl === "string" ? parsed : null;
    } catch {
      return null;
    }
  }

  function saveStoredCv(payload) {
    try {
      localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch {
      state.toast?.("Não foi possível salvar o currículo neste navegador.");
      return false;
    }
  }

  function clearStoredCv() {
    try {
      localStorage.removeItem(CV_STORAGE_KEY);
      return true;
    } catch {
      state.toast?.("Não foi possível remover o currículo neste navegador.");
      return false;
    }
  }

  function dataUrlToBlob(dataUrl) {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) return null;
    const [meta, content] = dataUrl.split(",");
    if (!content) return null;
    try {
      const mime = (meta.match(/data:(.*?);/) || [])[1] || "application/pdf";
      const binary = atob(content);
      const length = binary.length;
      const buffer = new Uint8Array(length);
      for (let i = 0; i < length; i += 1) buffer[i] = binary.charCodeAt(i);
      return new Blob([buffer], { type: mime });
    } catch {
      return null;
    }
  }

  function openCvPreview(payload) {
    if (!payload?.dataUrl) return false;
    const blob = dataUrlToBlob(payload.dataUrl);
    if (!blob) {
      state.toast?.("Não foi possível carregar o PDF salvo.");
      return false;
    }
    const url = URL.createObjectURL(blob);
    const preview = window.open(url, "_blank", "noopener");
    if (!preview) {
      state.toast?.("Permita pop-ups para visualizar o currículo.");
      URL.revokeObjectURL(url);
      return false;
    }
    preview.focus();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  }

  function initCvWidget() {
    const widget = query("[data-cv-widget]");
    if (!widget) return;
    if (widget.dataset.cvBound) return;
    widget.dataset.cvBound = "true";

    const trigger = widget.querySelector("[data-cv-trigger]");
    const meta = widget.querySelector("[data-cv-meta]");
    const name = widget.querySelector("[data-cv-name]");
    const change = widget.querySelector("[data-cv-change]");
    const remove = widget.querySelector("[data-cv-remove]");
    const input = widget.querySelector("[data-cv-input]");
    if (!trigger || !input) return;

    let cached = readStoredCv();
    updateUI(cached);

    trigger.addEventListener("click", () => {
      if (cached?.dataUrl) {
        openCvPreview(cached);
        return;
      }
      input.click();
    });

    change?.addEventListener("click", event => {
      event.preventDefault();
      input.click();
    });

    remove?.addEventListener("click", event => {
      event.preventDefault();
      if (!cached?.dataUrl) return;
      const confirmed = typeof window.confirm === "function" ? window.confirm("Remover o currículo salvo?") : true;
      if (!confirmed) return;
      if (!clearStoredCv()) return;
      cached = null;
      updateUI(null);
      state.toast?.("Currículo removido.");
    });

    input.addEventListener("change", event => {
      const file = event.target?.files?.[0];
      input.value = "";
      if (!file) return;
      if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        state.toast?.("Envie um arquivo em PDF.");
        return;
      }
      if (file.size > CV_MAX_SIZE) {
        state.toast?.("O limite é de 5 MB por arquivo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          state.toast?.("Não foi possível processar o PDF.");
          return;
        }
        const payload = {
          name: file.name,
          size: file.size,
          updatedAt: Date.now(),
          dataUrl: reader.result
        };
        if (!saveStoredCv(payload)) return;
        cached = payload;
        updateUI(payload);
        state.toast?.("Currículo salvo com sucesso.");
      };
      reader.onerror = () => state.toast?.("Não foi possível ler o arquivo.");
      reader.readAsDataURL(file);
    });

    function updateUI(data) {
      const hasFile = !!(data && data.dataUrl);
      trigger.setAttribute("data-has-file", hasFile ? "true" : "false");
      trigger.setAttribute(
        "aria-label",
        hasFile ? "Abrir currículo salvo em nova guia" : "Enviar currículo em PDF"
      );
      if (meta) {
        meta.hidden = !hasFile;
        if (hasFile && name) {
          const updatedText = formatUpdatedAt(data.updatedAt);
          const sizeText = formatFileSize(data.size);
          name.textContent = updatedText
            ? `${data.name} • ${sizeText} • ${updatedText}`
            : `${data.name} • ${sizeText}`;
        } else if (name) {
          name.textContent = "";
        }
      }
      if (remove) {
        remove.disabled = !hasFile;
      }
      if (change) {
        change.disabled = false;
      }
    }
  }

  function hydrateFromAuth(data) {
    const valid = data?.type === "personal";
    const profile = valid && data.profile ? data.profile : {};
    setAvatar(profile.avatar && valid ? profile.avatar : "");
    setText(query("#perfil-nome"), valid ? data.name || profile.fullName : "");
    setText(query(selectors.heroDesc), profile.headline);
    const skillList = Array.isArray(profile.skills)
      ? profile.skills
      : typeof profile.skills === "string"
        ? profile.skills.split(",").map(item => item.trim()).filter(Boolean)
        : [];
    setList(query(selectors.heroTags), skillList, skill => `<li>${skill}</li>`);
    const metaValues = queryAll(selectors.metaValues);
    [
      profile.specialty,
      profile.location,
      profile.experience,
      profile.availability
    ].forEach((value, index) => setText(metaValues[index], value));
    setText(query(selectors.bio), profile.bio);
    setText(query(selectors.status), profile.interviewsToday ?? "");
    const contact = profile.contact || {};
    const contacts = [contact.instagram, contact.linkedin, contact.email, contact.phone];
    queryAll(selectors.contacts).forEach((node, index) => setText(node, contacts[index]));
    const list = query(selectors.experiences);
    if (list) {
      const experiences = Array.isArray(profile.experiences)
        ? profile.experiences.map(item => String(item).trim()).filter(Boolean)
        : [];
      if (!experiences.length) {
        const placeholder = list.dataset?.placeholder || "";
        list.innerHTML = placeholder ? `<li class="placeholder-item">${placeholder}</li>` : "";
        list.dataset.empty = "true";
        if (list.classList) list.classList.toggle("is-placeholder", !!placeholder);
      } else {
        list.innerHTML = experiences
          .map(item => {
            const [role, ...rest] = item.split(" - ");
            const title = role.trim();
            const detail = rest.join(" - ").trim();
            return `<li><span class="perfil-exp-role">${title}</span><span class="perfil-exp-detail">${detail}</span></li>`;
          })
          .join("");
        list.dataset.empty = "false";
        if (list.classList) list.classList.remove("is-placeholder");
      }
    }
  }

  function hydrateFromStorage() {
    const sources = ["mapslink:perfil:usuario", "perfilCurriculoData"];
    for (const key of sources) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const payload =
          parsed && typeof parsed === "object"
            ? parsed.payload && typeof parsed.payload === "object"
              ? parsed.payload
              : parsed
            : null;
        if (!payload || typeof payload !== "object") continue;
        const profile = payload.profile && typeof payload.profile === "object" ? payload.profile : payload;
        const name = payload.name || "";
        hydrateFromAuth({ type: "personal", name, profile });
        return;
      } catch {
        continue;
      }
    }
  }

  function bindContactCopies() {
    const links = queryAll(selectors.contactLinks);
    links.forEach(link => {
      if (link.dataset.copyBound) return;
      link.dataset.copyBound = "true";
      link.addEventListener("click", async event => {
        const href = link.getAttribute("href") || "";
        const text = (() => {
          if (href.startsWith("mailto:")) return href.replace(/^mailto:/, "");
          if (href.startsWith("tel:")) return href.replace(/^tel:/, "");
          return (link.textContent || "").trim();
        })();
        try {
          await navigator.clipboard?.writeText?.(text);
          state.toast(`Copiado: ${text}`);
          if (/^https?:\/\//i.test(href)) {
            event.preventDefault();
            window.open(href, "_blank", "noopener");
          }
        } catch {
          state.toast("Não foi possível copiar");
        }
      });
    });
  }

  function setupReveal() {
    const nodes = queryAll(selectors.revealTargets);
    if (!nodes.length) return;
    nodes.forEach(node => {
      node.style.opacity = "0";
      node.style.transform = "translateY(8px)";
      node.style.transition = "opacity .35s ease, transform .35s ease";
    });
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    nodes.forEach(node => observer.observe(node));
  }

  function setupShortcuts() {
    document.addEventListener("keydown", event => {
      if (event.altKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMenu();
      }
    });
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      return false;
    }
  }

  function ensureStyle(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function initCardAnimations() {
    ensureStyle(
      "cards-anim-styles",
      [
        ".js-card-hover{transition:transform .18s ease, box-shadow .18s ease, opacity .32s ease;}",
        ".js-card-init{opacity:0;transform:translateY(14px);}",
        ".js-card-in{opacity:1;transform:translateY(0);}",
        ".js-card-in.js-card-elevate:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.08)!important;}",
        ".js-card-pressed{transform:translateY(0) scale(.995)!important;}"
      ].join("")
    );

    const cards = queryAll(selectors.cards);
    if (!cards.length) return;
    const reduced = prefersReducedMotion();

    cards.forEach(card => {
      if (card.dataset.cardBound) return;
      card.dataset.cardBound = "true";
      card.classList.add("js-card-hover", "js-card-elevate");
      if (!reduced) card.classList.add("js-card-init");
      card.addEventListener("pointerdown", () => card.classList.add("js-card-pressed"));
      ["pointerup", "pointercancel", "pointerleave"].forEach(evt => {
        card.addEventListener(evt, () => card.classList.remove("js-card-pressed"));
      });
    });

    if (reduced) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("js-card-in");
        entry.target.classList.remove("js-card-init");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    cards.forEach(card => observer.observe(card));
  }

  function initMiniAnimations() {
    ensureStyle(
      "mini-cards-anim-styles",
      [
        ".js-mini{transition:transform .2s ease, box-shadow .25s ease, opacity .35s ease, background-position .25s ease;position:relative;overflow:hidden;}",
        ".js-mini-light{background-image:radial-gradient(420px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.10),rgba(255,255,255,0) 45%);background-repeat:no-repeat;}",
        ".js-mini-init{opacity:0;transform:translateX(12px);}",
        ".js-mini-in{opacity:1;transform:none;}",
        ".js-mini:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(0,0,0,.22);}",
        ".js-mini-press{transform:translateY(0) scale(.995)!important;}"
      ].join("")
    );

    const items = queryAll(selectors.miniCards);
    if (!items.length) return;
    const reduced = prefersReducedMotion();

    items.forEach((item, index) => {
      if (item.dataset.miniBound) return;
      item.dataset.miniBound = "true";
      item.dataset.idx = String(index);
      item.classList.add("js-mini", "js-mini-light");
      if (!reduced) item.classList.add("js-mini-init");
      item.addEventListener("pointermove", event => {
        const rect = item.getBoundingClientRect();
        item.style.setProperty("--mx", `${Math.round(event.clientX - rect.left)}px`);
        item.style.setProperty("--my", `${Math.round(event.clientY - rect.top)}px`);
      });
      item.addEventListener("pointerdown", () => item.classList.add("js-mini-press"));
      ["pointerup", "pointercancel", "pointerleave"].forEach(evt => {
        item.addEventListener(evt, () => item.classList.remove("js-mini-press"));
      });
    });

    if (reduced) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = (parseInt(el.dataset.idx || "0", 10) % 8) * 70;
        setTimeout(() => {
          el.classList.add("js-mini-in");
          el.classList.remove("js-mini-init");
        }, delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });

    items.forEach(item => observer.observe(item));
  }

  function initAuth() {
    const auth = window.MapsAuth;
    if (!auth?.ready) {
      hydrateFromStorage();
      return;
    }
    auth.ready().then(() => hydrateFromAuth(auth.current()));
    if (auth.onSession) auth.onSession(hydrateFromAuth);
  }

  function init() {
    hydrateFromAuth(null);
    state.toast = createToast();
    setupScrollHeader();
    setupNav();
    markActiveLink();
    initAuth();
    bindContactCopies();
    setupReveal();
    setupShortcuts();
    initCvWidget();
    initCardAnimations();
    initMiniAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
