(function () {
  const FORM_SELECTOR = '[data-edicao-form]';
  const PREVIEW_ATTRIBUTE = 'preview';
  const PREVIEW_FIELD_SELECTOR = 'data-preview-field';
  const PREVIEW_PANEL_SELECTOR = '[data-edicao-preview]';
  const FEEDBACK_ATTRIBUTE = 'edicaoFeedback';

  const FALLBACK_DISPLAY = {
    default: '--',
    'usuario-bio': 'Adicione um breve resumo',
    'usuario-competencias': 'Inclua competencias principais',
    'usuario-email': 'Informe um e-mail',
    'usuario-telefone': 'Informe um telefone',
    'usuario-disponibilidade': 'Atualize sua disponibilidade'
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
    const forms = Array.from(document.querySelectorAll(FORM_SELECTOR));
    const previewPanels = Array.from(document.querySelectorAll(PREVIEW_PANEL_SELECTOR));

    if (!forms.length) {
      return;
    }

    const updatePreview = (mode) => {
      const form = forms.find(item => item.dataset.edicaoForm === mode);
      const panel = previewPanels.find(item => item.dataset.edicaoPreview === mode);
      if (!form || !panel) {
        return;
      }

      const fields = form.querySelectorAll(`[data-${PREVIEW_ATTRIBUTE}]`);
      fields.forEach(field => {
        const key = field.dataset[PREVIEW_ATTRIBUTE];
        if (!key) {
          return;
        }
        const target = panel.querySelector(`[${PREVIEW_FIELD_SELECTOR}="${key}"]`);
        if (!target) {
          return;
        }

        const rawValue = getPreviewValue(field);
        const display = rawValue || FALLBACK_DISPLAY[key] || FALLBACK_DISPLAY.default;
        target.textContent = display;
        target.classList.toggle('is-placeholder', !rawValue);
      });
    };

    forms.forEach(form => {
      const mode = form.dataset.edicaoForm;
      const storageKey = form.dataset.storageKey;
      const hasPreview = previewPanels.some(panel => panel.dataset.edicaoPreview === mode);
      const fields = Array.from(form.querySelectorAll(`[data-${PREVIEW_ATTRIBUTE}]`));

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

      if (hasPreview) {
        updatePreview(mode);
      }

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

      form.addEventListener('input', () => {
        if (hasPreview) {
          updatePreview(mode);
        }
      });

      form.addEventListener('change', () => {
        if (hasPreview) {
          updatePreview(mode);
        }
      });

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
          if (hasPreview) {
            updatePreview(mode);
          }
          showFeedback(form, 'Valores redefinidos.');
        }, 0);
      });
    });
  });
})();
