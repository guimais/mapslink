const token = localStorage.getItem("jwt_token");
if (!token) {
  window.location.href = "loginempresa.html"; 
}
(function () {
  const FIELD_SELECTOR = "[data-field]";
  const STORAGE_FALLBACK = "mapslink:perfil:empresa";
  const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const FALLBACK = {
    default: "--",
    company: "Informe o nome da empresa",
    caption: "Descreva o posicionamento da empresa",
    tags: "Adicione as areas de atuacao",
    sector: "Informe o setor principal",
    headquarters: "Informe a sede",
    model: "Defina o modelo de trabalho",
    instagram: "Informe o usuario do Instagram",
    linkedin: "Informe o perfil do LinkedIn",
    email: "Adicione um email de contato",
    phone: "Adicione um telefone",
    address: "Informe o endereco principal",
    site: "Adicione o site institucional",
    bio: "Fale mais sobre a empresa",
    benefits: "Liste os beneficios oferecidos",
    agenda: "--",
    curriculos: "--"
  };

  const state = {
    avatar: "",
    owner: null,
    baseStorage: STORAGE_FALLBACK,
    feedbackTimer: null
  };

  const own = Object.prototype.hasOwnProperty;

  function setByPath(target, path, value) {
    if (!target || !path) return;
    const parts = path.split(".");
    let cursor = target;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const key = parts[index];
      if (typeof cursor[key] !== "object" || cursor[key] === null) {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
    cursor[parts[parts.length - 1]] = value;
  }

  function getByPath(source, path) {
    if (!source || !path) return undefined;
    return path.split(".").reduce((cursor, key) => {
      if (cursor && Object.prototype.hasOwnProperty.call(cursor, key)) {
        return cursor[key];
      }
      return undefined;
    }, source);
  }

  function parseInputValue(input) {
    if (!input) return "";
    const raw = (input.value || "").trim();
    const format = input.dataset.format;
    if (format === "csv") {
      if (!raw) return [];
      return raw.split(",").map(item => item.trim()).filter(Boolean);
    }
    if (format === "lines") {
      if (!raw) return [];
      return raw.split(/\r?\n+/).map(item => item.trim()).filter(Boolean);
    }
    if (input.dataset.type === "number") {
      if (!raw.length) return null;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    }
    return raw;
  }

  function previewText(input, value) {
    if (Array.isArray(value)) {
      if (!value.length) return "";
      return input.dataset.format === "lines" ? value.join("\n") : value.join(", ");
    }
    if (typeof value === "number") {
      return Number.isFinite(value) ? String(value) : "";
    }
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function applyAvatar(node, src) {
    if (!node) return;
    const value = src || "";
    node.src = value || EMPTY_IMAGE;
    node.classList.toggle("is-empty", !value);
  }

  function showFeedback(node, message, isError) {
    if (!node) return;
    const textTarget = node.querySelector("[data-edicao-feedback-text]");
    if (textTarget) textTarget.textContent = message || "";
    else node.textContent = message;
    node.classList.toggle("is-error", !!isError);
    node.classList.add("is-visible");
    window.clearTimeout(state.feedbackTimer);
    state.feedbackTimer = window.setTimeout(() => {
      node.classList.remove("is-visible");
    }, 3200);
  }

  function draftKey(base, owner) {
    return owner ? `${base}:${owner}` : base;
  }

  function storageKey() {
    return draftKey(state.baseStorage, state.owner);
  }

  function loadDraft() {
    if (!state.baseStorage) return null;
    const keys = [];
    const ownerKey = storageKey();
    if (ownerKey) keys.push(ownerKey);
    if (!keys.includes(state.baseStorage)) keys.push(state.baseStorage);
    for (const key of keys) {
      if (!key) continue;
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const stored = JSON.parse(raw);
        if (!stored || typeof stored !== "object") continue;
        if (stored.owner && state.owner && stored.owner !== state.owner) continue;
        return stored.payload || null;
      } catch (error) {
        console.warn("MapsEdit: unable to read draft.", error);
      }
    }
    return null;
  }

  function saveDraft(payload) {
    const key = storageKey();
    if (!key) return;
    try {
      window.localStorage.setItem(key, JSON.stringify({ owner: state.owner, payload }));
    } catch (error) {
      console.warn("MapsEdit: unable to save draft.", error);
    }
  }

  function clearDraft() {
    const keys = new Set();
    const ownerKey = storageKey();
    if (ownerKey) keys.add(ownerKey);
    if (state.baseStorage) keys.add(state.baseStorage);
    keys.forEach(key => {
      if (!key) return;
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn("MapsEdit: unable to clear draft.", error);
      }
    });
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => reject(reader.error || new Error("Falha ao ler o arquivo."));
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#edicao-form-empresa");
    if (!form) return;

    const preview = document.querySelector('[data-edicao-preview="empresa"]');
    const feedback = form.querySelector("[data-edicao-feedback]");
    const avatarPreview = form.querySelector("[data-avatar-preview]");
    const avatarInput = form.querySelector("[data-avatar-input]");
    const avatarTrigger = form.querySelector("[data-avatar-trigger]");
    const avatarRemove = form.querySelector("[data-avatar-remove]");
    const inputs = Array.from(form.querySelectorAll(FIELD_SELECTOR));

    state.baseStorage = form.dataset.storageKey || STORAGE_FALLBACK;

    function updatePreview() {
      if (!preview) return;
      inputs.forEach(input => {
        const key = input.dataset.preview;
        if (!key) return;
        const target = preview.querySelector(`[data-preview-field="${key}"]`);
        if (!target) return;
        const value = parseInputValue(input);
        const text = previewText(input, value);
        const fallback = target.dataset.placeholder || FALLBACK[key] || FALLBACK.default;
        target.textContent = text || fallback;
        target.classList.toggle("is-placeholder", !text);
      });
    }

    function fillForm(data) {
      state.avatar = (data && data.profile && data.profile.avatar) || "";
      applyAvatar(avatarPreview, state.avatar);
      inputs.forEach(input => {
        const path = input.dataset.field;
        if (!path) return;
        const value = getByPath(data, path);
        if (Array.isArray(value)) {
          input.value = input.dataset.format === "lines" ? value.join("\n") : value.join(", ");
        } else if (value === null || value === undefined) {
          input.value = "";
        } else if (input.dataset.type === "number") {
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
        const value = parseInputValue(input);
        let finalValue;
        if (Array.isArray(value)) finalValue = value;
        else if (value === null) finalValue = null;
        else finalValue = value === undefined ? "" : value;
        setByPath(payload, path, finalValue);
        const extra = (input.dataset.sync || "")
          .split(",")
          .map(item => item.trim())
          .filter(Boolean);
        extra.forEach(target => setByPath(payload, target, finalValue));
      });
      if (!payload.profile) payload.profile = {};
      payload.profile.avatar = state.avatar || "";
      return payload;
    }

    function applySession(session, options) {
      const preferDraft = !(options && options.useSessionDirectly);
      state.owner = session && session.id ? session.id : null;
      const draft = preferDraft ? loadDraft() : null;
      if (draft) {
        fillForm(draft);
      } else if (session) {
        fillForm(session);
      } else {
        fillForm({});
      }
    }

    const draftBeforeSession = loadDraft();
    if (draftBeforeSession) {
      fillForm(draftBeforeSession);
    } else {
      updatePreview();
    }

    form.addEventListener("input", event => {
      if (event.target && event.target.matches(FIELD_SELECTOR)) updatePreview();
    });

    form.addEventListener("change", event => {
      if (event.target && event.target.matches(FIELD_SELECTOR)) updatePreview();
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const payload = collectPayload();
      const auth = window.MapsAuth;
      let message = "Alteracoes salvas.";
      let isError = false;

      if (auth && typeof auth.updateProfile === "function") {
        try {
          const request = { profile: payload.profile };
          if (own.call(payload, "company")) request.company = payload.company || "";
          if (own.call(payload, "name")) request.name = payload.name || "";
          if (own.call(payload, "phone")) request.phone = payload.phone || "";
          const result = await auth.updateProfile(request);
          applySession(result || (auth.current ? auth.current() : null), { useSessionDirectly: true });
          message = "Alteracoes salvas e sincronizadas.";
        } catch (error) {
          console.error(error);
          const code = (error && error.message) || "";
          if (code && !/NO_SESSION/i.test(code)) {
            message = "Nao foi possivel salvar. Tente novamente.";
            isError = true;
          } else {
            message = "Alteracoes salvas localmente. Entre novamente para sincronizar.";
          }
        }
      }

      saveDraft(payload);
      showFeedback(feedback, message, isError);
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        inputs.forEach(input => {
          input.value = "";
        });
        state.avatar = "";
        if (avatarInput) avatarInput.value = "";
        applyAvatar(avatarPreview, "");
        clearDraft();
        updatePreview();
        showFeedback(feedback, "Campos redefinidos.", false);
      }, 0);
    });

    if (avatarTrigger && avatarInput) {
      avatarTrigger.addEventListener("click", () => avatarInput.click());
    }

    if (avatarInput && avatarPreview) {
      avatarInput.addEventListener("change", async () => {
        const file = avatarInput.files && avatarInput.files[0];
        if (!file) return;
        try {
          state.avatar = await readFile(file);
          applyAvatar(avatarPreview, state.avatar);
          updatePreview();
        } catch (error) {
          console.error(error);
          showFeedback(feedback, "Nao foi possivel carregar a foto.", true);
        }
      });
    }

    if (avatarRemove && avatarPreview && avatarInput) {
      avatarRemove.addEventListener("click", () => {
        state.avatar = "";
        avatarInput.value = "";
        applyAvatar(avatarPreview, "");
        updatePreview();
      });
    }

    const auth = window.MapsAuth;
    if (auth && typeof auth.ready === "function") {
      auth.ready().then(() => applySession(auth.current && auth.current()));
      if (typeof auth.onSession === "function") auth.onSession(applySession);
    } else {
      updatePreview();
    }
  });
})();
