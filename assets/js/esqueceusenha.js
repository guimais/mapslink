(() => {
  if (window.__ml_forgot_init__) return;
  window.__ml_forgot_init__ = true;

  function ensureStyles() {
    if (document.getElementById("ml-forgot-styles")) return;
    const style = document.createElement("style");
    style.id = "ml-forgot-styles";
    style.textContent = ".spin{display:inline-block;animation:spin .8s linear infinite;}@keyframes spin{to{transform:rotate(360deg);}}";
    document.head.appendChild(style);
  }

  function showStatus(area, message, success) {
    area.textContent = message;
    area.style.background = success ? "var(--brand)" : "#ef4444";
    area.classList.add("show");
    if ("vibrate" in navigator) navigator.vibrate(success ? 20 : 60);
    clearTimeout(showStatus.timer);
    showStatus.timer = setTimeout(() => area.classList.remove("show"), 3000);
  }

  function validate(email) {
    const value = email.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }

  function setButtonState(button, state) {
    if (!button) return;
    if (state === "loading") {
      button.disabled = true;
      button.innerHTML = '<i class="ri-loader-4-line spin" aria-hidden="true"></i> Enviando...';
    } else {
      button.disabled = false;
      button.innerHTML = '<i class="ri-mail-send-line" aria-hidden="true"></i> Enviar link de recuperação';
    }
  }

  function init() {
    ensureStyles();
    const form = document.getElementById("forgotForm");
    const email = document.getElementById("email");
    const status = document.getElementById("statusArea");
    if (!form || !email || !status) return;

    const button = form.querySelector(".btn");

    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!validate(email.value)) {
        showStatus(status, "Digite um e-mail válido", false);
        email.focus();
        return;
      }
      form.classList.add("sending");
      email.disabled = true;
      setButtonState(button, "loading");
      setTimeout(() => {
        form.classList.remove("sending");
        email.disabled = false;
        showStatus(status, "Link de recuperação enviado com sucesso!", true);
        setButtonState(button, "idle");
        form.reset();
      }, 1600);
    });

    email.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
