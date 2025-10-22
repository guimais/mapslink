(() => {
  if (window.__ml_registropessoal_init__) return;
  window.__ml_registropessoal_init__ = true;

  const selectors = {
    form: "#registerForm",
    button: "#registerButton",
    passwordToggle: "#passwordToggle",
    confirmToggle: "#confirmPasswordToggle",
    terms: "#agreeTerms",
    marketing: "#agreeMarketing",
    strengthFill: "#strengthFill",
    strengthText: "#strengthText",
    loginLink: ".login-link",
    businessLink: ".business-register-link",
    termsLink: ".terms-link",
    registerCard: ".register-card"
  };

  const fields = {
    firstName: { input: "#firstName", error: "#firstNameError" },
    lastName: { input: "#lastName", error: "#lastNameError" },
    email: { input: "#email", error: "#emailError" },
    phone: { input: "#phone", error: "#phoneError" },
    birthDate: { input: "#birthDate", error: "#birthDateError" },
    password: { input: "#password", error: "#passwordError" },
    confirmPassword: { input: "#confirmPassword", error: "#confirmPasswordError" },
    terms: { input: "#agreeTerms", error: "#termsError" }
  };

  const state = {
    form: null,
    button: null,
    strengthFill: null,
    strengthText: null,
    elements: {},
    errors: {}
  };

  function query(selector) {
    return document.querySelector(selector);
  }

  function queryAll(selector) {
    return Array.from(document.querySelectorAll(selector || ""));
  }

  function getValue(field) {
    const element = state.elements[field];
    if (!element) return "";
    if (element.type === "checkbox") return element.checked;
    return element.value;
  }

  function digits(value) {
    return (value || "").replace(/\D/g, "");
  }

  function setError(field, message) {
    const element = state.elements[field];
    const error = state.errors[field];
    if (!element || !error) return false;
    element.classList.add("error");
    error.textContent = message;
    error.classList.add("show");
    return false;
  }

  function clearError(field) {
    const element = state.elements[field];
    const error = state.errors[field];
    if (!element || !error) return true;
    element.classList.remove("error");
    error.classList.remove("show");
    error.textContent = "";
    return true;
  }

  function formatPhone(input) {
    let value = digits(input.value).slice(0, 11);
    if (value.length >= 11) value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (value.length >= 7) value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (value.length >= 3) value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    else if (value.length) value = value.replace(/(\d{0,2})/, "($1");
    input.value = value;
  }

  function validateFirstName() {
    const value = getValue("firstName").trim();
    if (!value) return setError("firstName", "Nome é obrigatório");
    if (value.length < 2) return setError("firstName", "Nome deve ter pelo menos 2 caracteres");
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return setError("firstName", "Nome deve conter apenas letras");
    return clearError("firstName");
  }

  function validateLastName() {
    const value = getValue("lastName").trim();
    if (!value) return setError("lastName", "Sobrenome é obrigatório");
    if (value.length < 2) return setError("lastName", "Sobrenome deve ter pelo menos 2 caracteres");
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return setError("lastName", "Sobrenome deve conter apenas letras");
    return clearError("lastName");
  }

  function validateEmail() {
    const value = getValue("email").trim();
    if (!value) return setError("email", "E-mail é obrigatório");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError("email", "Informe um e-mail válido");
    return clearError("email");
  }

  function validatePhone() {
    const value = digits(getValue("phone"));
    if (!value) return setError("phone", "Telefone é obrigatório");
    if (value.length < 10) return setError("phone", "Telefone deve ter pelo menos 10 dígitos");
    if (value.length > 11) return setError("phone", "Telefone deve ter no máximo 11 dígitos");
    return clearError("phone");
  }

  function validateBirthDate() {
    const value = getValue("birthDate");
    if (!value) return setError("birthDate", "Data de nascimento é obrigatória");
    const today = new Date();
    const birth = new Date(value);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
    if (age < 14) return setError("birthDate", "Você deve ter pelo menos 14 anos");
    if (age > 120) return setError("birthDate", "Data de nascimento inválida");
    return clearError("birthDate");
  }

  function checkPasswordStrength() {
    const password = getValue("password");
    if (!state.strengthFill || !state.strengthText) return;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    const map = [
      { label: "Digite uma senha", cls: "" },
      { label: "Fraca", cls: "weak" },
      { label: "Média", cls: "medium" },
      { label: "Forte", cls: "strong" }
    ];
    const level = password ? Math.min(3, score <= 2 ? 1 : score <= 3 ? 2 : 3) : 0;
    state.strengthFill.className = `strength-fill ${map[level].cls}`;
    state.strengthText.className = `strength-text ${map[level].cls}`;
    state.strengthText.textContent = map[level].label;
  }

  function validatePassword() {
    const password = getValue("password");
    if (!password) return setError("password", "Senha é obrigatória");
    if (password.length < 8) return setError("password", "A senha deve ter pelo menos 8 caracteres");
    if (!/[a-z]/.test(password)) return setError("password", "A senha deve conter pelo menos uma letra minúscula");
    if (!/[A-Z]/.test(password)) return setError("password", "A senha deve conter pelo menos uma letra maiúscula");
    if (!/[0-9]/.test(password)) return setError("password", "A senha deve conter pelo menos um número");
    return clearError("password");
  }

  function validateConfirmPassword() {
    const password = getValue("password");
    const confirm = getValue("confirmPassword");
    if (!confirm) return setError("confirmPassword", "Confirmação de senha é obrigatória");
    if (password !== confirm) return setError("confirmPassword", "As senhas não coincidem");
    return clearError("confirmPassword");
  }

  function validateTerms() {
    const agreed = !!state.elements.terms?.checked;
    if (!agreed) return setError("terms", "Você deve aceitar os termos de uso");
    return clearError("terms");
  }

  function validateAll() {
    const results = [
      validateFirstName(),
      validateLastName(),
      validateEmail(),
      validatePhone(),
      validateBirthDate(),
      validatePassword(),
      validateConfirmPassword(),
      validateTerms()
    ];
    return results.every(Boolean);
  }

  function buttonState(stateName, message) {
    if (!state.button) return;
    if (stateName === "loading") {
      state.button.innerHTML = '<div class="loading-spinner"></div><span class="button-text">Criando conta...</span>';
      state.button.disabled = true;
      return;
    }
    if (stateName === "success") {
      state.button.innerHTML = `<i class="ri-check-line button-icon"></i><span class="button-text">${message}</span>`;
      state.button.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      state.button.disabled = true;
      return;
    }
    if (stateName === "error") {
      state.button.innerHTML = '<i class="ri-error-warning-line button-icon"></i><span class="button-text">Erro</span>';
      state.button.style.background = "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
      state.button.disabled = true;
      setTimeout(() => resetButton(), 3000);
      return;
    }
    resetButton();
  }

  function resetButton() {
    state.button.innerHTML = '<span class="button-text">Criar Conta</span><i class="ri-arrow-right-line button-icon"></i>';
    state.button.style.background = "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)";
    state.button.disabled = false;
  }

  async function submit(event) {
    event.preventDefault();
    if (!validateAll()) return;
    buttonState("loading");
    const phone = getValue("phone").trim();
    const payload = {
      type: "personal",
      email: getValue("email").trim(),
      password: getValue("password"),
      name: `${getValue("firstName").trim()} ${getValue("lastName").trim()}`.trim(),
      phone,
      profile: {
        firstName: getValue("firstName").trim(),
        lastName: getValue("lastName").trim(),
        birthDate: getValue("birthDate"),
        marketingOptIn: !!state.elements.marketing?.checked,
        phone,
        phoneDigits: digits(phone),
        createdAt: new Date().toISOString()
      }
    };
    try {
      await MapsAuth.register(payload);
      buttonState("success", "Conta criada com sucesso!");
      setTimeout(() => { window.location.href = "../index.html"; }, 1800);
    } catch (error) {
      const message =
        error?.message === "EMAIL_TAKEN" ? "Este e-mail já está em uso" :
        error?.message === "PASSWORD_REQUIRED" ? "Informe uma senha válida" :
        error?.message === "STORAGE_UNAVAILABLE" ? "Não foi possível salvar seus dados neste navegador. Verifique permissões de armazenamento e tente novamente." :
        (error?.message || "Erro ao criar conta. Tente novamente.");
      buttonState("error");
      alert(message);
    }
  }

  function showMobileAlert(message) {
    if (window.innerWidth > 768) {
      alert(message);
      return;
    }
    const toast = document.createElement("div");
    toast.style.cssText = `
      position:fixed;bottom:20px;left:20px;right:20px;background:var(--brand);
      color:#fff;padding:16px;border-radius:12px;font-size:14px;font-weight:500;
      text-align:center;z-index:10000;box-shadow:0 8px 32px rgba(0,0,0,0.2);
      transform:translateY(100px);opacity:0;transition:all .3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
    });
    setTimeout(() => {
      toast.style.transform = "translateY(100px)";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function navigateWithFeedback(url, message) {
    if (window.innerWidth <= 768) {
      showMobileAlert(message);
      setTimeout(() => { window.location.href = url; }, 800);
    } else {
      window.location.href = url;
    }
  }

  function bindToggles() {
    const togglePassword = query(selectors.passwordToggle);
    const toggleConfirm = query(selectors.confirmToggle);
    if (togglePassword) {
      togglePassword.addEventListener("click", () => {
        const input = state.elements.password;
        if (!input) return;
        const visible = input.type === "text";
        input.type = visible ? "password" : "text";
        const icon = togglePassword.querySelector("i");
        if (icon) icon.className = visible ? "ri-eye-line" : "ri-eye-off-line";
        togglePassword.setAttribute("aria-label", visible ? "Mostrar senha" : "Ocultar senha");
      });
    }
    if (toggleConfirm) {
      toggleConfirm.addEventListener("click", () => {
        const input = state.elements.confirmPassword;
        if (!input) return;
        const visible = input.type === "text";
        input.type = visible ? "password" : "text";
        const icon = toggleConfirm.querySelector("i");
        if (icon) icon.className = visible ? "ri-eye-line" : "ri-eye-off-line";
        toggleConfirm.setAttribute("aria-label", visible ? "Mostrar senha" : "Ocultar senha");
      });
    }
  }

  function setupMobileExperience() {
    if (window.innerWidth > 768) return;
    document.body.style.overflowX = "hidden";
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
      input.addEventListener("focus", () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) viewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
        setTimeout(() => input.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" }), 300);
      });
      input.addEventListener("blur", () => {
        setTimeout(() => {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) viewport.content = "width=device-width, initial-scale=1";
        }, 300);
      });
    });
    if ("ontouchstart" in window) {
      const touchables = document.querySelectorAll(".register-button, .password-toggle, .checkbox-container, .business-register-link, .login-link");
      touchables.forEach(element => {
        element.addEventListener("touchstart", () => {
          element.style.transform = "scale(0.95)";
          element.style.transition = "transform 0.1s ease";
        }, { passive: true });
        const reset = () => { element.style.transform = "scale(1)"; };
        element.addEventListener("touchend", reset);
        element.addEventListener("touchcancel", reset);
      });
      if ("vibrate" in navigator) {
        document.querySelectorAll(".register-button, .password-toggle").forEach(button => {
          button.addEventListener("click", () => navigator.vibrate(50));
        });
      }
    }
    const card = query(selectors.registerCard);
    const adjustPadding = () => {
      if (!card) return;
      card.style.padding = window.innerHeight < window.innerWidth ? "20px 24px" : "28px 20px";
    };
    window.addEventListener("orientationchange", () => setTimeout(adjustPadding, 100));
    window.addEventListener("resize", adjustPadding);
    adjustPadding();
  }

  function bindLinks() {
    const login = query(selectors.loginLink);
    if (login) {
      login.addEventListener("click", event => {
        event.preventDefault();
        navigateWithFeedback("loginpessoal.html", "Redirecionando para login pessoal...");
      });
    }
    queryAll(selectors.termsLink).forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        showMobileAlert("Abrindo termos de uso...");
      });
    });
    const business = query(selectors.businessLink);
    if (business) {
      business.addEventListener("click", event => {
        event.preventDefault();
        navigateWithFeedback("registroempresa.html", "Redirecionando para registro empresarial...");
      });
    }
  }

  function bindFieldEvents() {
    state.elements.firstName?.addEventListener("input", validateFirstName);
    state.elements.lastName?.addEventListener("input", validateLastName);
    state.elements.email?.addEventListener("input", validateEmail);
    if (state.elements.phone) {
      state.elements.phone.addEventListener("input", () => {
        formatPhone(state.elements.phone);
        validatePhone();
      });
    }
    state.elements.birthDate?.addEventListener("change", validateBirthDate);
    if (state.elements.password) {
      state.elements.password.addEventListener("input", () => {
        validatePassword();
        checkPasswordStrength();
      });
    }
    state.elements.confirmPassword?.addEventListener("input", validateConfirmPassword);
    state.elements.terms?.addEventListener("change", validateTerms);
  }

  function injectSpinnerStyles() {
    if (document.getElementById("register-spinner-styles")) return;
    const style = document.createElement("style");
    style.id = "register-spinner-styles";
    style.textContent = `
      .loading-spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.3);border-top:2px solid #fff;border-radius:50%;animation:spin 1s linear infinite;}
      @keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
    `;
    document.head.appendChild(style);
  }

  function init() {
    state.form = query(selectors.form);
    state.button = query(selectors.button);
    state.strengthFill = query(selectors.strengthFill);
    state.strengthText = query(selectors.strengthText);
    if (!state.form || !state.button) return;
    Object.keys(fields).forEach(key => {
      const cfg = fields[key];
      state.elements[key] = query(cfg.input);
      state.errors[key] = query(cfg.error);
    });
    injectSpinnerStyles();
    bindFieldEvents();
    bindToggles();
    bindLinks();
    setupMobileExperience();
    state.form.addEventListener("submit", submit);
    if (window.innerWidth > 768) state.elements.firstName?.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
