const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]

const days = $$('.agenda-week span')
const week = $('.agenda-week')

const setActiveDay = i => {
  days.forEach(d => d.classList.remove('active-day'))
  days[i]?.classList.add('active-day')
  localStorage.setItem('agendaActiveDay', String(i))
}

days.forEach((d, i) => {
  d.setAttribute('tabindex', '0')
  d.addEventListener('click', () => setActiveDay(i))
  d.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActiveDay(i)
    }
  })
})

const savedDay = Number(localStorage.getItem('agendaActiveDay'))
if (!Number.isNaN(savedDay) && days[savedDay]) setActiveDay(savedDay)

let touchX = null
week?.addEventListener('touchstart', e => {
  touchX = e.touches[0].clientX
})
week?.addEventListener('touchend', e => {
  if (touchX === null) return
  const dx = e.changedTouches[0].clientX - touchX
  const i = days.findIndex(d => d.classList.contains('active-day'))
  if (dx < -40 && i < days.length - 1) setActiveDay(i + 1)
  if (dx > 40 && i > 0) setActiveDay(i - 1)
  touchX = null
})

const events = $$('.agenda-event')
const hours = $$('.agenda-hour')

const eventTimeFor = el => {
  let p = el.previousElementSibling
  while (p && !p.classList.contains('agenda-hour')) p = p.previousElementSibling
  return p?.textContent?.trim() || ''
}

const collapseAll = () => events.forEach(e => {
  e.classList.remove('expanded')
  e.setAttribute('aria-expanded', 'false')
})

const ripple = el => {
  const r = document.createElement('span')
  const rect = el.getBoundingClientRect()
  r.className = 'ripple'
  r.style.left = (rect.width / 2) + 'px'
  r.style.top = (rect.height / 2) + 'px'
  el.appendChild(r)
  setTimeout(() => r.remove(), 450)
}

const ensureDetail = el => {
  if (el.querySelector('.event-detail')) return
  const box = document.createElement('div')
  const t = eventTimeFor(el)
  const label = el.querySelector('span')?.textContent?.trim() || ''
  box.className = 'event-detail'
  box.innerHTML = `
    <div class="event-detail-row">
      <i class="ri-time-line"></i><b>${t}</b>
    </div>
    <div class="event-detail-row">
      <i class="ri-information-line"></i><span>${label}</span>
    </div>
    <div class="event-actions">
      <button type="button" class="event-act" data-act="notify"><i class="ri-notification-3-line"></i><span>Lembrar</span></button>
      <button type="button" class="event-act" data-act="copy"><i class="ri-file-copy-2-line"></i><span>Copiar</span></button>
    </div>
  `
  el.appendChild(box)
}

events.forEach(el => {
  el.setAttribute('tabindex', '0')
  el.setAttribute('role', 'button')
  el.setAttribute('aria-expanded', 'false')
  el.addEventListener('click', e => {
    if (e.target.closest('.event-act')) return
    const was = el.classList.contains('expanded')
    collapseAll()
    if (!was) {
      ensureDetail(el)
      el.classList.add('expanded')
      el.setAttribute('aria-expanded', 'true')
      ripple(el)
      if (navigator.vibrate) navigator.vibrate(8)
    }
  })
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      el.click()
    }
  })
})

document.addEventListener('click', e => {
  if (!e.target.closest('.agenda-event')) collapseAll()
})

document.addEventListener('click', e => {
  const act = e.target.closest('.event-act')
  if (!act) return
  const card = act.closest('.agenda-event')
  const t = eventTimeFor(card)
  const label = card.querySelector('span')?.textContent?.trim() || ''
  if (act.dataset.act === 'copy') {
    navigator.clipboard?.writeText(`${t} • ${label}`)
  }
  if (act.dataset.act === 'notify') {
    try {
      localStorage.setItem('agendaNotify', JSON.stringify({ t, label, at: Date.now() }))
    } catch {}
  }
})

const style = document.createElement('style')
style.textContent = `
  .agenda-event{position:relative;overflow:hidden}
  .ripple{position:absolute;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.35);animation:r .45s ease-out forwards;pointer-events:none}
  @keyframes r{to{transform:translate(-50%,-50%) scale(18);opacity:0}}
  .agenda-event .event-detail{margin-top:14px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.26);backdrop-filter:saturate(140%) blur(4px);border-radius:16px;padding:14px 16px;display:grid;grid-template-columns:1fr;gap:10px}
  .agenda-event:not(.expanded) .event-detail{display:none}
  .event-detail-row{display:flex;align-items:center;gap:8px}
  .event-actions{display:flex;gap:12px;margin-top:6px}
  .event-act{display:inline-flex;align-items:center;gap:6px;border-radius:12px;padding:10px 14px;background:rgba(255,255,255,.22);color:#fff;font-weight:800;cursor:pointer;border:1px solid rgba(255,255,255,.32);box-shadow:0 6px 14px rgba(15,23,42,.24);transition:background .2s ease,transform .18s ease,box-shadow .2s ease}
  .event-act:hover{background:rgba(255,255,255,.3);transform:translateY(-1px);box-shadow:0 8px 18px rgba(15,23,42,.26)}
  .event-act:active{transform:translateY(0);background:rgba(255,255,255,.26);box-shadow:0 3px 10px rgba(15,23,42,.24)}
  .event-act i{font-size:18px}
  .event-act span{font-size:14px}
  .amarelo .event-act,.laranja .event-act{color:var(--brand-2);background:rgba(255,255,255,.52);border:1px solid rgba(16,37,105,.2);box-shadow:0 6px 14px rgba(16,37,105,.15)}
  .amarelo .event-act:hover,.laranja .event-act:hover{background:rgba(255,255,255,.64);box-shadow:0 8px 18px rgba(16,37,105,.18)}
`
document.head.appendChild(style)

const resize = (() => {
  let t
  return () => {
    clearTimeout(t)
    t = setTimeout(() => {
      if (window.MapsApp && typeof window.MapsApp.closeNav === 'function') {
        window.MapsApp.closeNav()
      }
    }, 120)
  }
})()
window.addEventListener('resize', resize)

if ('ontouchstart' in window) document.documentElement.classList.add('touch')
