const LoginEmpresa = (() => {
  'use strict';

  const state = {
    identifierType: 'unknown',
    capsLockVisible: false
  };

  let el = {};
  let originalButtonLabel = '';
  let styleTag = null;

  const linkShortcuts = [
    { selector: '.register-link', href: 'registroempresa.html' },
    { selector: '.forgot-password', href: 'esqueceusenha.html' },
    { selector: '.personal-login-link', href: 'loginpessoal.html' }
  ];

  function init() {
    el = mapElements();
    injectStyles();
    setupLinkShortcuts();
    setupTouchEnhancements();
    setupInputAnimations();
    initializeNavbar();
    if (!el.form) return;
    originalButtonLabel = el.button ? el.button.innerHTML : '';
    ensureCapsLockWarning();
    bindCoreEvents();
    restoreRememberedSession();
    setInitialFocus();
  }

  function mapElements() {
    const identifierIcon = document.querySelector('[data-identifier-icon]') || document.querySelector('#emailOrCnpj + .input-icon') || document.querySelector('.input-icon');
    return {
      form: document.getElementById('loginForm'),
      identifier: document.getElementById('emailOrCnpj'),
      password: document.getElementById('password'),
      toggle: document.getElementById('passwordToggle'),
      button: document.getElementById('loginButton'),
      remember: document.getElementById('rememberMe'),
      identifierError: document.getElementById('emailOrCnpjError'),
      passwordError: document.getElementById('passwordError'),
      identifierIcon,
      capsWarning: null
    };
  }

  function bindCoreEvents() {
    if (el.form && !el.form.dataset.enhanced) {
      el.form.dataset.enhanced = 'true';
      el.form.addEventListener('submit', handleSubmit);
    }
    if (el.toggle && !el.toggle.dataset.enhanced) {
      el.toggle.dataset.enhanced = 'true';
      el.toggle.addEventListener('click', togglePasswordVisibility);
    }
    if (el.identifier && !el.identifier.dataset.enhanced) {
      el.identifier.dataset.enhanced = 'true';
      el.identifier.addEventListener('input', handleIdentifierInput);
      el.identifier.addEventListener('blur', validateIdentifier);
    }
    if (el.password && !el.password.dataset.enhanced) {
      el.password.dataset.enhanced = 'true';
      el.password.addEventListener('input', () => validatePassword());
      el.password.addEventListener('keyup', handleCapsLock);
      el.password.addEventListener('blur', () => updateCapsWarning(false));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    clearErrors();
    const isIdentifierValid = validateIdentifier();
    const isPasswordValid = validatePassword();
    if (!isIdentifierValid || !isPasswordValid) {
      animateFormError();
      showToast('Revise os campos destacados.', 'error', 2600);
      return;
    }
    submitLogin();
  }

  function handleIdentifierInput() {
    if (!el.identifier) return;
    const previousType = state.identifierType;
    const value = el.identifier.value.trim();
    state.identifierType = detectIdentifierType(value);
    if (state.identifierType === 'cnpj') formatCnpjInput();
    if (previousType !== state.identifierType) updateIdentifierIcon();
    validateIdentifier();
  }

  function handleCapsLock(event) {
    if (!event.getModifierState) return;
    state.capsLockVisible = event.getModifierState('CapsLock');
    updateCapsWarning(state.capsLockVisible);
  }

  function togglePasswordVisibility() {
    if (!el.password || !el.toggle) return;
    const willShow = el.password.type === 'password';
    el.password.type = willShow ? 'text' : 'password';
    const icon = el.toggle.querySelector('i');
    if (icon) {
      icon.classList.remove('ri-eye-line', 'ri-eye-off-line');
      icon.classList.add(willShow ? 'ri-eye-off-line' : 'ri-eye-line');
    }
    el.toggle.setAttribute('aria-label', willShow ? 'Ocultar senha' : 'Mostrar senha');
    el.toggle.setAttribute('aria-pressed', String(willShow));
  }

  function submitLogin() {
    if (!el.identifier || !el.password) return;
    const identifierValue = el.identifier.value.trim();
    const passwordValue = el.password.value;
    const rememberChoice = el.remember ? el.remember.checked : false;
    setButtonState('loading', 'Validando...');
    fakeAuthenticate(identifierValue, passwordValue)
      .then(() => handleLoginSuccess(identifierValue, rememberChoice))
      .catch(handleLoginError);
  }

  function handleLoginSuccess(identifierValue, rememberChoice) {
    if (rememberChoice) {
      localStorage.setItem('businessLoginIdentifier', identifierValue);
      localStorage.setItem('rememberBusiness', 'true');
    } else {
      localStorage.removeItem('businessLoginIdentifier');
      localStorage.removeItem('rememberBusiness');
    }
    localStorage.setItem('authToken', 'business-token-' + Date.now());
    localStorage.setItem('userType', 'business');
    setButtonState('success', 'Login aprovado!');
    showToast('Login realizado com sucesso. Redirecionando...', 'success', 2600);
    setTimeout(() => {
      window.location.href = 'perfilempresa.html';
    }, 1600);
  }

  function handleLoginError(error) {
    const message = error && error.message ? error.message : 'Não foi possível concluir o login.';
    setButtonState('error', 'Falha no login');
    showToast(message, 'error', 3200);
    animateFormError();
    setTimeout(() => setButtonState('idle'), 2600);
  }

  function setButtonState(state, label) {
    if (!el.button) return;
    if (!originalButtonLabel) originalButtonLabel = el.button.innerHTML;
    el.button.classList.toggle('is-loading', state === 'loading');
    el.button.classList.toggle('is-success', state === 'success');
    el.button.classList.toggle('is-error', state === 'error');
    el.button.dataset.state = state;
    if (state === 'loading') {
      el.button.disabled = true;
      el.button.innerHTML = `<span class="spinner" aria-hidden="true"></span><span class="button-text">${label || 'Validando...'}</span>`;
    } else if (state === 'success') {
      el.button.disabled = true;
      el.button.innerHTML = `<i class="ri-check-line" aria-hidden="true"></i><span class="button-text">${label || 'Tudo certo!'}</span>`;
    } else if (state === 'error') {
      el.button.disabled = true;
      el.button.innerHTML = `<i class="ri-error-warning-line" aria-hidden="true"></i><span class="button-text">${label || 'Revise os dados'}</span>`;
      setTimeout(() => {
        if (el.button.dataset.state === 'error') el.button.disabled = false;
      }, 900);
    } else {
      el.button.disabled = false;
      el.button.innerHTML = originalButtonLabel || '<span class="button-text">Entrar</span>';
    }
  }

  function detectIdentifierType(value) {
    if (!value) return 'unknown';
    if (value.includes('@')) return 'email';
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 4) return 'cnpj';
    return 'unknown';
  }

  function formatCnpjInput() {
    if (!el.identifier) return;
    let digits = el.identifier.value.replace(/\D/g, '').slice(0, 14);
    digits = digits.replace(/^(\d{2})(\d)/, '$1.$2');
    digits = digits.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    digits = digits.replace(/\.(\d{3})(\d)/, '.$1/$2');
    digits = digits.replace(/(\d{4})(\d)/, '$1-$2');
    el.identifier.value = digits;
  }

  function validateIdentifier() {
    if (!el.identifier) return true;
    const value = el.identifier.value.trim();
    state.identifierType = detectIdentifierType(value);
    if (!value) return setFieldError(el.identifier, el.identifierError, 'Informe seu e-mail ou CNPJ.');
    if (state.identifierType === 'email') {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(value.toLowerCase())) return setFieldError(el.identifier, el.identifierError, 'Digite um e-mail válido.');
    } else if (state.identifierType === 'cnpj') {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 14) return setFieldError(el.identifier, el.identifierError, 'O CNPJ deve ter 14 dígitos.');
      if (!isValidCnpj(digits)) return setFieldError(el.identifier, el.identifierError, 'CNPJ inválido.');
    } else {
      return setFieldError(el.identifier, el.identifierError, 'Use um e-mail válido ou CNPJ completo.');
    }
    updateIdentifierIcon();
    return clearFieldError(el.identifier, el.identifierError);
  }

  function validatePassword() {
    if (!el.password) return true;
    const value = el.password.value;
    if (!value) return setFieldError(el.password, el.passwordError, 'Informe sua senha.');
    if (value.length < 8) return setFieldError(el.password, el.passwordError, 'A senha precisa ter pelo menos 8 caracteres.');
    return clearFieldError(el.password, el.passwordError);
  }

  function setFieldError(field, errorNode, message) {
    if (!field) return false;
    field.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    if (errorNode) {
      errorNode.classList.add('field-error', 'is-visible');
      errorNode.textContent = message;
      errorNode.style.display = 'block';
      errorNode.setAttribute('role', 'alert');
      field.setAttribute('aria-describedby', errorNode.id);
    }
    return false;
  }

  function clearFieldError(field, errorNode) {
    if (!field) return true;
    field.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    if (errorNode) {
      errorNode.classList.add('field-error');
      errorNode.classList.remove('is-visible');
      errorNode.textContent = '';
      errorNode.style.display = '';
      errorNode.removeAttribute('role');
      field.removeAttribute('aria-describedby');
    }
    return true;
  }

  function clearErrors() {
    clearFieldError(el.identifier, el.identifierError);
    clearFieldError(el.password, el.passwordError);
  }

  function updateIdentifierIcon() {
    if (!el.identifierIcon) return;
    el.identifierIcon.classList.add('input-icon');
    el.identifierIcon.classList.remove('ri-mail-line', 'ri-building-4-line');
    if (state.identifierType === 'email') {
      el.identifierIcon.classList.add('ri-mail-line');
    } else {
      el.identifierIcon.classList.add('ri-building-4-line');
    }
  }

  function isValidCnpj(cnpj) {
    if (!cnpj || /^(\d)\1+$/.test(cnpj) || cnpj.length !== 14) return false;
    const calculateDigit = length => {
      let sum = 0;
      let position = length - 7;
      for (let index = length; index >= 1; index--) {
        sum += Number(cnpj[length - index]) * position--;
        if (position < 2) position = 9;
      }
      return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };
    const digitOne = calculateDigit(12);
    const digitTwo = calculateDigit(13);
    return digitOne === Number(cnpj[12]) && digitTwo === Number(cnpj[13]);
  }

  function ensureCapsLockWarning() {
    if (!el.password) return;
    const existing = document.getElementById('capsLockWarning') || el.password.parentElement.querySelector('.caps-lock-warning');
    if (existing) {
      el.capsWarning = existing;
      existing.style.display = 'none';
      existing.setAttribute('aria-hidden', 'true');
      return;
    }
    const warning = document.createElement('div');
    warning.id = 'capsLockWarning';
    warning.className = 'caps-lock-warning';
    warning.textContent = 'Caps Lock ativado';
    warning.style.display = 'none';
    warning.setAttribute('aria-hidden', 'true');
    const container = el.password.closest('.input-wrapper') || el.password.parentElement || el.password;
    container.appendChild(warning);
    el.capsWarning = warning;
  }

  function updateCapsWarning(show) {
    if (!el.capsWarning) return;
    el.capsWarning.style.display = show ? 'block' : 'none';
    el.capsWarning.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function fakeAuthenticate(identifierValue, passwordValue) {
    return new Promise((resolve, reject) => {
      const normalized = identifierValue.includes('@') ? identifierValue.trim().toLowerCase() : identifierValue.replace(/\D/g, '');
      setTimeout(() => {
        const validUser = (normalized === 'empresa@teste.com' || normalized === '11222333000144') && passwordValue === 'SenhaForte123';
        if (validUser) resolve(true);
        else reject(new Error('E-mail/CNPJ ou senha incorretos.'));
      }, 1200);
    });
  }

  function animateFormError() {
    if (!el.form) return;
    el.form.classList.remove('is-shaking');
    void el.form.offsetWidth;
    el.form.classList.add('is-shaking');
    el.form.addEventListener('animationend', () => el.form.classList.remove('is-shaking'), { once: true });
  }

  function restoreRememberedSession() {
    if (!el.identifier || !el.remember) return;
    const rememberFlag = localStorage.getItem('rememberBusiness') === 'true';
    if (!rememberFlag) {
      el.remember.checked = false;
      return;
    }
    const savedIdentifier = localStorage.getItem('businessLoginIdentifier');
    if (!savedIdentifier) return;
    el.identifier.value = savedIdentifier;
    el.remember.checked = true;
    state.identifierType = detectIdentifierType(savedIdentifier);
    if (state.identifierType === 'cnpj') formatCnpjInput();
    updateIdentifierIcon();
    validateIdentifier();
  }

  function setInitialFocus() {
    if (!el.identifier) return;
    updateIdentifierIcon();
    if (window.matchMedia('(min-width: 769px)').matches) el.identifier.focus();
  }

  function setupLinkShortcuts() {
    linkShortcuts.forEach(({ selector, href }) => {
      const target = document.querySelector(selector);
      if (!target || target.dataset.enhanced) return;
      target.dataset.enhanced = 'true';
      target.addEventListener('click', event => {
        event.preventDefault();
        window.location.href = href;
      });
    });
  }

  function setupTouchEnhancements() {
    if (!('ontouchstart' in window)) return;
    const touchables = document.querySelectorAll('.login-button, .password-toggle, .checkbox-container, .forgot-password, .personal-login-link, .nav-link, .nav-toggle');
    touchables.forEach(node => {
      if (node.dataset.touchEnhanced) return;
      node.dataset.touchEnhanced = 'true';
      node.addEventListener('touchstart', () => {
        node.classList.add('is-pressed');
        if (navigator.vibrate && node.matches('.login-button, .nav-toggle')) navigator.vibrate(35);
      }, { passive: true });
      node.addEventListener('touchend', () => setTimeout(() => node.classList.remove('is-pressed'), 120));
      node.addEventListener('touchcancel', () => node.classList.remove('is-pressed'));
    });
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      if (input.dataset.viewportEnhanced) return;
      input.dataset.viewportEnhanced = 'true';
      input.addEventListener('focus', () => adjustViewport(true));
      input.addEventListener('blur', () => adjustViewport(false));
    });
  }

  function adjustViewport(isFocused) {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    const content = isFocused ? 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' : 'width=device-width, initial-scale=1.0';
    meta.setAttribute('content', content);
  }

  function setupInputAnimations() {
    const focusables = document.querySelectorAll('input, .password-toggle, .login-button');
    focusables.forEach(node => {
      if (node.dataset.focusEnhanced) return;
      node.dataset.focusEnhanced = 'true';
      node.addEventListener('focus', () => node.classList.add('is-focused'));
      node.addEventListener('blur', () => node.classList.remove('is-focused'));
    });
  }

  function initializeNavbar() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!navToggle || !navLinks || navToggle.dataset.enhancedNav) return;
    navToggle.dataset.enhancedNav = 'true';
    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      document.body.appendChild(overlay);
    }
    const setMenu = open => {
      const isActive = navLinks.classList.contains('active');
      if (open === isActive) return;
      navLinks.classList.toggle('active', open);
      overlay.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('ri-menu-line', 'ri-close-line');
        icon.classList.add(open ? 'ri-close-line' : 'ri-menu-line');
      }
      navToggle.setAttribute('aria-expanded', String(open));
    };
    navToggle.addEventListener('click', event => {
      event.preventDefault();
      setMenu(!navLinks.classList.contains('active'));
    });
    overlay.addEventListener('click', () => setMenu(false));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navLinks.classList.contains('active')) setMenu(false);
    });
    navLinks.addEventListener('click', event => {
      if (event.target.closest('.nav-link')) setTimeout(() => setMenu(false), 120);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) setMenu(false);
    });
  }

  function showToast(message, variant = 'info', duration = 3200) {
    if (!message) return null;
    document.querySelectorAll('.mobile-toast').forEach(node => node.remove());
    const toast = document.createElement('div');
    toast.className = `mobile-toast mobile-toast--${variant}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
    return toast;
  }

  function injectStyles() {
    if (styleTag) return;
    styleTag = document.createElement('style');
    styleTag.id = 'login-empresa-enhancements';
    styleTag.textContent = `
      .login-button { position: relative; overflow: hidden; }
      .login-button .button-text { display: inline-flex; align-items: center; gap: 6px; }
      .login-button.is-loading { pointer-events: none; }
      .login-button.is-loading .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: #fff; border-radius: 50%; animation: login-spin 0.9s linear infinite; margin-right: 8px; vertical-align: middle; }
      .login-button.is-success { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 12px 24px rgba(16, 185, 129, 0.35); }
      .login-button.is-error { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 12px 24px rgba(220, 38, 38, 0.25); }
      .login-button.is-error::after { content: ''; position: absolute; inset: 0; border-radius: inherit; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); animation: pulse-error 1.2s ease-out forwards; pointer-events: none; }
      .caps-lock-warning { color: #f59e0b; font-size: 13px; font-weight: 500; margin-top: 6px; }
      input.has-error { border-color: #dc2626 !important; box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15); }
      .field-error { opacity: 0; transform: translateY(-4px); transition: opacity 0.2s ease, transform 0.2s ease; display: block; min-height: 16px; }
      .field-error.is-visible { opacity: 1; transform: translateY(0); }
      .is-shaking { animation: login-shake 0.4s cubic-bezier(.36, .07, .19, .97); }
      .mobile-toast { position: fixed; left: 16px; right: 16px; bottom: 16px; padding: 16px 18px; border-radius: 14px; font-size: 14px; font-weight: 600; background: var(--brand, #2563eb); color: #fff; box-shadow: 0 18px 48px rgba(37, 99, 235, 0.28); transform: translateY(120%); opacity: 0; transition: transform 0.4s cubic-bezier(.21, .68, .33, 1.13), opacity 0.4s ease; z-index: 10001; text-align: center; }
      .mobile-toast.show { transform: translateY(0); opacity: 1; }
      .mobile-toast--success { background: linear-gradient(135deg, #10b981, #059669); }
      .mobile-toast--error { background: linear-gradient(135deg, #dc2626, #b91c1c); }
      .mobile-toast--info { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
      .is-pressed { transform: scale(0.97); transition: transform 0.12s ease; }
      input.is-focused, .password-toggle.is-focused, .login-button.is-focused { box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25); }
      .nav-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); opacity: 0; visibility: hidden; transition: opacity 0.3s ease; z-index: 999; }
      .nav-overlay.active { opacity: 1; visibility: visible; }
      @keyframes login-spin { to { transform: rotate(360deg); } }
      @keyframes pulse-error { 0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3); } 100% { box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); } }
      @keyframes login-shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
    `;
    document.head.appendChild(styleTag);
  }

  window.showMobileAlert = showToast;

  return { init };
})();

document.addEventListener('DOMContentLoaded', LoginEmpresa.init);



