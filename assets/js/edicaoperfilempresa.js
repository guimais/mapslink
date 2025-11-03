(function () {
  const FORM_SELECTOR = '[data-preview-context="empresa"]';
  const PREVIEW_ATTRIBUTE = 'preview';
  const PREVIEW_FIELD_SELECTOR = 'data-preview-field';
  const PREVIEW_PANEL_SELECTOR = '[data-edicao-preview="empresa"]';
  const FEEDBACK_ATTRIBUTE = 'edicaoFeedback';

  const FALLBACK_DISPLAY = {
    default: '--',
    'empresa-sobre': 'Descreva a missao e valores da empresa',
    'empresa-beneficios': 'Liste beneficios estrategicos',
    'empresa-email': 'Informe um e-mail de contato',
    'empresa-telefone': 'Informe um telefone valido',
    'empresa-site': 'Adicionar site institucional',
    'empresa-redes': 'Informe os canais oficiais'
  };

  const storage = {
    read(key) {
      if (!key) {
        return null;
      }
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        console.warn('Nao foi possivel ler os dados salvos.', error);
        return null;
      }
    },
    write(key, value) {
      if (!key) {
        return;
      }
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Nao foi possivel salvar os dados.', error);
      }
    },
    remove(key) {
      if (!key) {
        return;
      }
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Nao foi possivel remover os dados salvos.', error);
      }
    }
  };

  const getPreviewValue = (field) => {
    if (!field) {
      return '';
    }
    if (field.tagName === 'SELECT') {
      const selected = field.selectedOptions[0];
      return selected ? selected.textContent.trim() : field.value.trim();
    }
    return (field.value || '').trim();
  };

  const getStorageValue = (field) => {
    if (!field) {
      return '';
    }
    if (field.tagName === 'SELECT') {
      return field.value;
    }
    return (field.value || '').trim();
  };

  const setFieldValue = (field, value) => {
    if (field.tagName === 'SELECT') {
      field.value = value;
    } else {
      field.value = value;
    }
  };

  const showFeedback = (form, message) => {
    const feedback = form.querySelector(`[data-${FEEDBACK_ATTRIBUTE}]`);
    if (!feedback) {
      return;
    }
    feedback.textContent = message;
    feedback.classList.add('is-visible');
    window.setTimeout(() => feedback.classList.remove('is-visible'), 3200);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector(FORM_SELECTOR);
    const preview = document.querySelector(PREVIEW_PANEL_SELECTOR);

    if (!form || !preview) {
      return;
    }

    const storageKey = form.dataset.storageKey;
    const fields = Array.from(form.querySelectorAll(`[data-${PREVIEW_ATTRIBUTE}]`));

    const updatePreview = () => {
      fields.forEach(field => {
        const key = field.dataset[PREVIEW_ATTRIBUTE];
        if (!key) {
          return;
        }
        const target = preview.querySelector(`[${PREVIEW_FIELD_SELECTOR}="${key}"]`);
        if (!target) {
          return;
        }
        const rawValue = getPreviewValue(field);
        const display = rawValue || FALLBACK_DISPLAY[key] || FALLBACK_DISPLAY.default;
        target.textContent = display;
        target.classList.toggle('is-placeholder', !rawValue);
      });
    };

    if (storageKey) {
      const stored = storage.read(storageKey);
      if (stored) {
        fields.forEach(field => {
          const key = field.dataset[PREVIEW_ATTRIBUTE];
          if (!key || !(key in stored)) {
            return;
          }
          setFieldValue(field, stored[key]);
        });
      }
    }

    updatePreview();

    const persist = () => {
      if (!storageKey) {
        return;
      }
      const payload = {};
      fields.forEach(field => {
        const key = field.dataset[PREVIEW_ATTRIBUTE];
        if (!key) {
          return;
        }
        payload[key] = getStorageValue(field);
      });
      storage.write(storageKey, payload);
    };

    form.addEventListener('input', updatePreview);
    form.addEventListener('change', updatePreview);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      persist();
      showFeedback(form, 'Alteracoes salvas com sucesso!');
    });

    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        fields.forEach(field => {
          if (field.tagName === 'SELECT') {
            field.value = '';
          } else {
            field.value = '';
          }
        });
        if (storageKey) {
          storage.remove(storageKey);
        }
        updatePreview();
        showFeedback(form, 'Valores redefinidos.');
      }, 0);
    });
  });
})();
