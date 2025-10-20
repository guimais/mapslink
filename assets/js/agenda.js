(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORAGE_KEYS = {
    activeDay: "agendaActiveDay",
    data: "agendaCustomData"
  };

  const COLOR_CLASSES = ["azul", "verde", "amarelo", "roxo", "laranja"];
  const COLOR_LABELS = {
    azul: "Azul profundo",
    verde: "Verde oceano",
    amarelo: "Azul celeste",
    roxo: "Indigo",
    laranja: "Azul vibrante"
  };

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
    { value: "ri-user-smile-line", label: "Testes" },
    { value: "ri-mic-line", label: "Comunicacao" },
    { value: "ri-graduation-cap-line", label: "Estudo" },
    { value: "ri-book-open-line", label: "Leitura" },
    { value: "ri-presentation-line", label: "Apresentacao" },
    { value: "ri-money-dollar-circle-line", label: "Financeiro" },
    { value: "ri-handshake-line", label: "Parcerias" },
    { value: "ri-leaf-line", label: "Saude" },
    { value: "ri-loop-left-line", label: "Retrospectiva" },
    { value: "ri-bank-line", label: "Investidores" },
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
      summary: "Segunda de planejamento e alinhamentos chave.",
      events: [
        {
          time: "09:00",
          title: "Kick-off da sprint",
          description: "Revisao das entregas e prioridades com todas as squads.",
          icon: "ri-flag-line",
          color: "azul"
        },
        {
          time: "11:00",
          title: "1:1 com Ana Martins",
          description: "Feedback quinzenal e combinados de desenvolvimento.",
          icon: "ri-user-heart-line",
          color: "verde"
        },
        {
          time: "14:00",
          title: "Revisao do roadmap Q4",
          description: "Atualizar milestones e riscos do projeto MapsLink.",
          icon: "ri-map-pin-line",
          color: "amarelo"
        },
        {
          time: "16:30",
          title: "Sync produto + marketing",
          description: "Planejar comunicacao do lancamento das novas rotas.",
          icon: "ri-team-line",
          color: "roxo"
        },
        {
          time: "18:30",
          title: "Mentoria de lideranca",
          description: "Sessao online com mentora convidada.",
          icon: "ri-lightbulb-line",
          color: "laranja"
        }
      ]
    },
    {
      id: "ter",
      label: "Ter",
      dayNumber: "2",
      summary: "Terca dedicada a entrevistas e experimentos.",
      events: [
        {
          time: "08:30",
          title: "Painel de metricas",
          description: "Analisar resultados da semana anterior e comparativos.",
          icon: "ri-bar-chart-2-line",
          color: "verde"
        },
        {
          time: "10:30",
          title: "Entrevista Maps - Produto",
          description: "Avaliar candidato para a vaga de PM Senior.",
          icon: "ri-user-search-line",
          color: "azul"
        },
        {
          time: "13:30",
          title: "Workshop de experimentos UX",
          description: "Construir backlog de testes para o app mobile.",
          icon: "ri-flask-line",
          color: "amarelo"
        },
        {
          time: "15:30",
          title: "Checkpoint Projeto Atlas",
          description: "Revisar riscos e planos de mitigacao do trimestre.",
          icon: "ri-focus-2-line",
          color: "roxo"
        },
        {
          time: "17:30",
          title: "Treino funcional",
          description: "Rotina de 45 minutos para alongar e recarregar.",
          icon: "ri-run-line",
          color: "laranja"
        }
      ]
    },
    {
      id: "qua",
      label: "Qua",
      dayNumber: "3",
      summary: "Quarta focada em aprendizado e comunidade.",
      events: [
        {
          time: "09:00",
          title: "Revisao do backlog",
          description: "Priorizacao semanal com o time de produto.",
          icon: "ri-todo-line",
          color: "azul"
        },
        {
          time: "11:30",
          title: "Almoco com a equipe",
          description: "Momento informal para celebrar conquistas.",
          icon: "ri-restaurant-2-line",
          color: "verde"
        },
        {
          time: "14:30",
          title: "Testes de usabilidade",
          description: "Sessao com usuarios beta do novo dashboard.",
          icon: "ri-user-smile-line",
          color: "amarelo"
        },
        {
          time: "16:00",
          title: "Atualizacao comunidade",
          description: "Live mensal com parceiros estrategicos.",
          icon: "ri-mic-line",
          color: "roxo"
        },
        {
          time: "19:00",
          title: "Curso de dataviz",
          description: "Modulo 3 com conteudos sobre storytelling.",
          icon: "ri-graduation-cap-line",
          color: "laranja"
        }
      ]
    },
    {
      id: "qui",
      label: "Qui",
      dayNumber: "4",
      summary: "Quinta de entregas e parcerias.",
      events: [
        {
          time: "08:00",
          title: "Clube do livro Maps",
          description: "Debate sobre inovacao e impacto no cliente.",
          icon: "ri-book-open-line",
          color: "verde"
        },
        {
          time: "10:00",
          title: "Sprint review squads A e B",
          description: "Apresentar evolucoes das funcionalidades criticas.",
          icon: "ri-presentation-line",
          color: "azul"
        },
        {
          time: "13:00",
          title: "Planejamento financeiro",
          description: "Ajustar previsoes com base em novas oportunidades.",
          icon: "ri-money-dollar-circle-line",
          color: "amarelo"
        },
        {
          time: "15:00",
          title: "Reuniao com parceiros",
          description: "Negociar integracoes e roadmap conjunto.",
          icon: "ri-handshake-line",
          color: "roxo"
        },
        {
          time: "18:00",
          title: "Aula de yoga",
          description: "Sessao relaxante para fechar o dia.",
          icon: "ri-leaf-line",
          color: "laranja"
        }
      ]
    },
    {
      id: "sex",
      label: "Sex",
      dayNumber: "5",
      summary: "Sexta de fechamento e celebracao.",
      events: [
        {
          time: "09:30",
          title: "Retrospectiva da sprint",
          description: "Registrar aprendizados e melhorias para o proximo ciclo.",
          icon: "ri-loop-left-line",
          color: "azul"
        },
        {
          time: "11:00",
          title: "Reuniao com investidor",
          description: "Atualizar resultados e pipeline de novos clientes.",
          icon: "ri-bank-line",
          color: "verde"
        },
        {
          time: "14:00",
          title: "Demo publica MapsLink",
          description: "Apresentar novidades para clientes e parceiros.",
          icon: "ri-slideshow-line",
          color: "amarelo"
        },
        {
          time: "16:30",
          title: "Happy hour da equipe",
          description: "Confraternizacao para celebrar a semana.",
          icon: "ri-cup-line",
          color: "roxo"
        },
        {
          time: "20:00",
          title: "Cinema em familia",
          description: "Sessao relax com direito a pipoca e descanso.",
          icon: "ri-movie-2-line",
          color: "laranja"
        }
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
  let touchStartX = null;
  let editorState = null;

  function init() {
    weekContainer = $(".agenda-week");
    timelineContainer = $(".agenda-timeline");
    summaryElement = $('[data-role="day-summary"]');
    addButton = $(".agenda-action--add");
    resetButton = $(".agenda-action--reset");

    if (!weekContainer || !timelineContainer) return;

    agendaData = loadAgendaData();
    activeDayIndex = getInitialDayIndex();

    ensureStyles();
    renderWeek();
    renderSummary();
    renderTimeline();

    weekContainer.addEventListener("click", handleWeekClick);
    weekContainer.addEventListener("keydown", handleWeekKeydown);
    weekContainer.addEventListener("touchstart", handleWeekTouchStart, { passive: true });
    weekContainer.addEventListener("touchend", handleWeekTouchEnd);

    timelineContainer.addEventListener("click", handleTimelineClick);
    timelineContainer.addEventListener("keydown", handleTimelineKeydown);

    document.addEventListener("click", handleDocumentClick);

    if (addButton) addButton.addEventListener("click", () => openEditor(activeDayIndex, null));
    if (resetButton) resetButton.addEventListener("click", handleReset);

    window.addEventListener("resize", handleResize);
    if ("ontouchstart" in window) document.documentElement.classList.add("touch");
  }

  function ensureStyles() {
    if (document.getElementById("ml-agenda-styles")) return;
    const style = document.createElement("style");
    style.id = "ml-agenda-styles";
    style.textContent = `
.agenda-event{position:relative;overflow:hidden}
.ripple{position:absolute;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.35);animation:ml-r .45s ease-out forwards;pointer-events:none}
@keyframes ml-r{to{transform:translate(-50%,-50%) scale(18);opacity:0}}
.agenda-event .event-detail{margin-top:14px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.26);backdrop-filter:saturate(140%) blur(4px);border-radius:16px;padding:16px 18px;display:grid;grid-template-columns:1fr;gap:12px}
.agenda-event:not(.expanded) .event-detail{display:none}
.event-detail-row{display:flex;align-items:flex-start;gap:8px;line-height:1.4}
.event-detail-row i{font-size:18px;opacity:.82;margin-top:2px}
.event-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:6px}
.event-act{display:inline-flex;align-items:center;gap:6px;border-radius:12px;padding:10px 14px;background:rgba(255,255,255,.22);color:#fff;font-weight:800;cursor:pointer;border:1px solid rgba(255,255,255,.32);box-shadow:0 6px 14px rgba(15,23,42,.24);transition:background .2s ease,transform .18s ease,box-shadow .2s ease}
.event-act:hover{background:rgba(255,255,255,.3);transform:translateY(-1px);box-shadow:0 8px 18px rgba(15,23,42,.26)}
.event-act:active{transform:translateY(0);background:rgba(255,255,255,.26);box-shadow:0 3px 10px rgba(15,23,42,.24)}
.event-act i{font-size:18px}
.event-act span{font-size:14px}
.agenda-event.laranja .event-act,
.agenda-event.amarelo .event-act{color:var(--brand-2);background:rgba(255,255,255,.52);border:1px solid rgba(16,37,105,.2);box-shadow:0 6px 14px rgba(16,37,105,.15)}
.agenda-event.laranja .event-act:hover,
.agenda-event.amarelo .event-act:hover{background:rgba(255,255,255,.64);box-shadow:0 8px 18px rgba(16,37,105,.18)}
`;
    document.head.appendChild(style);
  }

  function loadAgendaData() {
    const fallback = deepClone(DEFAULT_AGENDA);
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.data);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;
      return fallback.map((day, index) => mergeDay(day, parsed[index]));
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
      const fallbackEvent = baseEvents[i] || baseEvents[0] || {};
      merged.events.push(normalizeEvent(source, fallbackEvent));
    }
    if (merged.events.length === 0) {
      merged.events = baseEvents.map(evt => normalizeEvent(evt));
    }
    sortDayEvents(merged);
    return merged;
  }

  function normalizeEvent(event, fallback = {}) {
    const safeString = value => (typeof value === "string" ? value : "");
    const time = sanitizeTime(safeString(event?.time) || safeString(fallback.time) || "09:00");
    const title = safeString(event?.title) || safeString(fallback.title) || "Compromisso";
    const description = safeString(event?.description) || safeString(fallback.description) || "";
    const icon = safeString(event?.icon) || safeString(fallback.icon) || ICON_OPTIONS[0].value;
    const colorCandidate = safeString(event?.color) || safeString(fallback.color);
    const color = COLOR_CLASSES.includes(colorCandidate) ? colorCandidate : COLOR_CLASSES[0];
    return { time, title, description, icon, color };
  }

  function sanitizeTime(value) {
    if (typeof value !== "string") return "00:00";
    const cleaned = value.trim().slice(0, 5);
    if (/^\\d{2}:\\d{2}$/.test(cleaned)) return cleaned;
    const match = cleaned.match(/^(\\d{1,2}):(\\d{2})$/);
    if (match) {
      const hour = Math.max(0, Math.min(23, Number(match[1])));
      const minute = Math.max(0, Math.min(59, Number(match[2])));
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
    return "00:00";
  }

  function sortDayEvents(day) {
    if (!day || !Array.isArray(day.events)) return;
    day.events.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }

  function deepClone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function getInitialDayIndex() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.activeDay);
      const stored = Number(raw);
      if (!Number.isNaN(stored)) return clampDayIndex(stored);
    } catch {}
    return 0;
  }

  function storeActiveDay(index) {
    try {
      localStorage.setItem(STORAGE_KEYS.activeDay, String(index));
    } catch {}
  }

  function clampDayIndex(index) {
    if (!Array.isArray(agendaData) || agendaData.length === 0) return 0;
    if (index < 0) return 0;
    if (index >= agendaData.length) return agendaData.length - 1;
    return index;
  }

  function renderWeek() {
    if (!weekContainer) return;
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
      summaryElement.textContent = "";
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
    if (!timelineContainer) return;
    timelineContainer.innerHTML = "";
    const day = agendaData[activeDayIndex];
    if (!day) return;

    if (!day.events.length) {
      timelineContainer.appendChild(createEmptyState());
      return;
    }

    sortDayEvents(day);

    day.events.forEach((event, index) => {
      const hour = document.createElement("div");
      hour.className = "agenda-hour";
      hour.textContent = event.time || "--:--";

      const card = document.createElement("div");
      card.className = `agenda-event ${event.color || COLOR_CLASSES[0]}`;
      card.dataset.dayIndex = String(activeDayIndex);
      card.dataset.eventIndex = String(index);
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-expanded", "false");

      const icon = document.createElement("i");
      icon.className = event.icon || ICON_OPTIONS[0].value;
      const label = document.createElement("span");
      label.textContent = event.title || "Compromisso";

      card.append(icon, label);
      timelineContainer.append(hour, card);
    });
  }

  function createEmptyState() {
    const wrapper = document.createElement("div");
    wrapper.className = "agenda-empty";
    const icon = document.createElement("i");
    icon.className = "ri-calendar-2-line";
    const label = document.createElement("span");
    label.textContent = "Nenhum compromisso por aqui. Clique em \"Novo compromisso\" para adicionar.";
    wrapper.append(icon, label);
    return wrapper;
  }

  function setActiveDay(index, focusAfter = false) {
    const nextIndex = clampDayIndex(index);
    if (nextIndex === activeDayIndex) {
      renderWeek();
      renderSummary();
      renderTimeline();
      return;
    }
    activeDayIndex = nextIndex;
    renderWeek();
    renderSummary();
    renderTimeline();
    storeActiveDay(nextIndex);
    if (focusAfter) {
      const activeButton = weekContainer?.querySelector(".agenda-day.active-day");
      if (activeButton) activeButton.focus();
    }
  }

  function handleWeekClick(event) {
    const button = event.target.closest(".agenda-day");
    if (!button) return;
    const index = Number(button.dataset.index);
    if (Number.isNaN(index)) return;
    setActiveDay(index);
  }

  function handleWeekKeydown(event) {
    const button = event.target.closest(".agenda-day");
    if (!button) return;
    const index = Number(button.dataset.index);
    if (Number.isNaN(index)) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        setActiveDay(index);
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        setActiveDay(index + 1, true);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        setActiveDay(index - 1, true);
        break;
      case "Home":
        event.preventDefault();
        setActiveDay(0, true);
        break;
      case "End":
        event.preventDefault();
        setActiveDay(agendaData.length - 1, true);
        break;
      default:
    }
  }

  function handleWeekTouchStart(event) {
    if (event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
  }

  function handleWeekTouchEnd(event) {
    if (touchStartX === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (deltaX < -40) setActiveDay(activeDayIndex + 1);
    if (deltaX > 40) setActiveDay(activeDayIndex - 1);
    touchStartX = null;
  }

  function handleTimelineClick(event) {
    const actionButton = event.target.closest(".event-act");
    if (actionButton) {
      handleEventAction(actionButton);
      return;
    }
    const card = event.target.closest(".agenda-event");
    if (!card) return;
    toggleEventCard(card);
  }

  function handleTimelineKeydown(event) {
    const card = event.target.closest(".agenda-event");
    if (!card) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleEventCard(card);
    }
  }

  function handleDocumentClick(event) {
    if (editorState && editorState.element.contains(event.target)) return;
    if (event.target.closest(".agenda-event")) return;
    collapseAll();
  }

  function toggleEventCard(card) {
    const data = getEventFromCard(card);
    if (!data.event) return;
    const isExpanded = card.classList.contains("expanded");
    collapseAll();
    if (isExpanded) return;
    ensureDetail(card, data.event);
    card.classList.add("expanded");
    card.setAttribute("aria-expanded", "true");
    ripple(card);
    if (navigator.vibrate) {
      try { navigator.vibrate(8); } catch {}
    }
  }

  function collapseAll() {
    $$(".agenda-event.expanded", timelineContainer).forEach(card => {
      card.classList.remove("expanded");
      card.setAttribute("aria-expanded", "false");
    });
  }

  function getEventFromCard(card) {
    const dayIndex = Number(card.dataset.dayIndex);
    const eventIndex = Number(card.dataset.eventIndex);
    const day = agendaData[dayIndex];
    const event = day?.events?.[eventIndex];
    return { dayIndex, eventIndex, day, event };
  }

  function ensureDetail(card, event) {
    if (card.querySelector(".event-detail")) return;
    const detail = document.createElement("div");
    detail.className = "event-detail";

    const timeRow = document.createElement("div");
    timeRow.className = "event-detail-row";
    const timeIcon = document.createElement("i");
    timeIcon.className = "ri-time-line";
    const timeValue = document.createElement("b");
    timeValue.textContent = event.time || "--:--";
    timeRow.append(timeIcon, timeValue);

    const titleRow = document.createElement("div");
    titleRow.className = "event-detail-row";
    const titleIcon = document.createElement("i");
    titleIcon.className = "ri-information-line";
    const titleValue = document.createElement("span");
    titleValue.textContent = event.title || "Compromisso";
    titleRow.append(titleIcon, titleValue);

    const descriptionRow = document.createElement("div");
    descriptionRow.className = "event-detail-row";
    const descriptionIcon = document.createElement("i");
    descriptionIcon.className = "ri-chat-quote-line";
    const descriptionValue = document.createElement("span");
    descriptionValue.textContent = event.description || "Sem observacoes adicionadas.";
    descriptionRow.append(descriptionIcon, descriptionValue);

    const actions = document.createElement("div");
    actions.className = "event-actions";
    actions.append(
      createActionButton("notify", "ri-notification-3-line", "Lembrar"),
      createActionButton("copy", "ri-file-copy-2-line", "Copiar"),
      createActionButton("edit", "ri-edit-2-line", "Editar")
    );

    detail.append(timeRow, titleRow, descriptionRow, actions);
    card.appendChild(detail);
  }

  function createActionButton(action, iconClass, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "event-act";
    button.dataset.act = action;
    const icon = document.createElement("i");
    icon.className = iconClass;
    const text = document.createElement("span");
    text.textContent = label;
    button.append(icon, text);
    return button;
  }

  function ripple(target) {
    const pulse = document.createElement("span");
    pulse.className = "ripple";
    pulse.style.left = `${target.clientWidth / 2}px`;
    pulse.style.top = `${target.clientHeight / 2}px`;
    target.appendChild(pulse);
    setTimeout(() => pulse.remove(), 450);
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

  function createDefaultEventForDay(day) {
    const baseColor = COLOR_CLASSES[day.events.length % COLOR_CLASSES.length];
    const suggestedTime = day.events.length
      ? incrementTime(day.events[day.events.length - 1].time, 60)
      : "09:00";
    return {
      time: suggestedTime,
      title: "Novo compromisso",
      description: "",
      icon: ICON_OPTIONS[0].value,
      color: baseColor
    };
  }

  function incrementTime(value, minutesToAdd) {
    const [rawHour, rawMinute] = (value || "08:00").split(":").map(part => Number(part));
    if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) return "09:00";
    const total = ((rawHour * 60) + rawMinute + minutesToAdd + 1440) % 1440;
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  function openEditor(dayIndex, eventIndex) {
    const day = agendaData[dayIndex];
    if (!day) return;
    const isEdit = Number.isInteger(eventIndex);
    const draft = isEdit ? { ...day.events[eventIndex] } : createDefaultEventForDay(day);

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

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "agenda-editor__close";
    closeButton.setAttribute("aria-label", "Fechar editor");
    const closeIcon = document.createElement("i");
    closeIcon.className = "ri-close-line";
    closeButton.appendChild(closeIcon);
    form.appendChild(closeButton);

    const title = document.createElement("h2");
    title.id = "agenda-editor-title";
    title.textContent = isEdit ? "Editar compromisso" : "Novo compromisso";
    form.appendChild(title);

    const intro = document.createElement("p");
    intro.className = "agenda-editor__intro";
    intro.textContent = `${day.label} ${day.dayNumber} · ${day.summary}`;
    form.appendChild(intro);

    const timeGroup = document.createElement("div");
    timeGroup.className = "agenda-editor__form-group";
    const timeLabel = document.createElement("label");
    timeLabel.setAttribute("for", "agenda-editor-time");
    timeLabel.textContent = "Horario";
    const timeInput = document.createElement("input");
    timeInput.className = "agenda-editor__input";
    timeInput.id = "agenda-editor-time";
    timeInput.name = "time";
    timeInput.type = "time";
    timeInput.required = true;
    timeInput.value = sanitizeTime(draft.time);
    timeGroup.append(timeLabel, timeInput);
    form.appendChild(timeGroup);

    const titleGroup = document.createElement("div");
    titleGroup.className = "agenda-editor__form-group";
    const titleLabel = document.createElement("label");
    titleLabel.setAttribute("for", "agenda-editor-title-input");
    titleLabel.textContent = "Titulo";
    const titleInput = document.createElement("input");
    titleInput.className = "agenda-editor__input";
    titleInput.id = "agenda-editor-title-input";
    titleInput.name = "title";
    titleInput.type = "text";
    titleInput.required = true;
    titleInput.placeholder = "Descreva o compromisso";
    titleInput.value = draft.title;
    titleGroup.append(titleLabel, titleInput);
    form.appendChild(titleGroup);

    const descriptionGroup = document.createElement("div");
    descriptionGroup.className = "agenda-editor__form-group";
    const descriptionLabel = document.createElement("label");
    descriptionLabel.setAttribute("for", "agenda-editor-description");
    descriptionLabel.textContent = "Descricao";
    const descriptionInput = document.createElement("textarea");
    descriptionInput.className = "agenda-editor__textarea";
    descriptionInput.id = "agenda-editor-description";
    descriptionInput.name = "description";
    descriptionInput.placeholder = "Adicione detalhes, links ou observacoes";
    descriptionInput.value = draft.description || "";
    descriptionGroup.append(descriptionLabel, descriptionInput);
    form.appendChild(descriptionGroup);

    const iconGroup = document.createElement("div");
    iconGroup.className = "agenda-editor__form-group";
    const iconLabel = document.createElement("label");
    iconLabel.setAttribute("for", "agenda-editor-icon");
    iconLabel.textContent = "Icone";
    const iconSelect = document.createElement("select");
    iconSelect.className = "agenda-editor__select";
    iconSelect.id = "agenda-editor-icon";
    iconSelect.name = "icon";
    ICON_OPTIONS.forEach(optionData => {
      const option = document.createElement("option");
      option.value = optionData.value;
      option.textContent = optionData.label;
      if (optionData.value === draft.icon) option.selected = true;
      iconSelect.appendChild(option);
    });
    iconGroup.append(iconLabel, iconSelect);
    form.appendChild(iconGroup);

    const colorGroup = document.createElement("div");
    colorGroup.className = "agenda-editor__form-group";
    const colorLabel = document.createElement("label");
    colorLabel.setAttribute("for", "agenda-editor-color");
    colorLabel.textContent = "Cor";
    const colorSelect = document.createElement("select");
    colorSelect.className = "agenda-editor__select";
    colorSelect.id = "agenda-editor-color";
    colorSelect.name = "color";
    COLOR_CLASSES.forEach(color => {
      const option = document.createElement("option");
      option.value = color;
      option.textContent = COLOR_LABELS[color] || color;
      if (color === draft.color) option.selected = true;
      colorSelect.appendChild(option);
    });
    colorGroup.append(colorLabel, colorSelect);
    form.appendChild(colorGroup);

    const actions = document.createElement("div");
    actions.className = "agenda-editor__actions";

    if (isEdit) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "agenda-editor__button agenda-editor__button--danger";
      deleteButton.dataset.editorAct = "delete";
      appendButtonContent(deleteButton, "ri-delete-bin-line", "Excluir");
      actions.appendChild(deleteButton);
    }

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "agenda-editor__button agenda-editor__button--muted";
    cancelButton.dataset.editorAct = "cancel";
    appendButtonContent(cancelButton, "ri-close-circle-line", "Cancelar");
    actions.appendChild(cancelButton);

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "agenda-editor__button agenda-editor__button--primary";
    appendButtonContent(saveButton, "ri-save-3-line", "Salvar");
    actions.appendChild(saveButton);

    form.appendChild(actions);

    const handleKeydown = event => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeEditor();
      }
    };

    document.body.appendChild(wrapper);
    document.body.classList.add("agenda-editor-open");
    document.addEventListener("keydown", handleKeydown);

    backdrop.addEventListener("click", () => closeEditor());
    closeButton.addEventListener("click", () => closeEditor());
    actions.addEventListener("click", event => {
      const target = event.target.closest("[data-editor-act]");
      if (!target) return;
      handleEditorAction(target.dataset.editorAct, dayIndex, eventIndex);
    });
    form.addEventListener("submit", event => handleEditorSubmit(event, dayIndex, eventIndex));

    requestAnimationFrame(() => timeInput.focus({ preventScroll: true }));

    editorState = { element: wrapper, keyHandler: handleKeydown };
  }

  function appendButtonContent(button, iconClass, label) {
    const icon = document.createElement("i");
    icon.className = iconClass;
    const text = document.createElement("span");
    text.textContent = label;
    button.append(icon, text);
  }

  function closeEditor() {
    if (!editorState) return;
    document.removeEventListener("keydown", editorState.keyHandler);
    if (editorState.element?.parentNode) {
      editorState.element.parentNode.removeChild(editorState.element);
    }
    document.body.classList.remove("agenda-editor-open");
    editorState = null;
  }

  function handleEditorSubmit(event, dayIndex, eventIndex) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const day = agendaData[dayIndex];
    if (!day) return;

    const payload = {
      time: sanitizeTime(String(formData.get("time") || "")),
      title: String(formData.get("title") || "").trim() || "Novo compromisso",
      description: String(formData.get("description") || "").trim(),
      icon: String(formData.get("icon") || ICON_OPTIONS[0].value),
      color: String(formData.get("color") || COLOR_CLASSES[0])
    };

    if (!COLOR_CLASSES.includes(payload.color)) {
      payload.color = COLOR_CLASSES[0];
    }
    if (!payload.icon) {
      payload.icon = ICON_OPTIONS[0].value;
    }

    if (Number.isInteger(eventIndex)) {
      day.events[eventIndex] = payload;
    } else {
      day.events.push(payload);
    }

    sortDayEvents(day);
    saveAgendaData();
    closeEditor();
    renderTimeline();
  }

  function handleEditorAction(action, dayIndex, eventIndex) {
    if (action === "cancel") {
      closeEditor();
      return;
    }
    if (action === "delete") {
      const day = agendaData[dayIndex];
      if (!day || !Number.isInteger(eventIndex)) {
        closeEditor();
        return;
      }
      const confirmed = typeof window.confirm === "function"
        ? window.confirm("Remover este compromisso?")
        : true;
      if (!confirmed) return;
      day.events.splice(eventIndex, 1);
      saveAgendaData();
      closeEditor();
      renderTimeline();
    }
  }

  function saveAgendaData() {
    try {
      localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(agendaData));
    } catch {}
  }

  function handleReset() {
    const confirmed = typeof window.confirm === "function"
      ? window.confirm("Deseja restaurar os compromissos padrao da agenda?")
      : true;
    if (!confirmed) return;
    agendaData = deepClone(DEFAULT_AGENDA);
    try { localStorage.removeItem(STORAGE_KEYS.data); } catch {}
    closeEditor();
    renderWeek();
    renderSummary();
    renderTimeline();
  }

  const handleResize = (() => {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.MapsApp && typeof window.MapsApp.closeNav === "function") {
          window.MapsApp.closeNav();
        }
      }, 120);
    };
  })();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
