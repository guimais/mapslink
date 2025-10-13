(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const navLinks = (window.MapsApp && typeof window.MapsApp.navLinks === 'function')
    ? window.MapsApp.navLinks()
    : Array.from($$('.nav-link'));

  function setActiveLink(url) {
    if (window.MapsApp && typeof window.MapsApp.highlightNav === 'function') {
      window.MapsApp.highlightNav(url);
      return;
    }
    navLinks.forEach(a => {
      const same = a.href === url || (a.hash && a.hash === location.hash);
      a.classList.toggle('active', same);
    });
  }
  setActiveLink(location.href);

  navLinks
    .filter(a => (a.getAttribute('href') || '').startsWith('#'))
    .forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        const el = id && $(id);
        if (el) {
          e.preventDefault();
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
          history.pushState(null, '', id);
          setActiveLink(location.href);
          if (window.MapsApp && typeof window.MapsApp.closeNav === 'function') {
            window.MapsApp.closeNav();
          }
        }
      });
    });

  const agendaEl = $('#agenda-entrevistas .agenda-numero');
  const curriculosCard = $('#curriculos-recebidos');

  const store = {
    get(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch {}
    }
  };

  const agendaHoje = store.get('mapslink_agenda_hoje', 3);
  if (agendaEl) agendaEl.textContent = agendaHoje;

  const curriculosCount = store.get('mapslink_curriculos_recebidos', 0);
  if (curriculosCard) {
    let badge = curriculosCard.querySelector('.badge-count');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'badge-count';
      badge.style.marginLeft = '8px';
      badge.style.fontWeight = '800';
      badge.style.background = 'var(--surface-2)';
      badge.style.borderRadius = '9999px';
      badge.style.padding = '4px 10px';
      badge.style.fontSize = '14px';
      badge.style.display = 'inline-block';
      const title = curriculosCard.querySelector('.card-title') || curriculosCard.querySelector('h2');
      if (title) title.appendChild(badge);
    }
    badge.textContent = curriculosCount;
  }

  window.MapsLink = {
    setAgendaHoje(n) {
      if (!Number.isFinite(+n)) return;
      store.set('mapslink_agenda_hoje', +n);
      if (agendaEl) agendaEl.textContent = +n;
    },
    setCurriculos(n) {
      if (!Number.isFinite(+n)) return;
      store.set('mapslink_curriculos_recebidos', +n);
      if (curriculosCard) {
        const b = curriculosCard.querySelector('.badge-count');
        if (b) b.textContent = +n;
      }
    }
  };
})();
