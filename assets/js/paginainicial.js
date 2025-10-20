(() => {
  if (window.__ml_home_init__) return;
  window.__ml_home_init__ = true;

  const sectionIds = ["home", "sobre", "planos", "maps", "profile", "about", "contact"];
  const maxTilt = 6;

  function navLinks() {
    if (window.MapsApp && typeof window.MapsApp.navLinks === "function") {
      try {
        return window.MapsApp.navLinks() || [];
      } catch {
        return Array.from(document.querySelectorAll(".nav-links a"));
      }
    }
    return Array.from(document.querySelectorAll(".nav-links a"));
  }

  function easeOutBack(value, overshoot) {
    const s = overshoot !== undefined ? overshoot : 1.25;
    const t = value - 1;
    return 1 + t * t * ((s + 1) * t + s);
  }

  function animateCard(element, duration, delay) {
    const start = { time: null };
    function frame(timestamp) {
      if (start.time === null) start.time = timestamp;
      const elapsed = timestamp - start.time;
      if (elapsed < delay) {
        requestAnimationFrame(frame);
        return;
      }
      const progress = Math.min(1, (elapsed - delay) / duration);
      const eased = easeOutBack(progress, 1.25);
      const translateY = (1 - eased) * 28;
      const rotateX = (1 - eased) * 8;
      const scale = 0.96 + 0.08 * eased;
      element.style.opacity = String(progress);
      element.style.transform = `perspective(800px) translateY(${translateY.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        element.style.transform = "translateY(0)";
      }
    }
    requestAnimationFrame(frame);
  }

  function initNavHighlight(links, sections) {
    const mapByKey = new Map();
    links.forEach(link => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      if (href) mapByKey.set(href, link);
      const key = (link.dataset.navKey || link.textContent || "").trim().toLowerCase();
      if (key) mapByKey.set(key, link);
    });

    function highlight(target) {
      const norm = (target || "").toLowerCase();
      links.forEach(link => {
        if ((link.getAttribute("href") || "").startsWith("#")) {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        }
      });
      const match = mapByKey.get(`#${norm}`) || mapByKey.get(norm);
      if (match) {
        match.classList.add("active");
        match.setAttribute("aria-current", "page");
      }
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          highlight(entry.target.id || "");
        }
      });
    }, { threshold: 0.6 });

    sections.forEach(section => observer.observe(section));
  }

  function initCardReveal(cards) {
    cards.forEach(card => {
      card.style.opacity = "0";
      card.style.transform = "perspective(800px) translateY(28px) rotateX(8deg) scale(0.96)";
      card.style.transformOrigin = "50% 80%";
      card.style.willChange = "transform, opacity";
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = cards.indexOf(entry.target);
        animateCard(entry.target, 700, index * 120);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.25 });

    cards.forEach(card => observer.observe(card));
  }

  function initCardTilt(cards) {
    cards.forEach(card => {
      card.addEventListener("mousemove", event => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (event.clientX - cx) / (rect.width / 2);
        const dy = (event.clientY - cy) / (rect.height / 2);
        const rx = (-dy * maxTilt).toFixed(2);
        const ry = (dx * maxTilt).toFixed(2);
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(0)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });
    });
  }

  function initFloatingIcons() {
    const icons = Array.from(document.querySelectorAll(".icones-flutuantes-grid .icone-flutuante"));
    if (!icons.length) return;
    const data = icons.map(icon => ({
      el: icon,
      amplitude: 6 + Math.random() * 6,
      speed: 0.6 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2
    }));

    data.forEach(item => {
      item.el.style.willChange = "transform";
    });

    let start = null;
    function step(timestamp) {
      if (start === null) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      data.forEach(item => {
        const offsetY = Math.sin(elapsed * item.speed + item.phase) * item.amplitude;
        item.el.style.transform = `translateY(${offsetY.toFixed(2)}px)`;
      });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init() {
    const links = navLinks();
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    if (sections.length) initNavHighlight(links, sections);
    const cardList = Array.from(document.querySelectorAll(".card-sobre"));
    if (cardList.length) {
      initCardReveal(cardList);
      initCardTilt(cardList);
    }
    initFloatingIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
