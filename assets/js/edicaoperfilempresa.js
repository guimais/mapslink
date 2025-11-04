(function () {
  const SELECTORS = {
    form: '#edicao-form-empresa',
    preview: '[data-edicao-preview="empresa"]',
    feedback: '[data-edicao-feedback]',
    avatarPreview: '[data-avatar-preview]',
    avatarInput: '[data-avatar-input]',
    avatarTrigger: '[data-avatar-trigger]',
    avatarRemove: '[data-avatar-remove]'
  };
  const FIELD_SELECTOR = '[data-field]';
  const STORAGE_FALLBACK = 'mapslink:perfil:empresa';
  const EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const FALLBACK = {
    default: '--',
    company: 'Informe o nome da empresa',
    caption: 'Adicione uma frase de impacto sobre a empresa',
    tags: 'Inclua as principais áreas de atuação',
    sector: 'Informe o setor principal',
    headquarters: 'Informe a sede',
    model: 'Defina o modelo de trabalho',
    instagram: 'Adicione o @ oficial',
    linkedin: 'Informe o LinkedIn corporativo',
    email: 'Informe um e-mail de contato',
    phone: 'Informe um telefone',
    address: 'Adicione o endereço principal',
    site: 'Adicione o site institucional',
    bio: 'Descreva a atuação da empresa',
    benefits: 'Liste os benefícios oferecidos',
    agenda: '--',
    curriculos: '--'
  };

  const state = {
    avatar: '',
    owner: null,
    storageKey: null,
    feedbackTimer: null
  };

  const own = Object.prototype.hasOwnProperty;

  function setByPath(target, path, value) {
    if (!path) return;
    const parts = path.split('.');
    let cursor = target;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const key = parts[index];
      if (typeof cursor[key] !== 'object' || cursor[key] === null) {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
    cursor[parts[parts.length - 1]] = value;
  }

  function getByPath(source, path) {
    if (!source || !path) return undefined;
    return path.split('.').reduce((cursor, key) => (cursor && key in cursor ? cursor[key] : undefined), source);
  }

  function getInputValue(input) {
    if (!input) return '';
    const raw = (input.value || '').trim();
    const format = input.dataset.format;
    if (format === 'csv') {
      if (!raw) return [];
      return raw.split(',').map(item => item.trim()).filter(Boolean);
    }
    if (format === 'lines') {
      if (!raw) return [];
      return raw.split(/\r?\n+/).map(item => item.trim()).filter(Boolean);
    }
    if (input.dataset.type === 'number') {
      if (!raw.length) return null;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    }
    return raw;
  }

  function getPreviewText(input, value) {
    if (Array.isArray(value)) {
      if (!value.length) return '';
      return input.dataset.format === 'lines' ? value.join('\n') : value.join(', ');
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? String(value) : '';
    }
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  }

  function applyAvatar(node, src) {
    if (!node) return;
    const value = src || '';
    node.src = value || EMPTY_IMAGE;
    node.classList.toggle('is-empty', !value);
  }

  function showFeedback(node, message, isError) {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('is-error', !!isError);
    node.classList.add('is-visible');
    clearTimeout(state.feedbackTimer);
    state.feedbackTimer = window.setTimeout(() => node.classList.remove('is-visible'), 3200);
  }

  function draftKey(base, owner) {
    return owner ? `${base}:${owner}` : base;
  }

  function loadDraft() {
    if (!state.storageKey) return null;
    try {
      const raw = localStorage.getItem(state.storageKey);
      if (!raw) return null;
      const stored = JSON.parse(raw);
      if (stored.owner && !state.owner) return null;
      if (stored.owner && state.owner && stored.owner !== state.owner) return null;
      return stored.payload || null;
    } catch (error) {
      console.warn('Não foi possível ler os dados salvos.', error);
      return null;
    }
  }

  function saveDraft(payload) {
    if (!state.storageKey) return;
    try {
      localStorage.setItem(state.storageKey, JSON.stringify({ owner: state.owner, payload }));
    } catch (error) {
      console.warn('Não foi possível salvar os dados.', error);
    }
  }

  function clearDraft() {
    if (!state.storageKey) return;
    try {
      localStorage.removeItem(state.storageKey);
    } catch (error) {
      console.warn('Não foi possível remover os dados salvos.', error);
    }
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || '');
      reader.onerror = () => reject(reader.error || new Error('Falha ao ler o arquivo.'));
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector(SELECTORS.form);
    if (!form) return;

    const preview = document.querySelector(SELECTORS.preview);
    const feedback = form.querySelector(SELECTORS.feedback);
    const avatarPreview = form.querySelector(SELECTORS.avatarPreview);
    const avatarInput = form.querySelector(SELECTORS.avatarInput);
    const avatarTrigger = form.querySelector(SELECTORS.avatarTrigger);
    const avatarRemove = form.querySelector(SELECTORS.avatarRemove);
    const inputs = Array.from(form.querySelectorAll(FIELD_SELECTOR));

    const baseStorage = form.dataset.storageKey || STORAGE_FALLBACK;
    state.storageKey = baseStorage;

    function updatePreview() {
      if (!preview) return;
      inputs.forEach(input => {
        const key = input.dataset.preview;
        if (!key) return;
        const target = preview.querySelector(`[data-preview-field="${key}"]`);
        if (!target) return;
        const value = getInputValue(input);
        const text = getPreviewText(input, value);
        const fallback = FALLBACK[key] || FALLBACK.default;
        target.textContent = text || fallback;
        target.classList.toggle('is-placeholder', !text);
      });
    }

    function fillForm(data) {
      state.avatar = (data && data.profile && data.profile.avatar) || '';
      applyAvatar(avatarPreview, state.avatar);
      inputs.forEach(input => {
        const path = input.dataset.field;
        if (!path) return;
        const value = getByPath(data, path);
        if (Array.isArray(value)) {
          input.value = input.dataset.format === 'lines' ? value.join('\n') : value.join(', ');
        } else if (value === null || value === undefined) {
          input.value = '';
        } else if (input.dataset.type === 'number') {
          input.value = String(value);
        } else {
          input.value = String(value);
        }
      });
      updatePreview();
    }

    function collectPayload() {
      const payload = { profile: { contact: {} } };
      inputs.forEach(input => {
        const path = input.dataset.field;
        if (!path) return;
        const value = getInputValue(input);
        let final;
        if (Array.isArray(value)) final = value;
        else if (value === null) final = null;
        else final = value === undefined ? '' : value;
        setByPath(payload, path, final);
        const extras = (input.dataset.sync || '').split(',').map(item => item.trim()).filter(Boolean);
        extras.forEach(extra => setByPath(payload, extra, final));
      });
      if (!payload.profile) payload.profile = {};
      payload.profile.avatar = state.avatar || '';
      return payload;
    }

    function applySession(session) {
      state.owner = session && session.id ? session.id : null;
      state.storageKey = draftKey(baseStorage, state.owner);
      const draft = loadDraft();
      if (draft) {
        fillForm(draft);
      } else {
        fillForm(session || {});
      }
    }

    fillForm(loadDraft() || {});

    form.addEventListener('input', event => {
      if (event.target && event.target.matches(FIELD_SELECTOR)) updatePreview();
    });
    form.addEventListener('change', event => {
      if (event.target && event.target.matches(FIELD_SELECTOR)) updatePreview();
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const payload = collectPayload();
      const auth = window.MapsAuth;
      try {
        if (auth && typeof auth.updateProfile === 'function') {
          const request = { profile: payload.profile };
          if (own.call(payload, 'company')) request.company = payload.company || '';
          if (own.call(payload, 'name')) request.name = payload.name || '';
          if (own.call(payload, 'phone')) request.phone = payload.phone || '';
          const result = await auth.updateProfile(request);
          applySession(result || auth.current?.());
        }
        saveDraft(payload);
        showFeedback(feedback, 'Alterações salvas!', false);
      } catch (error) {
        showFeedback(feedback, 'Não foi possível salvar. Tente novamente.', true);
        console.error(error);
      }
    });

    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        inputs.forEach(input => {
          input.value = '';
        });
        state.avatar = '';
        if (avatarInput) avatarInput.value = '';
        applyAvatar(avatarPreview, '');
        clearDraft();
        updatePreview();
        showFeedback(feedback, 'Valores redefinidos.', false);
      }, 0);
    });

    if (avatarTrigger && avatarInput) {
      avatarTrigger.addEventListener('click', () => avatarInput.click());
    }

    if (avatarInput && avatarPreview) {
      avatarInput.addEventListener('change', async () => {
        const file = avatarInput.files && avatarInput.files[0];
        if (!file) return;
        try {
          state.avatar = await readFile(file);
          applyAvatar(avatarPreview, state.avatar);
          updatePreview();
        } catch (error) {
          showFeedback(feedback, 'Não foi possível carregar a foto.', true);
          console.error(error);
        }
      });
    }

    if (avatarRemove && avatarPreview && avatarInput) {
      avatarRemove.addEventListener('click', () => {
        state.avatar = '';
        avatarInput.value = '';
        applyAvatar(avatarPreview, '');
        updatePreview();
      });
    }

    const auth = window.MapsAuth;
    if (auth && typeof auth.ready === 'function') {
      auth.ready().then(() => applySession(auth.current()));
      if (typeof auth.onSession === 'function') auth.onSession(applySession);
    } else {
      updatePreview();
    }
  });
})();

