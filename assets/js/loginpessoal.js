(() => {
  if (window.__ml_login_personal__) return;
  window.__ml_login_personal__ = true;

  const MOBILE_MAX_WIDTH = 768;

  function isMobile() {
    return window.innerWidth <= MOBILE_MAX_WIDTH;
  }

  function ensureStyles() {
    if (document.getElementById("ml-loginpessoal-styles")) return;
    const style = document.createElement("style");
    style.id = "ml-loginpessoal-styles";
    style.textContent = `
.loading-spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.3);border-top:2px solid #fff;border-radius:50%;animation:ml-spin 1s linear infinite;}
@keyframes ml-spin{to{transform:rotate(360deg)}}
.ml-mobile-toast{position:fixed;bottom:20px;left:20px;right:20px;background:var(--brand);color:#fff;padding:16px;border-radius:12px;font-size:14px;font-weight:500;text-align:center;z-index:10000;box-shadow:0 8px 32px rgba(0,0,0,.2);transform:translateY(100px);opacity:0;transition:transform .3s ease,opacity .3s ease;}
.ml-mobile-toast.show{transform:translateY(0);opacity:1;}
.is-pressed{transform:scale(.95);transition:transform .1s ease;}
`;
    document.head.appendChild(style);
  }

  function showMobileToast(message) {
    ensureStyles();
    if (!isMobile()) {
      alert(message);
      return;
    }
    const toast = document.createElement("div");
    toast.className = "ml-mobile-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function setError(input, error, message) {
    if (!input || !error) return;
    input.classList.toggle("error", !!message);
    error.textContent = message || "";
    error.classList.toggle("show", !!message);
  }

  function bindTouchFeedback(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.addEventListener("touchstart", () => el.classList.add("is-pressed"), { passive: true });
      const reset = () => el.classList.remove("is-pressed");
      el.addEventListener("touchend", reset);
      el.addEventListener("touchcancel", reset);
    });
  }

  function bindHaptics(selector) {
    if (!("vibrate" in navigator)) return;
    document.querySelectorAll(selector).forEach(button => {
      button.addEventListener("click", () => navigator.vibrate(50));
    });
  }

  function adjustCardPadding() {
    if (!isMobile()) return;
    const card = document.querySelector(".login-card");
    if (!card) return;
    const landscape = window.innerHeight < window.innerWidth;
    card.style.padding = landscape ? "20px 24px" : "28px 20px";
  }

  function setupMobileViewport(inputs) {
    if (!isMobile()) return;
    const viewport = document.querySelector('meta[name="viewport"]');
    inputs.forEach(input => {
      input.addEventListener("focus", () => {
        if (viewport) viewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
        setTimeout(() => {
          input.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }, 300);
      });
      input.addEventListener("blur", () => {
        setTimeout(() => {
          if (viewport) viewport.content = "width=device-width, initial-scale=1";
        }, 300);
      });
    });
    document.body.style.overflowX = "hidden";
    adjustCardPadding();
    window.addEventListener("orientationchange", () => setTimeout(adjustCardPadding, 100));
    window.addEventListener("resize", adjustCardPadding);
  }

  function navigateWithFeedback(url, message) {
    if (isMobile()) {
      showMobileToast(message);
      setTimeout(() => {
        window.location.href = url;
      }, 800);
    } else {
      window.location.href = url;
    }
  }

  function rememberCredentials(email, remember) {
    try {
      if (remember) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("rememberMe");
      }
    } catch {}
  }

  function restoreRemembered(emailInput, rememberInput) {
    try {
      const email = localStorage.getItem("userEmail");
      const rememberFlag = localStorage.getItem("rememberMe") === "true";
      if (email && rememberFlag) {
        emailInput.value = email;
        if (rememberInput) rememberInput.checked = true;
      }
    } catch {}
  }

  function init() {
    ensureStyles();

    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const toggle = document.getElementById("passwordToggle");
    const button = document.getElementById("loginButton");
    const rememberInput = document.getElementById("rememberMe");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    if (!form || !emailInput || !passwordInput || !toggle || !button) return;

    const buttonTemplates = {
      idle: {
        html: button.innerHTML,
        gradient: "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)",
        disabled: false
      },
      loading: {
        html: '<div class="loading-spinner"></div><span class="button-text">Entrando...</span>',
        gradient: null,
        disabled: true
      },
      success: {
        html: '<i class="ri-check-line button-icon"></i><span class="button-text">Login realizado com sucesso!</span>',
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        disabled: true
      },
      error: {
        html: '<i class="ri-error-warning-line button-icon"></i><span class="button-text">Erro</span>',
        gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        disabled: true
      }
    };

    function setButtonState(state) {
      const config = buttonTemplates[state] || buttonTemplates.idle;
      button.innerHTML = config.html;
      button.disabled = config.disabled;
      if (config.gradient) button.style.background = config.gradient;
      if (state === "idle") button.blur();
    }

    function resetButtonWithDelay(delay) {
      setTimeout(() => setButtonState("idle"), delay);
    }

    function validateEmail() {
      const value = emailInput.value.trim();
      if (!value) {
        setError(emailInput, emailError, "E-mail é obrigatório");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError(emailInput, emailError, "Informe um e-mail válido");
        return false;
      }
      setError(emailInput, emailError, "");
      return true;
    }

    function validatePassword() {
      const value = passwordInput.value;
      if (!value) {
        setError(passwordInput, passwordError, "Senha é obrigatória");
        return false;
      }
      if (value.length < 8) {
        setError(passwordInput, passwordError, "A senha deve ter pelo menos 8 caracteres");
        return false;
      }
      setError(passwordInput, passwordError, "");
      return true;
    }

    function clearErrors() {
      setError(emailInput, emailError, "");
      setError(passwordInput, passwordError, "");
    }

    toggle.addEventListener("click", () => {
      const visible = passwordInput.type === "text";
      passwordInput.type = visible ? "password" : "text";
      const icon = toggle.querySelector("i");
      if (icon) icon.className = visible ? "ri-eye-line" : "ri-eye-off-line";
      toggle.setAttribute("aria-label", visible ? "Mostrar senha" : "Ocultar senha");
    });

    emailInput.addEventListener("input", validateEmail);
    passwordInput.addEventListener("input", validatePassword);

    form.addEventListener("submit", async event => {
      event.preventDefault();
      clearErrors();
      if (!validateEmail() || !validatePassword()) return;
      setButtonState("loading");
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const remember = !!rememberInput?.checked;
      
      try {
        await MapsAuth.login({ identifier: email, password, type: "personal" });
        

        const fakeJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
        localStorage.setItem("jwt_token", fakeJwt);
        
        rememberCredentials(email, remember);
        setButtonState("success");
        setTimeout(() => {
          window.location.href = form.getAttribute("data-redirect")?.trim() || "perfilusuario.html";
        }, 1200);
      } catch (error) {
        const message = error?.message === "INVALID"
          ? "E-mail ou senha incorretos"
          : (error?.message || "Erro ao fazer login. Tente novamente.");
        setButtonState("error");
        alert(message);
        resetButtonWithDelay(3000);
      }
    });

    restoreRemembered(emailInput, rememberInput);
    if (!isMobile()) emailInput.focus();

    const inputs = Array.from(form.querySelectorAll("input"));
    setupMobileViewport(inputs);
    bindTouchFeedback(".login-button, .password-toggle, .checkbox-container, .forgot-password, .business-login-link, .register-link");
    bindHaptics(".login-button, .password-toggle");

    const registerLink = document.querySelector(".register-link");
    if (registerLink) {
      registerLink.addEventListener("click", event => {
        event.preventDefault();
        navigateWithFeedback("registropessoal.html", "Redirecionando para página de cadastro...");
      });
    }

    const forgotPasswordLink = document.querySelector(".forgot-password");
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", event => {
        event.preventDefault();
        navigateWithFeedback("esqueceusenha.html", "Redirecionando para recuperação de senha...");
      });
    }

    const businessLink = document.querySelector(".business-login-link");
    if (businessLink) {
      businessLink.addEventListener("click", event => {
        event.preventDefault();
        navigateWithFeedback("loginempresa.html", "Redirecionando para login empresarial...");
      });
    }

    setButtonState("idle");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }


  window.logoutPessoal = function() {
    localStorage.removeItem("jwt_token");
    window.location.href = "loginpessoal.html";
  };
})();
