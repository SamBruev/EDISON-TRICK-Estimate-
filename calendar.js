(function () {
  const TYPES = {
    rehearsal: { label: 'Репетиция', color: '#34d399' },
    drums:     { label: 'Барабаны', color: '#f87171' },
    bass:      { label: 'Бас', color: '#fb923c' },
    guitars:   { label: 'Гитары', color: '#38bdf8' },
    vocals:    { label: 'Вокал', color: '#f472b6' },
    mixing:    { label: 'Редакция + сведение', color: '#ffb600' },
    deadline:  { label: 'Готовность', color: '#f2d78c' },
  };

  function colorMark(color, className) {
    return `<span class="${className}" style="background:${color};box-shadow:0 0 6px ${color}99"></span>`;
  }

  const BASE_EVENTS = {
    '2026-06-28': [{ type: 'rehearsal', title: 'Репетиция', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-07-05': [{ type: 'rehearsal', title: 'Репетиция', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-07-06': [{ type: 'drums', title: 'Барабаны (MIDI)', meta: '3 трека', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-07-07': [{ type: 'drums', title: 'Барабаны (MIDI)', meta: '3 трека', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-07-08': [{ type: 'bass', title: 'Бас (MIDI)', meta: '3 трека', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-07-12': [{ type: 'guitars', title: 'Гитары (смена 1)', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-07-19': [{ type: 'guitars', title: 'Гитары (смена 2)', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-07-26': [{ type: 'guitars', title: 'Гитары (смена 3)', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-08-02': [{ type: 'guitars', title: 'Гитары (смена 4)', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-08-12': [{ type: 'vocals', title: 'Вокал (смена 1)', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-08-19': [{ type: 'vocals', title: 'Вокал (смена 2)', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-08-26': [{ type: 'vocals', title: 'Вокал (смена 3)', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-09-02': [{ type: 'vocals', title: 'Вокал (смена 4)', hours: '5 ч.', price: '15 000 ₽' }],
    '2026-09-08': [{ type: 'mixing', title: 'Редакция вокала + сведение + мастеринг · трек 1', meta: 'за трек', price: '25 000 ₽' }],
    '2026-09-15': [{ type: 'mixing', title: 'Редакция вокала + сведение + мастеринг · трек 2', meta: 'за трек', price: '25 000 ₽' }],
    '2026-09-22': [{ type: 'mixing', title: 'Редакция вокала + сведение + мастеринг · трек 3', meta: 'за трек', price: '25 000 ₽' }],
    '2026-10-01': [{ type: 'deadline', title: 'Финальная сдача', hours: '', price: '' }],
  };

  const MONTHS = [
    { y: 2026, m: 5, short: 'Июн' },
    { y: 2026, m: 6, short: 'Июл' },
    { y: 2026, m: 7, short: 'Авг' },
    { y: 2026, m: 8, short: 'Сен' },
    { y: 2026, m: 9, short: 'Окт' },
  ];

  const MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];

  const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

  let viewYear = 2026;
  let viewMonth = 5;
  let selectedKey = null;

  // Live-recording state, kept in sync with the checkboxes in estimate.js.
  // When a part is recorded live, its MIDI calendar days are dropped
  // (live dates are agreed separately) and a note is shown in July.
  let liveState = { bass: false, drums: false };
  const DRUMS_MIDI_KEYS = ['2026-07-06', '2026-07-07'];
  const BASS_MIDI_KEY = '2026-07-08';
  let EVENTS = computeEvents();

  const tabsEl = document.getElementById('calMonthTabs');
  const titleEl = document.getElementById('calTitle');
  const gridEl = document.getElementById('calGrid');
  const legendEl = document.getElementById('calLegend');
  const detailEl = document.getElementById('calDetail');
  const noteEl = document.getElementById('calNote');
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');
  const viewport = document.getElementById('calViewport');

  if (
    !tabsEl ||
    !titleEl ||
    !gridEl ||
    !legendEl ||
    !detailEl ||
    !noteEl ||
    !prevBtn ||
    !nextBtn ||
    !viewport
  ) {
    return;
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function dateKey(y, m, d) {
    return `${y}-${pad(m + 1)}-${pad(d)}`;
  }

  function monthIndex(y, m) {
    return MONTHS.findIndex((x) => x.y === y && x.m === m);
  }

  function hasEventsInMonth(y, m) {
    const prefix = `${y}-${pad(m + 1)}-`;
    return Object.keys(EVENTS).some((k) => k.startsWith(prefix));
  }

  function computeEvents() {
    const ev = {};
    Object.keys(BASE_EVENTS).forEach((k) => { ev[k] = BASE_EVENTS[k]; });
    if (liveState.drums) DRUMS_MIDI_KEYS.forEach((k) => { delete ev[k]; });
    if (liveState.bass) delete ev[BASS_MIDI_KEY];
    return ev;
  }

  function renderTabs() {
    tabsEl.innerHTML = MONTHS.map(({ y, m, short }) => {
      const active = y === viewYear && m === viewMonth ? ' active' : '';
      const dots = hasEventsInMonth(y, m) ? ' has-events' : '';
      return `<button type="button" class="cal-tab${active}${dots}" data-y="${y}" data-m="${m}">${short}</button>`;
    }).join('');

    tabsEl.querySelectorAll('.cal-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewYear = Number(btn.dataset.y);
        viewMonth = Number(btn.dataset.m);
        selectedKey = null;
        render();
      });
    });
  }

  function renderLegend() {
    const used = new Set();
    Object.values(EVENTS).flat().forEach((ev) => used.add(ev.type));
    legendEl.innerHTML = [...used]
      .map((type) => {
        const t = TYPES[type];
        const mark = type === 'deadline'
          ? '<span class="cal-legend-lamp" aria-hidden="true"></span>'
          : colorMark(t.color, 'cal-legend-dot');
        return `<span class="cal-legend-item">${mark}${t.label}</span>`;
      })
      .join('');
  }

  function renderNote() {
    const lines = [];

    if (viewMonth === 6) {
      if (liveState.drums) {
        lines.push('<strong>Барабаны вживую</strong> — 3 смены по 3 ч, даты согласуем вместе (вместо MIDI 6–7 июля).');
      }
      if (liveState.bass) {
        lines.push('<strong>Бас вживую</strong> — 3 × 3 ч, даты согласуем вместе (вместо MIDI 8 июля).');
      }
    }

    if (viewMonth === 8) {
      lines.push('<strong>Продакшн и правки</strong> (10 ч. · 25 000 ₽) — дату согласуем вместе, между записью вокала (2 сен) и сведением (8 сен).');
    }

    if (lines.length) {
      noteEl.hidden = false;
      noteEl.innerHTML = lines.join('<br><br>');
    } else {
      noteEl.hidden = true;
    }
  }

  function renderNav() {
    const idx = monthIndex(viewYear, viewMonth);
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= MONTHS.length - 1;
    titleEl.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  }

  function renderGrid() {
    gridEl.innerHTML = '';
    const first = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    let startOffset = first.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      gridEl.appendChild(empty);
    }

    for (let day = 1; day <= lastDay; day++) {
      const key = dateKey(viewYear, viewMonth, day);
      const events = EVENTS[key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.dataset.key = key;

      if (events) {
        btn.classList.add('has-event');
        if (events.some((e) => e.type !== 'deadline')) btn.classList.add('has-recording');
        if (events.some((e) => e.type === 'deadline')) btn.classList.add('deadline');
        if (key === selectedKey) btn.classList.add('selected');

        const types = [...new Set(events.map((e) => e.type))];
        const dots = types
          .map((t) => colorMark(TYPES[t].color, 'cal-dot'))
          .join('');

        const primaryType = events.find((e) => e.type !== 'deadline')?.type;
        const primaryColor = primaryType ? TYPES[primaryType].color : null;
        const numStyle = primaryColor
          ? `style="border: 1.5px solid ${primaryColor}; box-shadow: 0 0 7px ${primaryColor}66;"`
          : '';

        btn.innerHTML = `<span class="cal-day-num" ${numStyle}>${day}</span><span class="cal-dots">${dots}</span>`;
        btn.addEventListener('click', () => selectDay(key));
      } else {
        btn.innerHTML = `<span class="cal-day-num">${day}</span>`;
      }

      gridEl.appendChild(btn);
    }
  }

  function formatDetailDate(key) {
    const [y, mo, d] = key.split('-').map(Number);
    const dt = new Date(y, mo - 1, d);
    const wd = WEEKDAYS[dt.getDay()];
    return `${d} ${MONTH_NAMES[mo - 1].toLowerCase()} ${y} · ${wd}`;
  }

  function selectDay(key) {
    selectedKey = key;
    renderGrid();
    const events = EVENTS[key];
    if (!events) return;

    detailEl.innerHTML =
      `<div class="cal-detail-date">${formatDetailDate(key)}</div>` +
      events
        .map((ev) => {
          const color = TYPES[ev.type].color;

          if (ev.type === 'deadline') {
            return `<div class="cal-event-card cal-event-card--deadline" style="border-left-color:${color}">
              <div class="cal-deadline-title">Финальная сдача</div>
            </div>`;
          }

          const meta = ev.meta || [ev.hours, TYPES[ev.type].label].filter(Boolean).join(' · ');
          const price = ev.price
            ? `<span class="cal-event-price">${ev.price}</span>`
            : '';
          return `<div class="cal-event-card" style="border-left-color:${color}">
            <div>
              <div class="cal-event-title">${ev.title}</div>
              <div class="cal-event-meta">${meta}</div>
            </div>
            ${price}
          </div>`;
        })
        .join('');
  }

  function renderDetailPlaceholder() {
    if (!selectedKey || !EVENTS[selectedKey]) {
      detailEl.innerHTML = '';
    }
  }

  function goMonth(delta) {
    const idx = monthIndex(viewYear, viewMonth) + delta;
    if (idx < 0 || idx >= MONTHS.length) return;
    viewYear = MONTHS[idx].y;
    viewMonth = MONTHS[idx].m;
    selectedKey = null;
    render();
  }

  function render() {
    EVENTS = computeEvents();
    renderTabs();
    renderNav();
    renderLegend();
    renderGrid();
    renderNote();
    renderDetailPlaceholder();
  }

  prevBtn.addEventListener('click', () => goMonth(-1));
  nextBtn.addEventListener('click', () => goMonth(1));

  let touchStartX = 0;
  viewport.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  viewport.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) < 50) return;
      goMonth(dx < 0 ? 1 : -1);
    },
    { passive: true }
  );

  // Called by estimate.js whenever the live checkboxes change.
  window.calendarSetLive = function (bassLive, drumsLive) {
    liveState.bass = !!bassLive;
    liveState.drums = !!drumsLive;
    EVENTS = computeEvents();
    if (selectedKey && !EVENTS[selectedKey]) selectedKey = null;
    render();
  };

  render();

  const firstEvent = Object.keys(EVENTS).sort()[0];
  if (firstEvent) selectDay(firstEvent);
})();
