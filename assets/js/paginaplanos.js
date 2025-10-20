(() => {
  if (window.__ml_planos_init__) return;
  window.__ml_planos_init__ = true;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function selectOne(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function ensureStyles() {
    if (document.getElementById("app-dynamic-styles")) return;
    const style = document.createElement("style");
    style.id = "app-dynamic-styles";
    style.textContent =
      "[data-animate=\"fade-up\"]{opacity:0;transform:translateY(8px);}" +
      ".in-view{opacity:1;transform:none;transition:transform .6s ease,opacity .6s ease;}" +
      ".ripple-wrap{position:relative;overflow:hidden;}" +
      ".ripple{position:absolute;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;width:10px;height:10px;background:currentColor;opacity:.25;animation:ripple .6s ease-out;}" +
      "@keyframes ripple{from{opacity:.35;transform:translate(-50%,-50%) scale(1);}to{opacity:0;transform:translate(-50%,-50%) scale(18);}}" +
      ".snackbar{position:fixed;right:20px;bottom:20px;background:var(--brand,#102569);color:#fff;padding:12px 16px;border-radius:12px;box-shadow:var(--shadow-md,0 8px 18px rgba(16,37,105,.14));opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .3s,transform .3s;z-index:2000;display:flex;align-items:center;gap:10px;font-weight:700;}" +
      ".snackbar.show{opacity:1;transform:none;pointer-events:auto;}" +
      ".snackbar .close{background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer;}" +
      ".plan-selected{outline:2px solid var(--brand-2,#0b1b4a);box-shadow:0 0 0 4px rgba(16,37,105,.12);}" +
      ".burst{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;}" +
      ".burst span{position:absolute;width:8px;height:8px;border-radius:50%;opacity:.9;}";
    document.head.appendChild(style);
  }

  function getNavLinks() {
    if (window.MapsApp && typeof window.MapsApp.navLinks === "function") {
      try {
        return window.MapsApp.navLinks() || [];
      } catch {
        return selectAll(".nav-link");
      }
    }
    return selectAll(".nav-link");
  }

  function showSection(id, sections, links) {
    sections.forEach(section => {
      const active = section.id === id;
      section.toggleAttribute("hidden", !active);
      if (active) {
        section.setAttribute("tabindex", "-1");
        try {
          section.focus({ preventScroll: true });
        } catch {
          /* ignore focus errors */
        }
        section.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
    });

    links.forEach(link => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const active = href === `#${id}`;
      link.classList.toggle("active", active);
      link.setAttribute("aria-current", active ? "page" : "false");
    });

    if (id) history.replaceState(null, "", `#${id}`);

    if (window.MapsApp && typeof window.MapsApp.highlightNav === "function") {
      try {
        window.MapsApp.highlightNav(`#${id}`);
      } catch {
        /* no-op */
      }
    }
  }

  function setupSectionRouting() {
    const links = getNavLinks();
    const sectionIds = ["home", "planos", "maps", "profile", "about", "contact"];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    links.forEach(link => {
      if (link.__ml_planos_bound) return;
      link.__ml_planos_bound = true;
      link.addEventListener("click", event => {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        event.preventDefault();
        const id = href.slice(1);
        const target = document.getElementById(id);
        const hasContent = !!(target && target.children && target.children.length);
        if (id !== "planos" && (!target || !hasContent)) {
          showSection("planos", sections, links);
          showToast("Secao em construcao");
        } else if (target) {
          showSection(id, sections, links);
        }
        if (window.MapsApp && typeof window.MapsApp.closeNav === "function") {
          try {
            window.MapsApp.closeNav();
          } catch {
            /* no-op */
          }
        }
      });
    });

    const initialCandidate = (location.hash && location.hash.slice(1)) || "planos";
    const initialElement = document.getElementById(initialCandidate);
    const initialHasContent = !!(initialElement && initialElement.children && initialElement.children.length);
    const firstSection = initialHasContent ? initialCandidate : "planos";
    if (document.getElementById(firstSection)) {
      showSection(firstSection, sections, links);
    }
  }

  function setupReveal() {
    if (prefersReducedMotion) return;
    const cards = selectAll(".plano-card");
    if (!cards.length) return;
    cards.forEach(card => card.setAttribute("data-animate", "fade-up"));
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.16 });
    cards.forEach(card => observer.observe(card));
  }

  function attachRipple(selector) {
    selectAll(selector || ".botao").forEach(button => {
      if (button.__ml_ripple_bound) return;
      button.__ml_ripple_bound = true;
      button.classList.add("ripple-wrap");
      button.addEventListener("click", event => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX || rect.left + rect.width / 2) - rect.left;
        const y = (event.clientY || rect.top + rect.height / 2) - rect.top;
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        button.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
      });
    });
  }

  let snackbar = null;

  function ensureSnackbar() {
    if (snackbar) return snackbar;
    snackbar = document.createElement("div");
    snackbar.className = "snackbar";
    snackbar.setAttribute("role", "status");
    snackbar.setAttribute("aria-live", "polite");

    const text = document.createElement("span");
    text.className = "snackbar-text";
    const close = document.createElement("button");
    close.className = "close";
    close.setAttribute("aria-label", "Fechar");
    close.innerHTML = "&times;";
    close.addEventListener("click", hideToast);

    snackbar.append(text, close);
    document.body.appendChild(snackbar);
    return snackbar;
  }

  function showToast(message, timeout) {
    const el = ensureSnackbar();
    el.querySelector(".snackbar-text").textContent = message;
    el.classList.add("show");
    if (showToast.timer) clearTimeout(showToast.timer);
    showToast.timer = setTimeout(hideToast, typeof timeout === "number" ? timeout : 2600);
  }

  function hideToast() {
    if (!snackbar) return;
    snackbar.classList.remove("show");
  }

  function burstFrom(element) {
    if (prefersReducedMotion) return;
    const rect = element.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const group = document.createElement("div");
    group.className = "burst";
    if (!/relative|absolute|fixed|sticky/.test(getComputedStyle(element).position)) {
      element.style.position = "relative";
    }
    element.appendChild(group);

    const colors = ["#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#8338ec"];
    const total = 12;
    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement("span");
      dot.style.background = colors[index % colors.length];
      dot.style.left = `${centerX}px`;
      dot.style.top = `${centerY}px`;
      const angle = (index / total) * 2 * Math.PI;
      const distance = 20 + Math.random() * 32;
      const translateX = Math.cos(angle) * distance;
      const translateY = Math.sin(angle) * distance;
      dot.animate(
        [
          { transform: "translate(-50%,-50%) translate(0,0)", opacity: 0.9 },
          { transform: `translate(-50%,-50%) translate(${translateX}px,${translateY}px)`, opacity: 0 }
        ],
        { duration: 700, easing: "ease-out" }
      );
      group.appendChild(dot);
    }
    setTimeout(() => group.remove(), 720);
  }

  function setupPlans() {
    const buttons = selectAll(".botao.assinar");
    if (!buttons.length) return;
    const STORAGE_KEY = "selectedPlan";

    function updateCard(plan, selected) {
      const button = buttons.find(b => b.dataset.plan === plan);
      if (!button) return;
      button.textContent = selected ? "Assinado" : "Assinar";
      button.disabled = !!selected;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      const card = button.closest(".plano-card");
      if (card) card.classList.toggle("plan-selected", !!selected);
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) updateCard(saved, true);

    buttons.forEach(button => {
      if (button.__ml_plan_bound) return;
      button.__ml_plan_bound = true;
      button.addEventListener("click", () => {
        const plan = button.dataset.plan;
        if (!plan) return;
        localStorage.setItem(STORAGE_KEY, plan);
        buttons.forEach(b => updateCard(b.dataset.plan, b.dataset.plan === plan));
        burstFrom(button);
        const name = plan.charAt(0).toUpperCase() + plan.slice(1);
        const label = plan === "gold" ? "Plano Gold" : plan === "silver" ? "Plano Silver" : "Plano Bronze";
        showToast(`${label} ativado!`);
      });
    });
  }

  function init() {
    ensureStyles();
    setupSectionRouting();
    setupReveal();
    attachRipple(".botao");
    setupPlans();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
