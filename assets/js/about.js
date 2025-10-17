(function () {
  "use strict";

  function ensureStyles() {
    if (document.getElementById("ml-about-styles")) return;
    const s = document.createElement("style");
    s.id = "ml-about-styles";
    s.textContent = `
.ml-toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%) translateY(0);
  background: rgba(16,37,105,.95);
  color: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(0,0,0,.18);
  font-weight: 700;
  z-index: 9999;
  opacity: 0;
  transition: opacity .25s ease, transform .25s ease;
}
.ml-toast.is-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(-6px);
}

.about-container .ml-reveal {
  opacity: 0;
  transform: translateY(12px);
  will-change: opacity, transform;
  transition: opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1);
  transition-delay: var(--ml-delay, 0ms);
}
.about-container .ml-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
  will-change: auto;
}

#readingProgress.ml-reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0%;
  background: #000;
  z-index: 1500;
  transform-origin: 0 50%;
  transition: width .15s linear;
}

@media (prefers-reduced-motion: reduce) {
  .about-container .ml-reveal {
    transition: opacity .3s ease;
  }
  #readingProgress.ml-reading-progress {
    transition: none;
  }
}
`;
    document.head.appendChild(s);
  }

  function showToast(text) {
    ensureStyles();
    const t = document.createElement("div");
    t.className = "ml-toast";
    t.textContent = text;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("is-visible"));
    setTimeout(() => {
      t.classList.remove("is-visible");
      setTimeout(() => t.remove(), 250);
    }, 2200);
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setupReveal() {
    ensureStyles();
    const revealEls = document.querySelectorAll(".about-container p, .about-container h3, .about-cta");
    revealEls.forEach((el, idx) => {
      el.classList.add("ml-reveal");
      if (!reduceMotion) el.style.setProperty("--ml-delay", `${Math.min(10, idx * 40)}ms`);
    });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => obs.observe(el));
  }

  function mountReadingProgress() {
    ensureStyles();
    const container = document.querySelector(".about-container");
    if (!container) return;
    let bar = document.getElementById("readingProgress");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "readingProgress";
      bar.className = "ml-reading-progress";
      document.body.appendChild(bar);
    } else {
      bar.classList.add("ml-reading-progress");
    }
    function updateProgress() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? window.scrollY / docH : 0;
      bar.style.width = (p * 100).toFixed(2) + "%";
    }
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupReveal();
      mountReadingProgress();
    });
  } else {
    setupReveal();
    mountReadingProgress();
  }

  window.MapsAbout = { showToast };
})();
