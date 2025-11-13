(() => {
  if (window.__ml_about_init__) return;
  window.__ml_about_init__ = true;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function ensureStyles() {
    if (document.getElementById("ml-about-styles")) return;
    const style = document.createElement("style");
    style.id = "ml-about-styles";
    style.textContent = `
.ml-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,0);background:rgba(16,37,105,.95);color:#fff;padding:12px 16px;border-radius:12px;box-shadow:0 8px 18px rgba(0,0,0,.18);font-weight:700;z-index:9999;opacity:0;transition:opacity .25s ease,transform .25s ease;}
.ml-toast.is-visible{opacity:1;transform:translate(-50%,-6px);}
.about-container .ml-reveal{opacity:0;transform:translateY(12px);will-change:opacity,transform;transition:opacity .6s cubic-bezier(.2,.7,.2,1),transform .6s cubic-bezier(.2,.7,.2,1);transition-delay:var(--ml-delay,0ms);}
.about-container .ml-reveal.is-visible{opacity:1;transform:translateY(0);will-change:auto;}
#readingProgress.ml-reading-progress{position:fixed;top:0;left:0;height:3px;width:0;background:#000;z-index:1500;transform-origin:0 50%;transition:width .15s linear;}
@media (prefers-reduced-motion:reduce){
  .about-container .ml-reveal{transition:opacity .3s ease;}
  #readingProgress.ml-reading-progress{transition:none;}
}`;
    document.head.appendChild(style);
  }

  function showToast(text) {
    ensureStyles();
    const toast = document.createElement("div");
    toast.className = "ml-toast";
    toast.textContent = text;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 250);
    }, 2200);
  }

  function initReveal() {
    ensureStyles();
    const targets = document.querySelectorAll(
      ".about-container p, .about-container h3, .about-cta",
    );
    targets.forEach((element, index) => {
      element.classList.add("ml-reveal");
      if (!prefersReducedMotion)
        element.style.setProperty(
          "--ml-delay",
          `${Math.min(10, index * 40)}ms`,
        );
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );
    targets.forEach((element) => observer.observe(element));
  }

  function initReadingProgress() {
    ensureStyles();
    const container = document.querySelector(".about-container");
    if (!container) return;
    let bar = document.getElementById("readingProgress");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "readingProgress";
      document.body.appendChild(bar);
    }
    bar.classList.add("ml-reading-progress");

    function update() {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      bar.style.width = `${(progress * 100).toFixed(2)}%`;
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function init() {
    initReveal();
    initReadingProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.MapsAbout = { showToast };
})();
