(function () {
  "use strict";

  function ensureStyles() {
    if (document.getElementById("ml-loginpessoal-styles")) return;
    const s = document.createElement("style");
    s.id = "ml-loginpessoal-styles";
    s.textContent = `
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: ml-spin 1s linear infinite;
}
@keyframes ml-spin { to { transform: rotate(360deg) } }

.ml-mobile-toast {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: var(--brand);
  color: #fff;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  z-index: 10000;
  box-shadow: 0 8px 32px rgba(0,0,0,.2);
  transform: translateY(100px);
  opacity: 0;
  transition: transform .3s ease, opacity .3s ease;
}
.ml-mobile-toast.show { transform: translateY(0); opacity: 1 }
.is-pressed { transform: scale(.95); transition: transform .1s ease }
`;
    document.head.appendChild(s);
  }

  function getRedirectTarget(form) {
    const attr = form?.getAttribute("data-redirect");
    return attr && attr.trim() ? attr.trim() : "perfilusuario.html";
  }

  function showMobileAlert(message) {
    if (window.innerWidth > 768) return;
    ensureStyles();
    const t = document.createElement("div");
    t.className = "ml-mobile-toast";
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }

  function init() {
    ensureStyles();

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const passwordToggle = document.getElementById("passwordToggle");
    const loginButton = document.getElementById("loginButton");
    const rememberMeCheckbox = document.getElementById("rememberMe");

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    if (!loginForm || !emailInput || !passwordInput || !passwordToggle || !loginButton) return;

    passwordToggle.addEventListener("click", function () {
      const isPasswordVisible = passwordInput.type === "text";
      passwordInput.type = isPasswordVisible ? "password" : "text";
      const icon = this.querySelector("i");
      if (icon) icon.className = isPasswordVisible ? "ri-eye-line" : "ri-eye-off-line";
      this.setAttribute("aria-label", isPasswordVisible ? "Mostrar senha" : "Ocultar senha");
    });

    emailInput.addEventListener("input", validateEmail);
    passwordInput.addEventListener("input", validatePassword);

    function validateEmail() {
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email === "") {
        showFieldError(emailInput, emailError, "E-mail é obrigatório");
        return false;
      } else if (!emailRegex.test(email)) {
        showFieldError(emailInput, emailError, "Por favor, insira um e-mail válido");
        return false;
      } else {
        hideFieldError(emailInput, emailError);
        return true;
      }
    }

    function validatePassword() {
      const password = passwordInput.value;
      if (password === "") {
        showFieldError(passwordInput, passwordError, "Senha é obrigatória");
        return false;
      } else if (password.length < 8) {
        showFieldError(passwordInput, passwordError, "A senha deve ter pelo menos 8 caracteres");
        return false;
      } else {
        hideFieldError(passwordInput, passwordError);
        return true;
      }
    }

    function showFieldError(input, errorElement, message) {
      input.classList.add("error");
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add("show");
      }
    }

    function hideFieldError(input, errorElement) {
      input.classList.remove("error");
      if (errorElement) {
        errorElement.classList.remove("show");
        errorElement.textContent = "";
      }
    }

    function clearAllErrors() {
      hideFieldError(emailInput, emailError);
      hideFieldError(passwordInput, passwordError);
    }

    async function performLogin(email, password, rememberMe) {
      try {
        await MapsAuth.login({ identifier: email, password, type: "personal" });
        if (rememberMe) {
          localStorage.setItem("userEmail", email);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("userEmail");
          localStorage.removeItem("rememberMe");
        }
        showSuccessMessage("Login realizado com sucesso!");
        setTimeout(() => {
          window.location.href = getRedirectTarget(loginForm);
        }, 1200);
      } catch (error) {
        const message = error?.message === "INVALID" ? "E-mail ou senha incorretos" : (error?.message || "Erro ao fazer login. Tente novamente.");
        showErrorMessage(message);
      }
    }

    function showSuccessMessage(message) {
      loginButton.innerHTML = `
        <i class="ri-check-line button-icon"></i>
        <span class="button-text">${message}</span>
      `;
      loginButton.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      loginButton.disabled = true;
    }

    function showErrorMessage(message) {
      loginButton.innerHTML = `
        <i class="ri-error-warning-line button-icon"></i>
        <span class="button-text">Erro</span>
      `;
      loginButton.style.background = "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
      loginButton.disabled = true;
      setTimeout(() => {
        restoreButton();
      }, 3000);
      alert(message);
    }

    function showLoadingButton() {
      loginButton.innerHTML = `
        <div class="loading-spinner"></div>
        <span class="button-text">Entrando...</span>
      `;
      loginButton.disabled = true;
    }

    function restoreButton() {
      loginButton.innerHTML = `
        <span class="button-text">Entrar</span>
        <i class="ri-arrow-right-line button-icon"></i>
      `;
      loginButton.style.background = "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)";
      loginButton.disabled = false;
    }

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearAllErrors();
      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();
      if (!isEmailValid || !isPasswordValid) return;
      showLoadingButton();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const rememberMe = !!rememberMeCheckbox?.checked;
      await performLogin(email, password, rememberMe);
    });

    function restoreSavedData() {
      const savedEmail = localStorage.getItem("userEmail");
      const rememberMe = localStorage.getItem("rememberMe");
      if (savedEmail && rememberMe === "true") {
        emailInput.value = savedEmail;
        if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
      }
    }
    restoreSavedData();

    if (window.innerWidth > 768) emailInput.focus();

    if (window.innerWidth <= 768) {
      const inputs = document.querySelectorAll("input");
      inputs.forEach(input => {
        input.addEventListener("focus", function () {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) viewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
        });
        input.addEventListener("blur", function () {
          setTimeout(() => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) viewport.content = "width=device-width, initial-scale=1";
          }, 300);
        });
      });
    }

    const registerLink = document.querySelector(".register-link");
    if (registerLink) {
      registerLink.addEventListener("click", function (e) {
        e.preventDefault();
        navigateWithFeedback("registropessoal.html", "Redirecionando para pagina de cadastro...");
      });
    }

    const forgotPasswordLink = document.querySelector(".forgot-password");
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", function (e) {
        e.preventDefault();
        navigateWithFeedback("esqueceusenha.html", "Redirecionando para recuperacao de senha...");
      });
    }

    const businessLoginLink = document.querySelector(".business-login-link");
    if (businessLoginLink) {
      businessLoginLink.addEventListener("click", function (e) {
        e.preventDefault();
        navigateWithFeedback("loginempresa.html", "Redirecionando para login empresarial...");
      });
    }

    function navigateWithFeedback(url, message) {
      if (window.innerWidth <= 768) {
        showMobileAlert(message);
        setTimeout(() => (window.location.href = url), 800);
      } else {
        window.location.href = url;
      }
    }

    if ("ontouchstart" in window) {
      const touchElements = document.querySelectorAll(".login-button, .password-toggle, .checkbox-container, .forgot-password, .business-login-link, .register-link");
      touchElements.forEach(el => {
        el.addEventListener("touchstart", function () { this.classList.add("is-pressed"); }, { passive: true });
        el.addEventListener("touchend", function () { this.classList.remove("is-pressed"); });
        el.addEventListener("touchcancel", function () { this.classList.remove("is-pressed"); });
      });
    }

    function handleOrientationChange() {
      if (window.innerWidth > 768) return;
      const loginCard = document.querySelector(".login-card");
      if (!loginCard) return;
      if (window.innerHeight < window.innerWidth) {
        loginCard.style.padding = "20px 24px";
      } else {
        loginCard.style.padding = "28px 20px";
      }
    }
    window.addEventListener("orientationchange", () => setTimeout(handleOrientationChange, 100));
    window.addEventListener("resize", handleOrientationChange);

    if (window.innerWidth <= 768) {
      document.body.style.overflowX = "hidden";
      const inputs = document.querySelectorAll("input");
      inputs.forEach(input => {
        input.addEventListener("focus", function () {
          setTimeout(() => {
            this.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
          }, 300);
        });
      });
    }

    function addHapticFeedback() {
      const buttons = document.querySelectorAll(".login-button, .password-toggle");
      buttons.forEach(button => {
        button.addEventListener("click", function () {
          if ("vibrate" in navigator) navigator.vibrate(50);
        });
      });
    }
    if (window.innerWidth <= 768) addHapticFeedback();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
