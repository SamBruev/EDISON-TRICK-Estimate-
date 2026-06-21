# Задание для QA / code review агента · EDISON TRICK Estimate

## Контекст

**Проект:** статический одностраничный сайт — интерактивная смета на производство 3 песен (EDISON TRICK, Sam Bruev).

**Live:** https://sambruev.github.io/EDISON-TRICK-Estimate-/  
**Repo:** https://github.com/SamBruev/EDISON-TRICK-Estimate-

**Файлы:**
| Файл | Роль |
|------|------|
| `index.html` | Разметка + CSS (~2000 строк) |
| `estimate.js` | Пересчёт суммы, варианты «вживую», анимации |
| `calendar.js` | Календарь событий, легенда, детали дня |
| `logo-scroll.js` | Reveal логотипа при скролле |
| `nav-scroll.js` | Подсказки горизонтального скролла навигации |
| `assets/` | Изображения (логотип, лампа, symbol.png) |
| `.github/workflows/pages.yml` | Деплой GitHub Pages |

**Стек:** HTML, CSS, vanilla JS. Без сборщика, без TypeScript, без тестов (пока).

---

## Промпт для агента (скопировать целиком)

```
Ты — senior QA engineer + frontend reviewer. Тебе передали статический сайт-смету (EDISON TRICK Estimate). Твоя задача — максимально грамотно проверить код, логику, вёрстку и поведение; найти все реальные и потенциальные ошибки; исправить критичное; оформить отчёт.

## 1. Подготовка

1. Клонируй / открой репозиторий и прочитай все файлы:
   - index.html
   - estimate.js
   - calendar.js
   - logo-scroll.js
   - nav-scroll.js
   - .github/workflows/pages.yml
   - assets/ (наличие файлов, битые пути)

2. Открой live-сайт и локально (если можешь):
   https://sambruev.github.io/EDISON-TRICK-Estimate-/
   python3 -m http.server 8080

3. Не ограничивайся поверхностным просмотром — проверяй связки HTML ↔ JS ↔ CSS.

---

## 2. Статический анализ кода

### HTML / разметка
- [ ] Все `id`, используемые в JS, существуют в HTML (сверь estimate.js и calendar.js с index.html).
- [ ] Нет дублирующихся `id`.
- [ ] Якоря навигации (`#variants`, `#summary`, `#schedule`, `#dates`, `#payment`, `#terms`, `#result`) соответствуют реальным `section id`.
- [ ] Порядок подключения скриптов корректен (DOM готов до выполнения).
- [ ] Семантика: `section`, `nav`, `main`, `label` + `input`, `aria-label` где нужно.
- [ ] Inline-стили — только оправданные; нет конфликтов с CSS-классами.
- [ ] Все `assets/*` пути валидны и файлы существуют.

### CSS
- [ ] Нет неиспользуемых классов, которые вводят в заблуждение (по возможности).
- [ ] `prefers-reduced-motion` — анимации отключаются там, где задано.
- [ ] `@supports not (backdrop-filter)` — fallback для glass.
- [ ] Fixed footer не перекрывает контент (padding-bottom у body/main).
- [ ] Safe area (`env(safe-area-inset-*)`) на iPhone.
- [ ] Нет опечаток в custom properties (`--glass-*`, `--top-logo-*`).
- [ ] Z-index: логотип, nav, footer не конфликтуют.
- [ ] Touch targets ≥ 44px где интерактив.
- [ ] Горизонтальный overflow не ломает layout на 320–428px.

### JavaScript — общее
- [ ] Нет глобальных утечек и конфликтов между IIFE-модулями.
- [ ] Обработчики не вешаются дважды при повторном запуске.
- [ ] Нет необработанных `null`/`undefined` (getElementById без проверки там, где элемент обязателен).
- [ ] Нет ошибок в консоли при загрузке и при всех сценариях ниже.
- [ ] Совместимость ES5/ES6 — сайт должен работать в Safari iOS и Chrome Android.

---

## 3. Бизнес-логика estimate.js (критично)

Проверь математику вручную для **всех 4 комбинаций** чекбоксов:

| Бас live | Барабаны live | Барабаны | Бас | Итого |
|----------|---------------|----------|-----|-------|
| off | off | 30 000 | 15 000 | 325 000 |
| on | off | 30 000 | 27 000 | 337 000 |
| off | on | 60 000 | 15 000 | 355 000 |
| on | on | 60 000 | 27 000 | 367 000 |

Формулы из кода:
- `bassLivePrice = 3 × 3 × 3000 = 27 000`
- `drumsLivePrice = 3 × (3 × 5000 + 5000) = 60 000`
- `total = other(280000) + drums + bass`
- `discountAmount = round(total × 0.2)`
- `finalPrice = total - discountAmount`
- `steps = [50%, 20%, 30%]` от finalPrice (проверь, что сумма шагов = finalPrice с учётом округления)

Для каждой комбинации проверь на странице:
- heroTotal, summaryTotal, paymentFull
- rowDrumsPrice, rowBassPrice
- paymentFinal, footerAmount
- paymentStep1/2/3, paymentDiscount, paymentAlertFull
- тексты rowDrumsTitle/Meta, rowBassTitle/Meta
- dateDrumsLabel/Value, dateBassLabel/Value

Дополнительно:
- [ ] Переключение чекбоксов обновляет классы `is-live` на toggle.
- [ ] Анимации bump/flash не ломают DOM и срабатывают только при user action.
- [ ] `prevTotal` / `prevBassLive` / `prevDrumsLive` — корректная логика направления анимации.
- [ ] `formatRub` корректен для больших чисел (пробелы как разделитель тысяч).

---

## 4. calendar.js

- [ ] Все даты в EVENTS валидны (YYYY-MM-DD).
- [ ] MONTHS покрывают все месяцы с событиями.
- [ ] `TYPES` содержит тип для каждого `ev.type` в EVENTS.
- [ ] Рендер сетки: правильный offset первого дня недели (Пн = начало).
- [ ] Классы `has-event`, `has-recording`, `deadline`, `selected` применяются верно.
- [ ] Легенда показывает только используемые типы.
- [ ] `colorMark()` / inline colors — валидный CSS, нет XSS (данные статичны — ок).
- [ ] Prev/Next disabled на границах MONTHS.
- [ ] Swipe на viewport переключает месяц (touchstart/touchend).
- [ ] `selectDay` на первом событии при загрузке — не ломает UX.
- [ ] cal-note показывается только для viewMonth === 8 (сентябрь).
- [ ] Если элемент DOM отсутствует — скрипт не падает (tabsEl, gridEl и т.д.).

---

## 5. logo-scroll.js + nav-scroll.js

- [ ] `--top-logo-reveal` обновляется при scroll и resize.
- [ ] RAF throttling не пропускает финальное состояние.
- [ ] При scrollY > SCROLL_RAMP reveal = 0, при 0 = 1.
- [ ] nav-scroll: классы can-scroll / can-scroll-left / can-scroll-right корректны.
- [ ] Early return если нет nav-scroll-wrap или section-nav — estimate/calendar всё равно работают.

---

## 6. Визуальная регрессия (ручная)

Проверь viewport:
- 320px (узкий iPhone SE)
- 375px (iPhone)
- 428px (iPhone Plus)
- 768px (планшет)
- 1024px+ (desktop — сайт mobile-first, но не должен ломаться)

Сценарии:
1. Загрузка страницы — все суммы дефолтные, календарь открыт на первом событии.
2. Включить «Бас вживую» — суммы, тексты, Record-точка, анимация.
3. Включить «Барабаны вживую» — то же.
4. Оба включены / оба выключены.
5. Скролл вниз — логотип fade, nav sticky, footer fixed.
6. Горизонтальный скролл nav — hints blink.
7. Календарь: смена месяца, выбор дня, deadline с лампой.
8. Якорные ссылки nav ведут к секциям.

---

## 7. Доступность (a11y)

- [ ] Конtrast текста на чёрном (WCAG AA где возможно).
- [ ] Checkbox доступны с клавиатуры (Tab + Space).
- [ ] `aria-label` на чекбоксах и cal-nav.
- [ ] Focus visible на интерактивных элементах.
- [ ] `prefers-reduced-motion` respected.
- [ ] Не полагаться только на цвет в календаре (есть точки + текст в detail).

---

## 8. Performance

- [ ] Нет тяжёлых repaints при scroll (проверь will-change, filter на body::before).
- [ ] Изображения не oversized (top-lamp-bg.png, top-logo.png — разумный вес).
- [ ] Нет блокирующих скриптов в head без defer (скрипты в конце body — ок).
- [ ] Fixed background + blur не вызывает jank на слабом телефоне (зафиксируй риск).

---

## 9. Деплой и инфра

- [ ] `.github/workflows/pages.yml` — artifact path `.` не включает лишнее (.git не попадает в artifact — ок).
- [ ] GitHub Pages отдаёт index.html по корню.
- [ ] Относительные пути assets работают на Pages (base URL с trailing slash).
- [ ] Нет секретов / .env в репо.

---

## 10. Формат отчёта (обязательно)

Создай markdown-отчёт `QA-REPORT.md` со структурой:

### Executive summary
3–5 предложений: общее состояние, можно ли выпускать, главные риски.

### Findings table
| ID | Severity | Область | Файл | Проблема | Как воспроизвести | Рекомендация | Статус |
|----|----------|---------|------|----------|-------------------|--------------|--------|
| Q-001 | P0/P1/P2/P3 | ... | ... | ... | ... | ... | open/fixed |

Severity:
- **P0** — ломает сайт / неверные суммы / JS crash
- **P1** — серьёзный UX/a11y баг
- **P2** — заметный, но некритичный
- **P3** — косметика / tech debt

### Матрица тестов
Таблица 4 комбинаций чекбоксов: expected vs actual.

### Исправления
Список коммитов / diff, если ты что-то починил.

### Рекомендации на будущее
- unit-тесты для calcState
- e2e smoke (Playwright)
- eslint / htmlhint
- и т.д.

---

## 11. Правила работы

- **Исправляй P0 и P1 сам**, если можешь — минимальный diff, без рефакторинга ради рефакторинга.
- **Не меняй бизнес-условия** (скидка 20%, тарифы, даты) без явного указания — только если нашёл ошибку в коде vs задуманное.
- **Не ломай дизайн** — багфиксы отдельно от редизайна.
- Пиши заказчику **Sam** по-русски, конкретно.
- Если инструмент недоступен (браузер MCP) — явно укажи, что проверено статически, а что требует ручной проверки.

---

## 12. Definition of Done

- [ ] Все файлы прочитаны
- [ ] Математика сметы verified для 4 комбинаций
- [ ] Консоль без errors на основных сценариях
- [ ] QA-REPORT.md создан
- [ ] P0/P1 исправлены или описаны с блокером
- [ ] Краткий список «что проверить Sam вручную за 5 минут»

Начни с чтения кода и сверки id HTML↔JS, затем математика estimate.js, затем календарь, затем live-проверка если доступна.
```

---

## Быстрый чеклист для Sam (5 минут)

1. Открыть сайт на телефоне — нет белых экранов / ошибок.
2. Покликать «Бас вживую» / «Барабаны вживую» — суммы 337k / 355k / 367k / 325k.
3. Footer показывает **260 000 ₽** при дефолте (со скидкой).
4. Календарь — клик по дням с точками, легенда читается.
5. Nav — все ссылки скроллят к секциям.

---

## Связанные документы

- `DESIGNER-AGENT-PROMPT.md` — задание для UX/UI агента
- `README.md` — локальный запуск и деплой

---

*Документ для передачи QA / code review агенту в Cursor или другой AI-среде.*
