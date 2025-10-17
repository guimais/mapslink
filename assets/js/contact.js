(function () {
  "use strict";

  function ensureStyles() {
    if (document.getElementById("ml-contact-styles")) return;
    const s = document.createElement("style");
    s.id = "ml-contact-styles";
    s.textContent = `
.ml-toast{
  position:fixed;
  left:50%;
  bottom:28px;
  transform:translateX(-50%) translateY(0);
  background:rgba(16,37,105,.95);
  color:#fff;
  padding:12px 16px;
  border-radius:12px;
  box-shadow:0 8px 18px rgba(0,0,0,.18);
  font-weight:700;
  z-index:9999;
  opacity:0;
  transition:opacity .25s ease, transform .25s ease;
}
.ml-toast.is-visible{
  opacity:1;
  transform:translateX(-50%) translateY(-6px);
}

.ml-ripple-host{position:relative;overflow:hidden}
.ml-ripple{
  position:absolute;
  border-radius:50%;
  background:rgba(255,255,255,.35);
  transform:scale(0);
  pointer-events:none;
  transition:transform 400ms ease, opacity 600ms ease;
}

.contact-reveal.ml-reveal{
  opacity:0;
  transform:translateY(16px);
  transition:opacity .4s ease, transform .4s ease;
}
.contact-reveal.ml-reveal.is-visible{
  opacity:1;
  transform:translateY(0);
}

.shake{animation:ml-shake .4s ease}
@keyframes ml-shake{
  10%,90%{transform:translateX(-1px)}
  20%,80%{transform:translateX(2px)}
  30%,50%,70%{transform:translateX(-4px)}
  40%,60%{transform:translateX(4px)}
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

  function $(s, r = document) { return r.querySelector(s) }
  function $$(s, r = document) { return [...r.querySelectorAll(s)] }

  function autoResizeTA(ta) {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }

  function mountRipple(e, target) {
    ensureStyles();
    const rect = target.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - d / 2;
    const y = e.clientY - rect.top - d / 2;
    const circle = document.createElement("span");
    circle.className = "ml-ripple";
    circle.style.left = x + "px";
    circle.style.top = y + "px";
    circle.style.width = d + "px";
    circle.style.height = d + "px";
    target.classList.add("ml-ripple-host");
    target.appendChild(circle);
    requestAnimationFrame(() => { circle.style.transform = "scale(1)"; });
    setTimeout(() => { circle.style.opacity = "0"; }, 320);
    setTimeout(() => { circle.remove(); }, 800);
  }

  function mountReveal() {
    ensureStyles();
    const el = document.querySelector(".contact-card");
    if (!el) return;
    el.classList.add("contact-reveal", "ml-reveal");
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-visible");
        io.disconnect();
      });
    }, { threshold: 0.2 });
    io.observe(el);
  }

  function init() {
    ensureStyles();

    const form = $(".contact-form");
    const inputs = form ? form.querySelectorAll("input, textarea") : [];
    const textArea = form ? form.querySelector("textarea") : null;
    const submitBtn = form ? form.querySelector('button[type="submit"], .botao') : null;

    if (textArea) {
      autoResizeTA(textArea);
      textArea.addEventListener("input", () => autoResizeTA(textArea));
    }

    inputs.forEach(el => {
      const setState = () => el.classList.toggle("is-filled", !!el.value.trim());
      el.addEventListener("input", setState);
      el.addEventListener("blur", setState);
      setState();
    });

    if (form && submitBtn) {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const data = new FormData(form);
        const nome = String(data.get("nome") || "").trim();
        const sobrenome = String(data.get("sobrenome") || "").trim();
        const email = String(data.get("email") || "").trim();
        const msg = String(data.get("mensagem") || "").trim();

        const errors = [];
        if (!nome) errors.push("Nome");
        if (!sobrenome) errors.push("Sobrenome");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("E-mail");
        if (msg.length < 5) errors.push("Mensagem");

        if (errors.length) {
          submitBtn.classList.add("shake");
          setTimeout(() => submitBtn.classList.remove("shake"), 400);
          showToast("Corrija: " + errors.join(", ") + " ⚠️");
          return;
        }

        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.8";
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Enviando...";

        setTimeout(() => {
          showToast("Mensagem enviada com sucesso! ✅");
          form.reset();
          $$( "input, textarea", form ).forEach(el => el.classList.remove("is-filled"));
          if (textArea) autoResizeTA(textArea);
          submitBtn.disabled = false;
          submitBtn.style.opacity = "";
          submitBtn.textContent = originalText || "Enviar";
        }, 900);
      });

      submitBtn.addEventListener("click", e => mountRipple(e, submitBtn));
    }

    mountReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.MapsContact = { showToast };
})();
