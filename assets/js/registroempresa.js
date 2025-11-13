(() => {
  if (window.__ml_registroempresa_init__) return;
  window.__ml_registroempresa_init__ = true;

  const selectors = {
    form: "#registerForm",
    button: "#registerButton",
    passwordToggle: "#passwordToggle",
    confirmToggle: "#confirmPasswordToggle",
    terms: "#agreeTerms",
    marketing: "#agreeMarketing",
    otherGroup: "#otherCategoryGroup",
    termsLink: ".terms-link",
    loginLink: ".login-link",
    personalLink: ".personal-register-link",
    strengthFill: "#strengthFill",
    strengthText: "#strengthText",
    registerCard: ".register-card",
  };

  const fields = {
    companyName: { input: "#companyName", error: "#companyNameError" },
    cnpj: { input: "#cnpj", error: "#cnpjError" },
    companyPhone: { input: "#companyPhone", error: "#companyPhoneError" },
    companyEmail: { input: "#companyEmail", error: "#companyEmailError" },
    businessCategory: {
      input: "#businessCategory",
      error: "#businessCategoryError",
    },
    otherCategory: { input: "#otherCategory", error: "#otherCategoryError" },
    responsibleName: {
      input: "#responsibleName",
      error: "#responsibleNameError",
    },
    responsiblePosition: {
      input: "#responsiblePosition",
      error: "#responsiblePositionError",
    },
    responsibleEmail: {
      input: "#responsibleEmail",
      error: "#responsibleEmailError",
    },
    responsiblePhone: {
      input: "#responsiblePhone",
      error: "#responsiblePhoneError",
    },
    password: { input: "#password", error: "#passwordError" },
    confirmPassword: {
      input: "#confirmPassword",
      error: "#confirmPasswordError",
    },
    terms: { input: "#agreeTerms", error: "#termsError" },
  };

  const state = {
    form: null,
    button: null,
    elements: {},
    errors: {},
    otherGroup: null,
    strengthFill: null,
    strengthText: null,
  };

  function query(selector) {
    return document.querySelector(selector);
  }

  function queryAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function digits(value) {
    return (value || "").replace(/\D/g, "");
  }

  function setError(field, message) {
    const input = state.elements[field];
    const error = state.errors[field];
    if (!input || !error) return false;
    input.classList.add("error");
    error.textContent = message;
    error.classList.add("show");
    return false;
  }

  function clearError(field) {
    const input = state.elements[field];
    const error = state.errors[field];
    if (!input || !error) return true;
    input.classList.remove("error");
    error.classList.remove("show");
    error.textContent = "";
    return true;
  }

  function formatPhone(input) {
    let value = digits(input.value).slice(0, 11);
    if (value.length >= 11)
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (value.length >= 7)
      value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (value.length >= 3)
      value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    else if (value.length) value = value.replace(/(\d{0,2})/, "($1");
    input.value = value;
  }

  function formatCnpj(input) {
    let value = digits(input.value).slice(0, 14);
    if (value.length >= 14)
      value = value.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    else if (value.length >= 12)
      value = value.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
        "$1.$2.$3/$4-$5",
      );
    else if (value.length >= 9)
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4");
    else if (value.length >= 6)
      value = value.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
    else if (value.length >= 3)
      value = value.replace(/(\d{2})(\d{0,3})/, "$1.$2");
    input.value = value;
  }

  function isValidCnpj(value) {
    const cnpj = digits(value);
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    const calc = (length) => {
      let sum = 0;
      let pos = length - 7;
      for (let i = length; i >= 1; i -= 1) {
        sum += Number(cnpj[length - i]) * pos--;
        if (pos < 2) pos = 9;
      }
      return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };
    const digit1 = calc(12);
    const digit2 = calc(13);
    return digit1 === Number(cnpj[12]) && digit2 === Number(cnpj[13]);
  }

  function validateCompanyName() {
    const value = state.elements.companyName?.value.trim() || "";
    if (!value) return setError("companyName", "Nome da empresa é obrigatório");
    if (value.length < 2)
      return setError(
        "companyName",
        "Nome da empresa deve ter pelo menos 2 caracteres",
      );
    return clearError("companyName");
  }

  function validateCnpj() {
    const value = state.elements.cnpj?.value || "";
    if (!value) return setError("cnpj", "CNPJ é obrigatório");
    if (!isValidCnpj(value)) return setError("cnpj", "CNPJ inválido");
    return clearError("cnpj");
  }

  function validateCompanyPhone() {
    const value = digits(state.elements.companyPhone?.value);
    if (!value)
      return setError("companyPhone", "Telefone da empresa é obrigatório");
    if (value.length < 10)
      return setError(
        "companyPhone",
        "Telefone deve ter pelo menos 10 dígitos",
      );
    if (value.length > 11)
      return setError("companyPhone", "Telefone deve ter no máximo 11 dígitos");
    return clearError("companyPhone");
  }

  function validateCompanyEmail() {
    const value = state.elements.companyEmail?.value.trim() || "";
    if (!value)
      return setError("companyEmail", "E-mail da empresa é obrigatório");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return setError("companyEmail", "Informe um e-mail válido");
    return clearError("companyEmail");
  }

  function toggleOtherCategory() {
    const field = state.elements.businessCategory;
    if (!field || !state.otherGroup) return;
    const selected = field.value;
    if (selected === "outros") {
      state.otherGroup.style.display = "flex";
      state.otherGroup.classList.add("show");
      state.elements.otherCategory?.setAttribute("required", "required");
      setTimeout(() => state.elements.otherCategory?.focus(), 200);
    } else {
      state.otherGroup.classList.remove("show");
      setTimeout(() => {
        state.otherGroup.style.display = "none";
      }, 300);
      if (state.elements.otherCategory) {
        state.elements.otherCategory.value = "";
        state.elements.otherCategory.removeAttribute("required");
      }
      clearError("otherCategory");
    }
  }

  function validateBusinessCategory() {
    const value = state.elements.businessCategory?.value || "";
    if (!value)
      return setError("businessCategory", "Categoria de negócio é obrigatória");
    return clearError("businessCategory");
  }

  function validateOtherCategory() {
    const category = state.elements.businessCategory?.value;
    if (category !== "outros") return clearError("otherCategory");
    const value = state.elements.otherCategory?.value.trim() || "";
    if (!value) return setError("otherCategory", "Informe a categoria");
    if (value.length < 2)
      return setError(
        "otherCategory",
        "Categoria deve ter pelo menos 2 caracteres",
      );
    return clearError("otherCategory");
  }

  function validateResponsibleName() {
    const value = state.elements.responsibleName?.value.trim() || "";
    if (!value)
      return setError("responsibleName", "Nome do responsável é obrigatório");
    if (value.length < 2)
      return setError(
        "responsibleName",
        "Nome deve ter pelo menos 2 caracteres",
      );
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value))
      return setError("responsibleName", "Nome deve conter apenas letras");
    return clearError("responsibleName");
  }

  function validateResponsiblePosition() {
    const value = state.elements.responsiblePosition?.value.trim() || "";
    if (!value) return setError("responsiblePosition", "Cargo é obrigatório");
    if (value.length < 2)
      return setError(
        "responsiblePosition",
        "Cargo deve ter pelo menos 2 caracteres",
      );
    return clearError("responsiblePosition");
  }

  function validateResponsibleEmail() {
    const value = state.elements.responsibleEmail?.value.trim() || "";
    if (!value)
      return setError(
        "responsibleEmail",
        "E-mail do responsável é obrigatório",
      );
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return setError("responsibleEmail", "Informe um e-mail válido");
    return clearError("responsibleEmail");
  }

  function validateResponsiblePhone() {
    const value = digits(state.elements.responsiblePhone?.value);
    if (!value)
      return setError(
        "responsiblePhone",
        "Telefone do responsável é obrigatório",
      );
    if (value.length < 10)
      return setError(
        "responsiblePhone",
        "Telefone deve ter pelo menos 10 dígitos",
      );
    if (value.length > 11)
      return setError(
        "responsiblePhone",
        "Telefone deve ter no máximo 11 dígitos",
      );
    return clearError("responsiblePhone");
  }

  function checkPasswordStrength() {
    const password = state.elements.password?.value || "";
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
      { label: "Forte", cls: "strong" },
    ];
    const level = password
      ? Math.min(3, score <= 2 ? 1 : score <= 3 ? 2 : 3)
      : 0;
    state.strengthFill.className = `strength-fill ${map[level].cls}`;
    state.strengthText.className = `strength-text ${map[level].cls}`;
    state.strengthText.textContent = map[level].label;
  }

  function validatePassword() {
    const password = state.elements.password?.value || "";
    if (!password) return setError("password", "Senha é obrigatória");
    if (password.length < 8)
      return setError("password", "A senha deve ter pelo menos 8 caracteres");
    if (!/[a-z]/.test(password))
      return setError(
        "password",
        "A senha deve conter pelo menos uma letra minúscula",
      );
    if (!/[A-Z]/.test(password))
      return setError(
        "password",
        "A senha deve conter pelo menos uma letra maiúscula",
      );
    if (!/[0-9]/.test(password))
      return setError("password", "A senha deve conter pelo menos um número");
    return clearError("password");
  }

  function validateConfirmPassword() {
    const password = state.elements.password?.value || "";
    const confirm = state.elements.confirmPassword?.value || "";
    if (!confirm)
      return setError("confirmPassword", "Confirmação de senha é obrigatória");
    if (password !== confirm)
      return setError("confirmPassword", "As senhas não coincidem");
    return clearError("confirmPassword");
  }

  function validateTerms() {
    const agreed = !!state.elements.terms?.checked;
    if (!agreed) return setError("terms", "Você deve aceitar os termos de uso");
    return clearError("terms");
  }

  function validateAll() {
    return [
      validateCompanyName(),
      validateCnpj(),
      validateCompanyPhone(),
      validateCompanyEmail(),
      validateBusinessCategory(),
      validateOtherCategory(),
      validateResponsibleName(),
      validateResponsiblePosition(),
      validateResponsibleEmail(),
      validateResponsiblePhone(),
      validatePassword(),
      validateConfirmPassword(),
      validateTerms(),
    ].every(Boolean);
  }

  function buttonState(stateName, message) {
    if (!state.button) return;
    if (stateName === "loading") {
      state.button.innerHTML =
        '<div class="loading-spinner"></div><span class="button-text">Criando conta empresarial...</span>';
      state.button.disabled = true;
      return;
    }
    if (stateName === "success") {
      state.button.innerHTML = `<i class="ri-check-line button-icon"></i><span class="button-text">${message}</span>`;
      state.button.style.background =
        "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      state.button.disabled = true;
      return;
    }
    if (stateName === "error") {
      state.button.innerHTML =
        '<i class="ri-error-warning-line button-icon"></i><span class="button-text">Erro</span>';
      state.button.style.background =
        "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
      state.button.disabled = true;
      setTimeout(() => resetButton(), 3000);
      return;
    }
    resetButton();
  }

  function resetButton() {
    state.button.innerHTML =
      '<span class="button-text">Criar Conta Empresarial</span><i class="ri-arrow-right-line button-icon"></i>';
    state.button.style.background =
      "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)";
    state.button.disabled = false;
  }

  function beautifyPhone(value) {
    const clean = digits(value);
    if (clean.length === 11)
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    if (clean.length === 10)
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    return value || clean;
  }

  function beautifyCnpj(value) {
    const clean = digits(value);
    if (clean.length !== 14) return clean || value;
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
  }

  function createPayload() {
    const data = {
      companyName: state.elements.companyName?.value.trim() || "",
      cnpj: digits(state.elements.cnpj?.value),
      companyPhone: state.elements.companyPhone?.value.trim() || "",
      companyEmail: state.elements.companyEmail?.value.trim() || "",
      businessCategory: state.elements.businessCategory?.value || "",
      otherCategory: state.elements.otherCategory?.value.trim() || "",
      responsibleName: state.elements.responsibleName?.value.trim() || "",
      responsiblePosition:
        state.elements.responsiblePosition?.value.trim() || "",
      responsibleEmail: state.elements.responsibleEmail?.value.trim() || "",
      responsiblePhone: state.elements.responsiblePhone?.value.trim() || "",
      password: state.elements.password?.value || "",
      marketing: !!query(selectors.marketing)?.checked,
    };

    const selectedOption =
      state.elements.businessCategory?.selectedOptions?.[0];
    const categoryLabel =
      data.businessCategory === "outros"
        ? data.otherCategory
        : (selectedOption?.text || "").trim();

    return {
      type: "business",
      email: data.companyEmail,
      password: data.password,
      name: data.companyName,
      company: data.companyName,
      phone: data.companyPhone || beautifyPhone(data.companyPhone),
      cnpj: data.cnpj,
      profile: {
        caption: `Responsável: ${data.responsibleName}`,
        tags: categoryLabel ? [categoryLabel] : [],
        sector: categoryLabel,
        model: categoryLabel ? `Atuação em ${categoryLabel}` : "Sob demanda",
        headquarters: "Brasil",
        marketingOptIn: data.marketing,
        createdAt: new Date().toISOString(),
        contact: {
          instagram:
            "@" + (data.companyName || "").replace(/\s+/g, "").toLowerCase(),
          linkedin: data.companyName,
          email: data.responsibleEmail,
          phone: beautifyPhone(data.responsiblePhone),
          manager: data.responsibleName,
          role: data.responsiblePosition,
          document: beautifyCnpj(data.cnpj),
        },
        agendaToday: 0,
        curriculos: 0,
      },
    };
  }

  async function submit(event) {
    event.preventDefault();
    if (!validateAll()) return;
    buttonState("loading");
    try {
      await MapsAuth.register(createPayload());
      buttonState("success", "Conta empresarial criada com sucesso!");
      setTimeout(() => {
        window.location.href = "loginempresa.html";
      }, 1800);
    } catch (error) {
      const message =
        error?.message === "EMAIL_TAKEN"
          ? "Este e-mail já está em uso"
          : error?.message === "CNPJ_TAKEN"
            ? "Este CNPJ já está em uso"
            : error?.message === "PASSWORD_REQUIRED"
              ? "Informe uma senha válida"
              : error?.message === "STORAGE_UNAVAILABLE"
                ? "Não foi possível salvar seus dados neste navegador. Verifique permissões de armazenamento e tente novamente."
                : error?.message ||
                  "Erro ao criar conta empresarial. Tente novamente.";
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
      setTimeout(() => {
        window.location.href = url;
      }, 800);
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
        togglePassword.setAttribute(
          "aria-label",
          visible ? "Mostrar senha" : "Ocultar senha",
        );
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
        toggleConfirm.setAttribute(
          "aria-label",
          visible ? "Mostrar senha" : "Ocultar senha",
        );
      });
    }
  }

  function bindFieldEvents() {
    state.elements.companyName?.addEventListener("input", validateCompanyName);
    if (state.elements.cnpj)
      state.elements.cnpj.addEventListener("input", () => {
        formatCnpj(state.elements.cnpj);
        validateCnpj();
      });
    if (state.elements.companyPhone)
      state.elements.companyPhone.addEventListener("input", () => {
        formatPhone(state.elements.companyPhone);
        validateCompanyPhone();
      });
    state.elements.companyEmail?.addEventListener(
      "input",
      validateCompanyEmail,
    );
    if (state.elements.businessCategory) {
      ["change", "input"].forEach((evt) => {
        state.elements.businessCategory.addEventListener(evt, () => {
          validateBusinessCategory();
          toggleOtherCategory();
        });
      });
    }
    state.elements.otherCategory?.addEventListener(
      "input",
      validateOtherCategory,
    );
    state.elements.responsibleName?.addEventListener(
      "input",
      validateResponsibleName,
    );
    state.elements.responsiblePosition?.addEventListener(
      "input",
      validateResponsiblePosition,
    );
    state.elements.responsibleEmail?.addEventListener(
      "input",
      validateResponsibleEmail,
    );
    if (state.elements.responsiblePhone)
      state.elements.responsiblePhone.addEventListener("input", () => {
        formatPhone(state.elements.responsiblePhone);
        validateResponsiblePhone();
      });
    if (state.elements.password)
      state.elements.password.addEventListener("input", () => {
        validatePassword();
        checkPasswordStrength();
      });
    state.elements.confirmPassword?.addEventListener(
      "input",
      validateConfirmPassword,
    );
    state.elements.terms?.addEventListener("change", validateTerms);
  }

  function bindLinks() {
    queryAll(selectors.termsLink).forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showMobileAlert("Abrindo termos de uso...");
      });
    });
    const login = query(selectors.loginLink);
    if (login) {
      login.addEventListener("click", (event) => {
        event.preventDefault();
        navigateWithFeedback(
          "loginempresa.html",
          "Redirecionando para login empresarial...",
        );
      });
    }
    const personal = query(selectors.personalLink);
    if (personal) {
      personal.addEventListener("click", (event) => {
        event.preventDefault();
        navigateWithFeedback(
          "registropessoal.html",
          "Redirecionando para registro pessoal...",
        );
      });
    }
  }

  function setupMobileExperience() {
    if (window.innerWidth > 768) return;
    document.body.style.overflowX = "hidden";
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport)
          viewport.content =
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
        setTimeout(
          () =>
            input.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            }),
          300,
        );
      });
      input.addEventListener("blur", () => {
        setTimeout(() => {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport)
            viewport.content = "width=device-width, initial-scale=1";
        }, 300);
      });
    });
    if ("ontouchstart" in window) {
      const touchables = document.querySelectorAll(
        ".register-button, .password-toggle, .checkbox-container, .personal-register-link, .login-link",
      );
      touchables.forEach((element) => {
        element.addEventListener(
          "touchstart",
          () => {
            element.style.transform = "scale(0.95)";
            element.style.transition = "transform 0.1s ease";
          },
          { passive: true },
        );
        const reset = () => {
          element.style.transform = "scale(1)";
        };
        element.addEventListener("touchend", reset);
        element.addEventListener("touchcancel", reset);
      });
      if ("vibrate" in navigator) {
        document
          .querySelectorAll(".register-button, .password-toggle")
          .forEach((button) => {
            button.addEventListener("click", () => navigator.vibrate(50));
          });
      }
    }
    const card = query(selectors.registerCard);
    const adjust = () => {
      if (!card) return;
      card.style.padding =
        window.innerHeight < window.innerWidth ? "20px 24px" : "28px 20px";
    };
    window.addEventListener("orientationchange", () => setTimeout(adjust, 100));
    window.addEventListener("resize", adjust);
    adjust();
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
    state.otherGroup = query(selectors.otherGroup);
    state.strengthFill = query(selectors.strengthFill);
    state.strengthText = query(selectors.strengthText);
    if (!state.form || !state.button) return;
    Object.keys(fields).forEach((key) => {
      state.elements[key] = query(fields[key].input);
      state.errors[key] = query(fields[key].error);
    });
    injectSpinnerStyles();
    bindFieldEvents();
    bindToggles();
    bindLinks();
    setupMobileExperience();
    toggleOtherCategory();
    state.form.addEventListener("submit", submit);
    if (window.innerWidth > 768) state.elements.companyName?.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
