(() => {
  if (window.__ml_contact_init__) return;
  window.__ml_contact_init__ = true;

  const SELECTORS = {
    form: ".contact-form",
    inputs: "input, textarea",
    textarea: "textarea",
    submit: 'button[type="submit"], .botao',
    card: ".contact-card",
  };

  function ensureStyles() {
    if (document.getElementById("ml-contact-styles")) return;
    const style = document.createElement("style");
    style.id = "ml-contact-styles";
    style.textContent = `
.ml-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,0);background:rgba(16,37,105,.95);color:#fff;padding:12px 16px;border-radius:12px;box-shadow:0 8px 18px rgba(0,0,0,.18);font-weight:700;z-index:9999;opacity:0;transition:opacity .25s ease,transform .25s ease;}
.ml-toast.is-visible{opacity:1;transform:translate(-50%,-6px);}
.ml-ripple-host{position:relative;overflow:hidden;}
.ml-ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.35);pointer-events:none;transform:scale(0);transition:transform .4s ease,opacity .6s ease;}
.contact-reveal{opacity:0;transform:translateY(16px);transition:opacity .4s ease,transform .4s ease;}
.contact-reveal.is-visible{opacity:1;transform:translateY(0);}
.shake{animation:ml-shake .4s ease;}
@keyframes ml-shake{10%,90%{transform:translateX(-1px);}20%,80%{transform:translateX(2px);}30%,50%,70%{transform:translateX(-4px);}40%,60%{transform:translateX(4px);}}
`;
    document.head.appendChild(style);
  }

  function showToast(message) {
    ensureStyles();
    const toast = document.createElement("div");
    toast.className = "ml-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 250);
    }, 2200);
  }

  function ripple(event, host) {
    ensureStyles();
    const element = host;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ml-ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    element.classList.add("ml-ripple-host");
    element.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = "scale(1)";
    });
    setTimeout(() => {
      ripple.style.opacity = "0";
    }, 320);
    setTimeout(() => ripple.remove(), 800);
  }

  function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function markFilled(input) {
    input.classList.toggle("is-filled", !!input.value.trim());
  }

  function validateForm(form) {
    const data = new FormData(form);
    const firstName = String(data.get("nome") || "").trim();
    const lastName = String(data.get("sobrenome") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("mensagem") || "").trim();
    const errors = [];
    if (!firstName) errors.push("Nome");
    if (!lastName) errors.push("Sobrenome");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("E-mail");
    if (message.length < 5) errors.push("Mensagem");
    return { errors, data: { firstName, lastName, email, message } };
  }

  function mountReveal() {
    ensureStyles();
    const card = document.querySelector(SELECTORS.card);
    if (!card) return;
    card.classList.add("contact-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          card.classList.add("is-visible");
          observer.disconnect();
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(card);
  }

  function init() {
    ensureStyles();
    const form = document.querySelector(SELECTORS.form);
    if (!form) return;

    const inputs = form.querySelectorAll(SELECTORS.inputs);
    inputs.forEach((input) => {
      markFilled(input);
      input.addEventListener("input", () => markFilled(input));
      input.addEventListener("blur", () => markFilled(input));
    });

    const textarea = form.querySelector(SELECTORS.textarea);
    if (textarea) {
      autoResize(textarea);
      textarea.addEventListener("input", () => autoResize(textarea));
    }

    const submit = form.querySelector(SELECTORS.submit);
    if (submit) {
      submit.addEventListener("click", (event) => ripple(event, submit));
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const { errors } = validateForm(form);
      if (errors.length) {
        if (submit) {
          submit.classList.add("shake");
          setTimeout(() => submit.classList.remove("shake"), 400);
        }
        showToast(`Corrija: ${errors.join(", ")} ✏️`);
        return;
      }
      if (submit) {
        submit.disabled = true;
        submit.style.opacity = "0.8";
        submit.dataset.original =
          submit.dataset.original ||
          submit.textContent ||
          submit.innerText ||
          "";
        submit.textContent = "Enviando...";
      }
      setTimeout(() => {
        showToast("Mensagem enviada com sucesso! 📬");
        form.reset();
        inputs.forEach((input) => {
          input.classList.remove("is-filled");
          markFilled(input);
        });
        if (textarea) autoResize(textarea);
        if (submit) {
          submit.disabled = false;
          submit.style.opacity = "";
          submit.textContent = submit.dataset.original || "Enviar";
        }
      }, 900);
    });

    mountReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.MapsContact = { showToast };
})();

document.querySelectorAll(".faq-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    document
      .querySelectorAll(".faq-toggle")
      .forEach((b) => b.setAttribute("aria-expanded", "false"));
    document
      .querySelectorAll(".faq-answer")
      .forEach((a) => a.classList.remove("active"));

    if (!isOpen) {
      btn.setAttribute("aria-expanded", "true");
      btn.nextElementSibling.classList.add("active");
    }
  });
});
