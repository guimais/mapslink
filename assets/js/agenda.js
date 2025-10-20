(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);

  const STORAGE_KEYS = {
    activeDay: "agendaActiveDay",
    data: "agendaCustomData"
  };

  const COLOR_CLASSES = ["azul", "verde", "amarelo", "roxo", "laranja"];

  const ICON_OPTIONS = [
    { value: "ri-flag-line", label: "Kick-off" },
    { value: "ri-user-heart-line", label: "Conversa 1:1" },
    { value: "ri-map-pin-line", label: "Planejamento" },
    { value: "ri-team-line", label: "Time" },
    { value: "ri-lightbulb-line", label: "Ideias" },
    { value: "ri-bar-chart-2-line", label: "Metricas" },
    { value: "ri-user-search-line", label: "Entrevista" },
    { value: "ri-flask-line", label: "Experimentos" },
    { value: "ri-focus-2-line", label: "Checkpoint" },
    { value: "ri-run-line", label: "Bem-estar" },
    { value: "ri-todo-line", label: "Backlog" },
    { value: "ri-restaurant-2-line", label: "Almoco" },
    { value: "ri-user-smile-line", label: "Teste com usuario" },
    { value: "ri-mic-line", label: "Comunicacao" },
    { value: "ri-graduation-cap-line", label: "Estudo" },
    { value: "ri-book-open-line", label: "Leitura" },
    { value: "ri-presentation-line", label: "Apresentacao" },
    { value: "ri-handshake-line", label: "Parceria" },
    { value: "ri-leaf-line", label: "Saude" },
    { value: "ri-loop-left-line", label: "Retrospectiva" },
    { value: "ri-bank-line", label: "Investidor" },
    { value: "ri-slideshow-line", label: "Demonstracao" },
    { value: "ri-cup-line", label: "Celebracao" },
    { value: "ri-movie-2-line", label: "Lazer" },
    { value: "ri-calendar-event-line", label: "Outro" }
  ];

  const DEFAULT_AGENDA = [
    {
      id: "seg",
      label: "Seg",
      dayNumber: "1",
      summary: "Segunda de planejamento e alinhamentos.",
      events: [
        { time: "09:00", title: "Kick-off da sprint", description: "Alinhamento com todas as squads sobre metas da semana.", icon: "ri-flag-line", color: "azul" },
        { time: "11:00", title: "1:1 com Ana Martins", description: "Feedback quinzenal e plano de desenvolvimento.", icon: "ri-user-heart-line", color: "verde" },
        { time: "14:00", title: "Revisao do roadmap Q4", description: "Ajustar milestones nos proximos lancamentos MapsLink.", icon: "ri-map-pin-line", color: "amarelo" },
        { time: "16:30", title: "Sync produto + marketing", description: "Definir plano de comunicacao para novas rotas.", icon: "ri-team-line", color: "roxo" },
        { time: "18:30", title: "Mentoria de lideranca", description: "Sessao online com mentora convidada.", icon: "ri-lightbulb-line", color: "laranja" }
      ]
    },
    {
      id: "ter",
      label: "Ter",
      dayNumber: "2",
      summary: "Terca dedicada a entrevistas e experimentos.",
      events: [
        { time: "08:30", title: "Painel de metricas", description: "Analisar resultados da semana anterior.", icon: "ri-bar-chart-2-line", color: "verde" },
        { time: "10:30", title: "Entrevista Maps - Produto", description: "Candidato PM Senior.", icon: "ri-user-search-line", color: "azul" },
        { time: "13:30", title: "Workshop de experimentos UX", description: "Construir backlog de testes para app mobile.", icon: "ri-flask-line", color: "amarelo" },
        { time: "15:30", title: "Checkpoint Projeto Atlas", description: "Revisar riscos e mitigacoes do trimestre.", icon: "ri-focus-2-line", color: "roxo" },
        { time: "17:30", title: "Treino funcional", description: "Rotina de 45 minutos para alongar e recarregar.", icon: "ri-run-line", color: "laranja" }
      ]
    },
    {
      id: "qua",
      label: "Qua",
      dayNumber: "3",
      summary: "Quarta focada em aprendizado e comunidade.",
      events: [
        { time: "09:00", title: "Revisao do backlog", description: "Priorizacao com time de produto.", icon: "ri-todo-line", color: "azul" },
        { time: "11:30", title: "Almoco com a equipe", description: "Celebrar conquistas da sprint.", icon: "ri-restaurant-2-line", color: "verde" },
        { time: "14:30", title: "Testes de usabilidade", description: "Sessao com usuarios beta do novo dashboard.", icon: "ri-user-smile-line", color: "amarelo" },
        { time: "16:00", title: "Atualizacao comunidade", description: "Live mensal com parceiros estrategicos.", icon: "ri-mic-line", color: "roxo" },
        { time: "19:00", title: "Curso de dataviz", description: "Storytelling com dados - modulo 3.", icon: "ri-graduation-cap-line", color: "laranja" }
      ]
    },
    {
      id: "qui",
      label: "Qui",
      dayNumber: "4",
      summary: "Quinta de entregas e novas parcerias.",
      events: [
        { time: "08:00", title: "Clube do livro Maps", description: "Debate sobre inovacao centrada no cliente.", icon: "ri-book-open-line", color: "verde" },
        { time: "10:00", title: "Sprint review squads A e B", description: "Apresentacao das principais evolucoes.", icon: "ri-presentation-line", color: "azul" },
        { time: "13:00", title: "Planejamento financeiro", description: "Revisar previsoes e oportunidades.", icon: "ri-money-dollar-circle-line", color: "amarelo" },
        { time: "15:00", title: "Reuniao com parceiros", description: "Negociar integracoes e roadmap conjunto.", icon: "ri-handshake-line", color: "roxo" },
        { time: "18:00", title: "Aula de yoga", description: "Sessao relaxante ao final do dia.", icon: "ri-leaf-line", color: "laranja" }
      ]
    },
    {
      id: "sex",
      label: "Sex",
      dayNumber: "5",
      summary: "Sexta de fechamento e celebracao.",
      events: [
        { time: "09:30", title: "Retrospectiva da sprint", description: "Revisar aprendizados e melhorias.", icon: "ri-loop-left-line", color: "azul" },
        { time: "11:00", title: "Reuniao com investidor", description: "Atualizar pipeline de novos clientes.", icon: "ri-bank-line", color: "verde" },
        { time: "14:00", title: "Demo publica MapsLink", description: "Apresentar novidades a clientes e parceiros.", icon: "ri-slideshow-line", color: "amarelo" },
        { time: "16:30", title: "Happy hour da equipe", description: "Confraternizacao do time.", icon: "ri-cup-line", color: "roxo" },
        { time: "20:00", title: "Cinema em familia", description: "Sessao relax com pipoca.", icon: "ri-movie-2-line", color: "laranja" }
      ]
    }
  ];

  let agendaData = [];
  let activeDayIndex = 0;
  let weekContainer;
  let timelineContainer;
  let summaryElement;
  let addButton;
  let resetButton;

  function init() {
    weekContainer = $(".agenda-week");
    timelineContainer = document.querySelector(".agenda-timeline");
    summaryElement = $('[data-role="day-summary"]');
    addButton = $(".agenda-action--add");
    resetButton = $(".agenda-action--reset");

    if (!weekContainer || !timelineContainer) return;

    agendaData = loadAgendaData();
    activeDayIndex = getInitialDay();

    renderWeek();
    renderSummary();
    renderTimeline();

    bindWeek();
    bindTimeline();

    addButton?.addEventListener("click", () => openEditor(activeDayIndex, null));
    resetButton?.addEventListener("click", handleReset);

    window.addEventListener("resize", debounce(renderTimeline, 120));
  }

  function loadAgendaData() {
    const fallback = deepClone(DEFAULT_AGENDA);
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.data);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;
      return fallback.map((day, i) => mergeDay(day, parsed[i]));
    } catch {
      return fallback;
    }
  }

  function mergeDay(baseDay, candidate) {
    if (!candidate || typeof candidate !== "object") return deepClone(baseDay);
    const merged = {
      id: typeof candidate.id === "string" ? candidate.id : baseDay.id,
      label: typeof candidate.label === "string" ? candidate.label : baseDay.label,
      dayNumber: typeof candidate.dayNumber === "string" ? candidate.dayNumber : baseDay.dayNumber,
      summary: typeof candidate.summary === "string" ? candidate.summary : baseDay.summary,
      events: []
    };
    const customEvents = Array.isArray(candidate.events) ? candidate.events : [];
    const baseEvents = Array.isArray(baseDay.events) ? baseDay.events : [];
    const length = Math.max(customEvents.length, baseEvents.length);
    for (let i = 0; i < length; i += 1) {
      const source = customEvents[i] || null;
      const fallback = baseEvents[i] || baseEvents[0] || {};
      merged.events.push(normalizeEvent(source, fallback));
    }
    if (merged.events.length === 0) {
      merged.events = baseEvents.map(evt => normalizeEvent(evt));
    }
    sortDayEvents(merged);
    return merged;
  }

  function normalizeEvent(event, fallback = {}) {
    const safe = value => (typeof value === "string" ? value : "");
    const time = sanitizeTime(safe(event?.time) || safe(fallback.time) || "09:00");
    const title = safe(event?.title) || safe(fallback.title) || "Compromisso";
    const description = safe(event?.description) || safe(fallback.description) || "";
    const icon = safe(event?.icon) || safe(fallback.icon) || ICON_OPTIONS[0].value;
    const rawColor = safe(event?.color) || safe(fallback.color);
    const color = COLOR_CLASSES.includes(rawColor) ? rawColor : COLOR_CLASSES[0];
    return { time, title, description, icon, color };
  }

  function sanitizeTime(value) {
    if (typeof value !== "string") return "00:00";
    const clean = value.trim().slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(clean)) return clean;
    const match = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const h = Math.max(0, Math.min(23, Number(match[1])));
      const m = Math.max(0, Math.min(59, Number(match[2])));
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return "00:00";
  }

  function deepClone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function sortDayEvents(day) {
    if (!day || !Array.isArray(day.events)) return;
    day.events.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }

  function getInitialDay() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.activeDay);
      const idx = Number(raw);
      if (!Number.isNaN(idx) && idx >= 0 && idx < agendaData.length) return idx;
    } catch {}
    return 0;
  }

  function renderWeek() {
    weekContainer.innerHTML = "";
    agendaData.forEach((day, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "agenda-day" + (index === activeDayIndex ? " active-day" : "");
      button.dataset.index = String(index);
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === activeDayIndex ? "true" : "false");
      button.setAttribute("tabindex", index === activeDayIndex ? "0" : "-1");

      const dow = document.createElement("span");
      dow.className = "agenda-day__dow";
      dow.textContent = day.label;

      const date = document.createElement("span");
      date.className = "agenda-day__date";
      date.textContent = day.dayNumber;

      button.append(dow, date);
      weekContainer.appendChild(button);
    });
  }

  function renderSummary() {
    if (!summaryElement) return;
    const day = agendaData[activeDayIndex];
    if (!day) {
      summaryElement.hidden = true;
      return;
    }
    summaryElement.hidden = false;
    summaryElement.innerHTML = "";
    const highlight = document.createElement("strong");
    highlight.textContent = `${day.label} ${day.dayNumber}`;
    summaryElement.append(highlight, document.createTextNode(` - ${day.summary}`));
  }

  function renderTimeline() {
    timelineContainer.innerHTML = "";
    const day = agendaData[activeDayIndex];
    if (!day) return;
    if (!day.events.length) {
      const empty = document.createElement("div");
      empty.className = "agenda-empty";
      empty.innerHTML = `<i class="ri-calendar-2-line" aria-hidden="true"></i><span>Nenhum compromisso por aqui. Clique em "Novo compromisso" para adicionar.</span>`;
      timelineContainer.appendChild(empty);
      return;
    }
    sortDayEvents(day);
    day.events.forEach((event, index) => {
      const hour = document.createElement("div");
      hour.className = "agenda-hour";
      hour.textContent = event.time;

      const card = document.createElement("div");
      card.className = `agenda-event ${event.color}`;
      card.dataset.dayIndex = String(activeDayIndex);
      card.dataset.eventIndex = String(index);
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-expanded", "false");

      const icon = document.createElement("i");
      icon.className = event.icon || ICON_OPTIONS[0].value;
      const label = document.createElement("span");
      label.textContent = event.title;
      card.append(icon, label);

      timelineContainer.append(hour, card);
    });
  }

  function bindWeek() {
    weekContainer.addEventListener("click", event => {
      const button = event.target.closest(".agenda-day");
      if (!button) return;
      const index = Number(button.dataset.index);
      if (Number.isNaN(index)) return;
      setActiveDay(index, true);
    });

    weekContainer.addEventListener("keydown", event => {
      const button = event.target.closest(".agenda-day");
      if (!button) return;
      const index = Number(button.dataset.index);
      if (Number.isNaN(index)) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveDay(index, true);
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setActiveDay(index + 1, true);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveDay(index - 1, true);
      }
    });

    let touchStartX = null;
    weekContainer.addEventListener("touchstart", e => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    weekContainer.addEventListener("touchend", e => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx < -40) setActiveDay(activeDayIndex + 1, true);
      if (dx > 40) setActiveDay(activeDayIndex - 1, true);
      touchStartX = null;
    });
  }

  function setActiveDay(index, focus) {
    const next = Math.max(0, Math.min(agendaData.length - 1, index));
    if (activeDayIndex === next) {
      renderTimeline();
      renderSummary();
      return;
    }
    activeDayIndex = next;
    try { localStorage.setItem(STORAGE_KEYS.activeDay, String(next)); } catch {}
    renderWeek();
    renderSummary();
    renderTimeline();
    if (focus) {
      const active = weekContainer.querySelector(".agenda-day.active-day");
      active?.focus();
    }
  }

  function bindTimeline() {
    timelineContainer.addEventListener("click", event => {
      const action = event.target.closest(".event-act");
      if (action) {
        handleEventAction(action);
        return;
      }
      const card = event.target.closest(".agenda-event");
      if (!card) return;
      toggleEvent(card);
    });

    timelineContainer.addEventListener("keydown", event => {
      const card = event.target.closest(".agenda-event");
      if (!card) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleEvent(card);
      }
    });

    document.addEventListener("click", event => {
      if (!event.target.closest(".agenda-event")) collapseAll();
    });
  }

  function toggleEvent(card) {
    const isExpanded = card.classList.contains("expanded");
    collapseAll();
    if (isExpanded) return;
    ensureEventDetail(card);
    card.classList.add("expanded");
    card.setAttribute("aria-expanded", "true");
  }

  function collapseAll() {
    document.querySelectorAll(".agenda-event.expanded").forEach(card => {
      card.classList.remove("expanded");
      card.setAttribute("aria-expanded", "false");
    });
  }

  function ensureEventDetail(card) {
    if (card.querySelector(".event-detail")) return;
    const { event } = getEventFromCard(card);
    if (!event) return;

    const detail = document.createElement("div");
    detail.className = "event-detail";
    detail.innerHTML = `
      <div class="event-detail-row">
        <i class="ri-time-line"></i><b>${event.time}</b>
      </div>
      <div class="event-detail-row">
        <i class="ri-information-line"></i><span>${event.description || "Sem observacoes adicionais."}</span>
      </div>
      <div class="event-actions">
        <button type="button" class="event-act" data-act="notify"><i class="ri-notification-3-line"></i><span>Lembrar</span></button>
        <button type="button" class="event-act" data-act="copy"><i class="ri-file-copy-2-line"></i><span>Copiar</span></button>
        <button type="button" class="event-act" data-act="edit"><i class="ri-edit-2-line"></i><span>Editar</span></button>
      </div>
    `;
    card.appendChild(detail);
  }

  function getEventFromCard(card) {
    const dayIndex = Number(card.dataset.dayIndex);
    const eventIndex = Number(card.dataset.eventIndex);
    const day = agendaData[dayIndex];
    const event = day?.events?.[eventIndex];
    return { dayIndex, eventIndex, day, event };
  }

  function handleEventAction(button) {
    const card = button.closest(".agenda-event");
    if (!card) return;
    const { dayIndex, eventIndex, event } = getEventFromCard(card);
    if (!event) return;

    if (button.dataset.act === "copy") {
      try {
        navigator.clipboard?.writeText(`${event.time} - ${event.title}`);
      } catch {}
    }

    if (button.dataset.act === "notify") {
      try {
        localStorage.setItem("agendaNotify", JSON.stringify({ time: event.time, title: event.title, at: Date.now() }));
      } catch {}
    }

    if (button.dataset.act === "edit") {
      openEditor(dayIndex, eventIndex);
    }
  }

  function openEditor(dayIndex, eventIndex) {
    const day = agendaData[dayIndex];
    if (!day) return;
    const isEdit = Number.isInteger(eventIndex);
    const draft = isEdit ? { ...day.events[eventIndex] } : createDefaultEvent(day);

    closeEditor();

    const wrapper = document.createElement("div");
    wrapper.className = "agenda-editor";

    const backdrop = document.createElement("div");
    backdrop.className = "agenda-editor__backdrop";
    wrapper.appendChild(backdrop);

    const form = document.createElement("form");
    form.className = "agenda-editor__panel";
    form.setAttribute("role", "dialog");
    form.setAttribute("aria-modal", "true");
    form.setAttribute("aria-labelledby", "agenda-editor-title");
    wrapper.appendChild(form);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "agenda-editor__close";
    closeBtn.innerHTML = '<i class="ri-close-line"></i>';
    form.appendChild(closeBtn);

    const title = document.createElement("h2");
    title.id = "agenda-editor-title";
    title.textContent = isEdit ? "Editar compromisso" : "Novo compromisso";
    form.appendChild(title);

    const intro = document.createElement("p");
    intro.className = "agenda-editor__intro";
    intro.textContent = `${day.label} ${day.dayNumber}  ${day.summary}`;
    form.appendChild(intro);

    form.appendChild(fieldGroup("Horario", `<input class="agenda-editor__input" id="agenda-editor-time" name="time" type="time" required value="${draft.time}">`, "agenda-editor-time"));
    form.appendChild(fieldGroup("Titulo", `<input class="agenda-editor__input" id="agenda-editor-title-input" name="title" type="text" required value="${escapeHtml(draft.title)}" placeholder="Descreva o compromisso">`, "agenda-editor-title-input"));
    form.appendChild(fieldGroup("Descricao", `<textarea class="agenda-editor__textarea" id="agenda-editor-description" name="description" placeholder="Adicione detalhes">${escapeHtml(draft.description || "")}</textarea>`, "agenda-editor-description"));
    form.appendChild(fieldGroup("Icone", buildSelect("icon", ICON_OPTIONS, draft.icon, "agenda-editor-icon"), "agenda-editor-icon"));
    form.appendChild(fieldGroup("Cor", buildSelect("color", COLOR_CLASSES.map(color => ({ value: color, label: color })), draft.color, "agenda-editor-color"), "agenda-editor-color"));

    const actions = document.createElement("div");
    actions.className = "agenda-editor__actions";
    if (isEdit) {
      actions.appendChild(buildActionButton("Excluir", "ri-delete-bin-line", "delete", "agenda-editor__button agenda-editor__button--danger"));
    }
    actions.appendChild(buildActionButton("Cancelar", "ri-close-circle-line", "cancel", "agenda-editor__button agenda-editor__button--muted"));
    const save = document.createElement("button");
    save.type = "submit";
    save.className = "agenda-editor__button agenda-editor__button--primary";
    save.innerHTML = '<i class="ri-save-3-line"></i><span>Salvar</span>';
    actions.appendChild(save);
    form.appendChild(actions);

    document.body.appendChild(wrapper);
    document.body.classList.add("agenda-editor-open");

    const close = () => closeEditor(wrapper);
    backdrop.addEventListener("click", close);
    closeBtn.addEventListener("click", close);
    actions.addEventListener("click", event => {
      const btn = event.target.closest("[data-editor-act]");
      if (!btn) return;
      if (btn.dataset.editorAct === "cancel") {
        event.preventDefault();
        close();
      }
      if (btn.dataset.editorAct === "delete") {
        event.preventDefault();
        if (confirm("Remover este compromisso?")) {
          day.events.splice(eventIndex, 1);
          saveAgenda();
          renderTimeline();
          close();
        }
      }
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        time: sanitizeTime(String(formData.get("time") || "")),
        title: String(formData.get("title") || "").trim() || "Novo compromisso",
        description: String(formData.get("description") || "").trim(),
        icon: String(formData.get("icon") || ICON_OPTIONS[0].value),
        color: String(formData.get("color") || COLOR_CLASSES[0])
      };
      if (!COLOR_CLASSES.includes(payload.color)) payload.color = COLOR_CLASSES[0];
      if (isEdit) {
        day.events[eventIndex] = payload;
      } else {
        day.events.push(payload);
      }
      sortDayEvents(day);
      saveAgenda();
      renderTimeline();
      close();
    });

    form.querySelector("#agenda-editor-time")?.focus({ preventScroll: true });

    document.addEventListener("keydown", function escListener(ev) {
      if (ev.key === "Escape") {
        ev.preventDefault();
        close();
        document.removeEventListener("keydown", escListener);
      }
    }, { once: true });
  }

  function buildActionButton(label, icon, act, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.editorAct = act;
    button.innerHTML = `<i class="${icon}"></i><span>${label}</span>`;
    return button;
  }

  function fieldGroup(label, inner, controlId) {
    const wrapper = document.createElement("div");
    wrapper.className = "agenda-editor__form-group";
    const forAttr = controlId ? ` for="${controlId}"` : "";
    wrapper.innerHTML = `<label${forAttr}>${label}</label>${inner}`;
    return wrapper;
  }

  function buildSelect(name, options, value, id) {
    const list = options.map(option => {
      const opt = typeof option === "string" ? { value: option, label: option } : option;
      const selected = opt.value === value ? " selected" : "";
      return `<option value="${opt.value}"${selected}>${opt.label}</option>`;
    }).join("");
    const idAttr = id ? ` id="${id}"` : "";
    return `<select class="agenda-editor__select" name="${name}"${idAttr}>${list}</select>`;
  }

  function escapeHtml(text) {
    return String(text || "").replace(/[&<>"']/g, chr => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[chr] || chr));
  }

  function closeEditor(wrapper) {
    const panel = wrapper || document.querySelector(".agenda-editor");
    if (!panel) return;
    panel.remove();
    document.body.classList.remove("agenda-editor-open");
  }

  function createDefaultEvent(day) {
    const baseColor = COLOR_CLASSES[day.events.length % COLOR_CLASSES.length];
    const baseTime = day.events.length ? day.events[day.events.length - 1].time : "09:00";
    const next = incrementTime(baseTime, 60);
    return {
      time: next,
      title: "Novo compromisso",
      description: "",
      icon: ICON_OPTIONS[0].value,
      color: baseColor
    };
  }

  function incrementTime(value, minutes) {
    const [h, m] = (value || "09:00").split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return "10:00";
    const total = (h * 60 + m + minutes + 1440) % 1440;
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  function saveAgenda() {
    try {
      localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(agendaData));
    } catch {}
  }

  function handleReset() {
    if (!confirm("Deseja restaurar os compromissos padrao da agenda?")) return;
    agendaData = deepClone(DEFAULT_AGENDA);
    try { localStorage.removeItem(STORAGE_KEYS.data); } catch {}
    renderWeek();
    renderSummary();
    renderTimeline();
  }

  function debounce(fn, delay) {
    let timer = null;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(), delay);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
