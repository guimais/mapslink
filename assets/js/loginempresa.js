(() => {
  if (window.__ml_login_business__) return;
  window.__ml_login_business__ = true;

  const MOBILE_MAX_WIDTH = 768;
  const STORAGE_IDENTIFIER = "businessLoginIdentifier";
  const STORAGE_REMEMBER = "rememberBusiness";

  const linkShortcuts = [
    { selector: ".register-link", url: "registroempresa.html", message: "Redirecionando para cadastro empresarial..." },
    { selector: ".forgot-password", url: "esqueceusenha.html", message: "Redirecionando para recuperação de senha..." },
    { selector: ".personal-login-link", url: "loginpessoal.html", message: "Redirecionando para login pessoal..." }
  ];

  const state = {
    identifierType: "unknown",
    elements: null
  };

  function isMobile() {
    return window.innerWidth <= MOBILE_MAX_WIDTH;
  }

  function ensureStyles() {
    if (document.getElementById("ml-loginempresa-styles")) return;
    const style = document.createElement("style");
    style.id = "ml-loginempresa-styles";
    style.textContent = `
.loading-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.25);border-top:2px solid #fff;border-radius:50%;animation:ml-spin 1s linear infinite;margin-right:10px;}
@keyframes ml-spin{to{transform:rotate(360deg)}}
.ml-toast{position:fixed;left:16px;right:16px;bottom:18px;padding:16px 18px;border-radius:14px;font-size:14px;font-weight:600;text-align:center;color:#fff;transform:translateY(120%);opacity:0;transition:transform .35s cubic-bezier(.21,.68,.33,1.13),opacity .3s ease;z-index:10050;box-shadow:0 18px 48px rgba(15,23,42,.28);}
.ml-toast.show{transform:translateY(0);opacity:1;}
.ml-toast--info{background:linear-gradient(135deg,var(--brand,#2563eb),var(--brand-2,#1d4ed8));}
.ml-toast--success{background:linear-gradient(135deg,#10b981,#059669);}
.ml-toast--error{background:linear-gradient(135deg,#dc2626,#b91c1c);}
.has-error{border-color:#dc2626!important;box-shadow:0 0 0 2px rgba(220,38,38,.15);}
.field-error{display:block;min-height:16px;font-size:13px;color:#dc2626;opacity:0;transform:translateY(-4px);transition:opacity .18s ease,transform .18s ease;}
.field-error.show{opacity:1;transform:translateY(0);}
.caps-lock-warning{margin-top:6px;font-size:13px;font-weight:500;color:#f59e0b;display:none;}
.is-shaking{animation:ml-shake .4s cubic-bezier(.36,.07,.19,.97);}
@keyframes ml-shake{10%,90%{transform:translateX(-1px);}20%,80%{transform:translateX(2px);}30%,50%,70%{transform:translateX(-4px);}40%,60%{transform:translateX(4px);}}
.is-pressed{transform:scale(.96);transition:transform .12s ease;}
`;
    document.head.appendChild(style);
  }

  function showToast(message, variant = "info", duration = 2600) {
    if (!message) return;
    document.querySelectorAll(".ml-toast").forEach(toast => toast.remove());
    const toast = document.createElement("div");
    toast.className = `ml-toast ml-toast--${variant}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }

  function setButtonState(state) {
    if (!state.elements || !state.elements.button) return;
    const { button } = state.elements;
    const templates = {
      idle: () => ({
        html: state.elements.originalButtonHtml || '<span class="button-text">Entrar</span><i class="ri-arrow-right-line button-icon"></i>',
        disabled: false,
        gradient: "linear-gradient(135deg, var(--brand, #2563eb) 0%, var(--brand-2, #1d4ed8) 100%)"
      }),
      loading: () => ({
        html: '<span class="loading-spinner" aria-hidden="true"></span><span class="button-text">Validando...</span>',
        disabled: true,
        gradient: null
      }),
      success: () => ({
        html: '<i class="ri-check-line button-icon" aria-hidden="true"></i><span class="button-text">Tudo certo!</span>',
        disabled: true,
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
      }),
      error: () => ({
        html: '<i class="ri-error-warning-line button-icon" aria-hidden="true"></i><span class="button-text">Revise os dados</span>',
        disabled: true,
        gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
      })
    };
    const config = (templates[state] || templates.idle)();
    button.innerHTML = config.html;
    button.disabled = config.disabled;
    if (config.gradient) button.style.background = config.gradient;
    if (!config.disabled) button.blur();
  }

  function resetButtonWithDelay(delay = 2800) {
    setTimeout(() => setButtonState("idle"), delay);
  }

  function sanitizeIdentifier(value) {
    return (value || "").trim();
  }

  function stripDigits(value) {
    return (value || "").replace(/\D/g, "");
  }

  function formatCnpj(value) {
    let digits = stripDigits(value).slice(0, 14);
    digits = digits.replace(/^(\d{2})(\d)/, "$1.$2");
    digits = digits.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    digits = digits.replace(/\.(\d{3})(\d)/, ".$1/$2");
    digits = digits.replace(/(\d{4})(\d)/, "$1-$2");
    return digits;
  }

  function detectIdentifierType(value) {
    if (!value) return "unknown";
    if (value.includes("@")) return "email";
    if (stripDigits(value).length >= 4) return "cnpj";
    return "unknown";
  }

  function isValidCnpj(digits) {
    if (!digits || digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;
    const calcDigit = length => {
      let sum = 0;
      let pos = length - 7;
      for (let index = length; index >= 1; index -= 1) {
        sum += Number(digits[length - index]) * pos--;
        if (pos < 2) pos = 9;
      }
      return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };
    const digit1 = calcDigit(12);
    const digit2 = calcDigit(13);
    return digit1 === Number(digits[12]) && digit2 === Number(digits[13]);
  }

  function setIdentifierIcon(type) {
    const { identifierIcon } = state.elements;
    if (!identifierIcon) return;
    identifierIcon.classList.add("input-icon");
    identifierIcon.classList.remove("ri-mail-line", "ri-building-4-line");
    identifierIcon.classList.add(type === "email" ? "ri-mail-line" : "ri-building-4-line");
  }

  function setFieldError(input, errorNode, message) {
    if (!input) return false;
    input.classList.toggle("has-error", !!message);
    if (message) {
      input.setAttribute("aria-invalid", "true");
      if (errorNode) {
        errorNode.classList.add("field-error", "show");
        errorNode.textContent = message;
        input.setAttribute("aria-describedby", errorNode.id);
      }
    } else {
      input.removeAttribute("aria-invalid");
      if (errorNode) {
        errorNode.classList.remove("show");
        errorNode.textContent = "";
        input.removeAttribute("aria-describedby");
      }
    }
    return !message;
  }

  function validateIdentifier() {
    const { identifier, identifierError } = state.elements;
    if (!identifier) return true;
    const value = sanitizeIdentifier(identifier.value);
    state.identifierType = detectIdentifierType(value);
    if (!value) return setFieldError(identifier, identifierError, "Informe seu e-mail ou CNPJ.");
    if (state.identifierType === "email") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(value.toLowerCase())) return setFieldError(identifier, identifierError, "Digite um e-mail válido.");
    } else if (state.identifierType === "cnpj") {
      const digits = stripDigits(value);
      if (digits.length !== 14) return setFieldError(identifier, identifierError, "O CNPJ deve ter 14 dígitos.");
      if (!isValidCnpj(digits)) return setFieldError(identifier, identifierError, "CNPJ inválido.");
    } else {
      return setFieldError(identifier, identifierError, "Use um e-mail válido ou CNPJ completo.");
    }
    setIdentifierIcon(state.identifierType);
    return setFieldError(identifier, identifierError, "");
  }

  function validatePassword() {
    const { password, passwordError } = state.elements;
    if (!password) return true;
    const value = password.value;
    if (!value) return setFieldError(password, passwordError, "Informe sua senha.");
    if (value.length < 8) return setFieldError(password, passwordError, "A senha precisa ter pelo menos 8 caracteres.");
    return setFieldError(password, passwordError, "");
  }

  function clearErrors() {
    const { identifier, identifierError, password, passwordError } = state.elements;
    setFieldError(identifier, identifierError, "");
    setFieldError(password, passwordError, "");
  }

  function ensureCapsLockWarning() {
    const { password } = state.elements;
    if (!password) return;
    let warning = document.getElementById("capsLockWarning");
    if (!warning) {
      warning = document.createElement("div");
      warning.id = "capsLockWarning";
      warning.className = "caps-lock-warning";
      warning.textContent = "Caps Lock ativado";
      const container = password.closest(".input-wrapper") || password.parentElement || password;
      container.appendChild(warning);
    }
    state.elements.capsWarning = warning;
    warning.style.display = "none";
    warning.setAttribute("aria-hidden", "true");
  }

  function updateCapsWarning(show) {
    const { capsWarning } = state.elements;
    if (!capsWarning) return;
    capsWarning.style.display = show ? "block" : "none";
    capsWarning.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function animateFormError() {
    const { form } = state.elements;
    if (!form) return;
    form.classList.remove("is-shaking");
    void form.offsetWidth;
    form.classList.add("is-shaking");
    form.addEventListener("animationend", () => form.classList.remove("is-shaking"), { once: true });
  }

  function rememberCredentials(identifierValue, remember) {
    try {
      if (remember) {
        localStorage.setItem(STORAGE_IDENTIFIER, identifierValue);
        localStorage.setItem(STORAGE_REMEMBER, "true");
      } else {
        localStorage.removeItem(STORAGE_IDENTIFIER);
        localStorage.removeItem(STORAGE_REMEMBER);
      }
    } catch {}
  }

  function restoreRememberedSession() {
    const { identifier, remember } = state.elements;
    if (!identifier || !remember) return;
    try {
      const rememberFlag = localStorage.getItem(STORAGE_REMEMBER) === "true";
      if (!rememberFlag) return;
      const saved = localStorage.getItem(STORAGE_IDENTIFIER);
      if (!saved) return;
      identifier.value = saved;
      remember.checked = true;
      state.identifierType = detectIdentifierType(saved);
      if (state.identifierType === "cnpj") identifier.value = formatCnpj(saved);
      setIdentifierIcon(state.identifierType);
      validateIdentifier();
    } catch {}
  }

  function navigateWithFeedback(url, message) {
    if (isMobile()) {
      showToast(message, "info");
      setTimeout(() => { window.location.href = url; }, 800);
    } else {
      window.location.href = url;
    }
  }

  function setupLinkShortcuts() {
    linkShortcuts.forEach(link => {
      const node = document.querySelector(link.selector);
      if (!node || node.dataset.bound) return;
      node.dataset.bound = "true";
      node.addEventListener("click", event => {
        event.preventDefault();
        navigateWithFeedback(link.url, link.message);
      });
    });
  }

  function bindTouchFeedback() {
    if (!("ontouchstart" in window)) return;
    const touchables = document.querySelectorAll(".login-button, .password-toggle, .checkbox-container, .forgot-password, .personal-login-link, .nav-link, .nav-toggle");
    touchables.forEach(node => {
      if (node.dataset.touchBound) return;
      node.dataset.touchBound = "true";
      node.addEventListener("touchstart", () => {
        node.classList.add("is-pressed");
        if (navigator.vibrate && node.matches(".login-button, .nav-toggle")) navigator.vibrate(40);
      }, { passive: true });
      const reset = () => node.classList.remove("is-pressed");
      node.addEventListener("touchend", () => setTimeout(reset, 120));
      node.addEventListener("touchcancel", reset);
    });
    const inputs = document.querySelectorAll("input");
    const viewport = document.querySelector('meta[name="viewport"]');
    inputs.forEach(input => {
      if (input.dataset.viewportBound || !viewport) return;
      input.dataset.viewportBound = "true";
      input.addEventListener("focus", () => viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"));
      input.addEventListener("blur", () => setTimeout(() => viewport.setAttribute("content", "width=device-width, initial-scale=1"), 250));
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    clearErrors();
    const identifierValid = validateIdentifier();
    const passwordValid = validatePassword();
    if (!identifierValid || !passwordValid) {
      animateFormError();
      showToast("Revise os campos destacados.", "error");
      setButtonState("error");
      resetButtonWithDelay(2400);
      return;
    }
    const identifierValue = sanitizeIdentifier(state.elements.identifier.value);
    const passwordValue = state.elements.password.value;
    const rememberChoice = !!state.elements.remember?.checked;

    setButtonState("loading");

    MapsAuth.login({ identifier: identifierValue, password: passwordValue, type: "business" })
      .then(() => {
        rememberCredentials(identifierValue, rememberChoice);
        setButtonState("success");
        showToast("Login realizado com sucesso!", "success", 2200);
        setTimeout(() => {
          const redirect = state.elements.form?.getAttribute("data-redirect");
          window.location.href = redirect && redirect.trim() ? redirect.trim() : "perfilempresa.html";
        }, 1200);
      })
      .catch(error => {
        const message = error?.message === "INVALID"
          ? "E-mail/CNPJ ou senha incorretos."
          : (error?.message || "Não foi possível entrar. Tente novamente.");
        setButtonState("error");
        showToast(message, "error", 3200);
        resetButtonWithDelay(3200);
      });
  }

  function init() {
    ensureStyles();

    const elements = {
      form: document.getElementById("loginForm"),
      identifier: document.getElementById("emailOrCnpj"),
      password: document.getElementById("password"),
      toggle: document.getElementById("passwordToggle"),
      button: document.getElementById("loginButton"),
      remember: document.getElementById("rememberMe"),
      identifierError: document.getElementById("emailOrCnpjError"),
      passwordError: document.getElementById("passwordError"),
      identifierIcon: document.querySelector("[data-identifier-icon]") || document.querySelector("#emailOrCnpj + .input-icon") || document.querySelector(".input-icon"),
      originalButtonHtml: null,
      capsWarning: null
    };

    if (!elements.form || !elements.identifier || !elements.password || !elements.toggle || !elements.button) return;

    elements.originalButtonHtml = elements.button.innerHTML;
    state.elements = elements;
    state.identifierType = detectIdentifierType(elements.identifier.value);

    ensureCapsLockWarning();
    setIdentifierIcon(state.identifierType);

    elements.toggle.addEventListener("click", () => {
      const willShow = elements.password.type === "password";
      elements.password.type = willShow ? "text" : "password";
      const icon = elements.toggle.querySelector("i");
      if (icon) icon.className = willShow ? "ri-eye-off-line" : "ri-eye-line";
      elements.toggle.setAttribute("aria-label", willShow ? "Ocultar senha" : "Mostrar senha");
      elements.toggle.setAttribute("aria-pressed", String(willShow));
    });

    elements.identifier.addEventListener("input", () => {
      if (state.identifierType === "cnpj") {
        const cursor = elements.identifier.selectionStart;
        elements.identifier.value = formatCnpj(elements.identifier.value);
        try { elements.identifier.setSelectionRange(cursor, cursor); } catch {}
      }
      const nextType = detectIdentifierType(elements.identifier.value);
      if (nextType !== state.identifierType) {
        state.identifierType = nextType;
        if (state.identifierType === "cnpj") elements.identifier.value = formatCnpj(elements.identifier.value);
        setIdentifierIcon(state.identifierType);
      }
      validateIdentifier();
    });

    elements.identifier.addEventListener("blur", validateIdentifier);

    elements.password.addEventListener("input", validatePassword);
    elements.password.addEventListener("keyup", event => {
      if (!event.getModifierState) return;
      updateCapsWarning(event.getModifierState("CapsLock"));
    });
    elements.password.addEventListener("blur", () => updateCapsWarning(false));

    elements.form.addEventListener("submit", handleSubmit);

    restoreRememberedSession();
    if (!isMobile()) elements.identifier.focus();

    setupLinkShortcuts();
    bindTouchFeedback();
    setButtonState("idle");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.LoginEmpresa = { init };
  window.showMobileAlert = message => showToast(message, "info");
})();
