(function () {
  "use strict";

  function ensureStyles() {
    if (document.getElementById("ml-forgot-styles")) return;
    const s = document.createElement("style");
    s.id = "ml-forgot-styles";
    s.textContent = `
.spin{display:inline-block;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
`;
    document.head.appendChild(s);
  }

  function init() {
    ensureStyles();

    const form = document.querySelector("#forgotForm");
    const emailInput = document.querySelector("#email");
    const statusArea = document.querySelector("#statusArea");
    if (!form || !emailInput || !statusArea) return;

    const showStatus = (msg, success = true) => {
      statusArea.textContent = msg;
      statusArea.style.background = success ? "var(--brand)" : "#ef4444";
      statusArea.classList.add("show");
      if (navigator.vibrate) navigator.vibrate(success ? 20 : 60);
      clearTimeout(showStatus.timer);
      showStatus.timer = setTimeout(() => {
        statusArea.classList.remove("show");
      }, 3000);
    };

    form.addEventListener("submit", e => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        showStatus("Digite um e-mail válido", false);
        emailInput.focus();
        return;
      }

      form.classList.add("sending");
      emailInput.disabled = true;
      const btn = form.querySelector(".btn");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="ri-loader-4-line spin"></i> Enviando...';
      }

      setTimeout(() => {
        form.classList.remove("sending");
        emailInput.disabled = false;
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="ri-mail-send-line"></i> Enviar link de recuperação';
        }
        showStatus("Link de recuperação enviado com sucesso!");
        form.reset();
      }, 1600);
    });

    emailInput.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
