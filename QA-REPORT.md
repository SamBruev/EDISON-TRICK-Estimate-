# QA-отчёт · EDISON TRICK Estimate

**Дата:** 21 июня 2026  
**Исполнитель:** QA / code review агент  
**Live:** https://sambruev.github.io/EDISON-TRICK-Estimate-/  
**Локально:** `python3 -m http.server 8080` → http://localhost:8080/

---

## Executive summary

Сайт в хорошем состоянии: разметка и JS согласованы, математика сметы для всех четырёх комбинаций чекбоксов верна, календарь и деплой GitHub Pages работают. Критических ошибок (P0) не найдено — суммы, якоря навигации и обязательные DOM-id на месте. Исправлены три проблемы уровня P1: блокировка масштабирования в viewport, неполное уважение `prefers-reduced-motion`, отсутствие защиты от падения `calendar.js` при отсутствии DOM. Визуальную регрессию на viewport 320–428 px и интерактив в браузере проверить не удалось — MCP-браузер недоступен; локальный сервер и live URL отдают HTTP 200, assets доступны. Главные оставшиеся риски — производительность фиксированного blur-фона на слабых телефонах и touch-targets календарных кнопок (< 44 px). **Выпускать можно** после 5-минутной ручной проверки Sam на телефоне.

---

## Findings table

| ID | Severity | Область | Файл | Проблема | Как воспроизвести | Рекомендация | Статус |
|----|----------|---------|------|----------|-------------------|--------------|--------|
| Q-001 | P1 | a11y | `index.html` | `maximum-scale=1, user-scalable=no` блокирует pinch-zoom (WCAG 1.4.4) | iOS Safari → попытка увеличить страницу | Убрать ограничения масштаба из viewport | **fixed** |
| Q-002 | P1 | a11y | `index.html` | `prefers-reduced-motion` отключал только bump-анимации цен, но не smooth scroll и fade логотипа | Системные настройки «Уменьшить движение» → скролл hero | Расширить media query: `scroll-behavior: auto`, статичный логотип | **fixed** |
| Q-003 | P1 | JS | `calendar.js` | Нет early return при отсутствии DOM-элементов — возможен crash на `tabsEl.innerHTML` | Удалить `#calMonthTabs` из HTML | Guard на обязательные элементы | **fixed** |
| Q-004 | P2 | perf | `assets/` | `symbol.png` и `top-lamp-bg.png` — один файл (MD5 совпадает, ~545 KB × 2 запроса) | Network tab → два PNG с одним hash | Дедуплицировать: один файл + CSS references | open |
| Q-005 | P2 | perf | `assets/top-logo.png` | 3000×2178 px (~88 KB) — oversize для mobile-first | Lighthouse / Network | Экспорт @2x ~1500 px или WebP | open |
| Q-006 | P2 | perf | `index.html` | `body::before` с `filter: blur(16px)` на fixed-слое — риск jank на слабых GPU | Скролл на старом Android | Зафиксировать риск; опционально static gradient без blur | open |
| Q-007 | P2 | a11y | `index.html` | `.cal-nav` 36×36 px (< 44 px touch target) | Тап по ‹ › на iPhone | Увеличить до min 44×44 или padding hit-area | open |
| Q-008 | P2 | a11y | `index.html` | Nav-ссылки ~27 px по высоте (padding 8px) | Тап по пунктам nav | Увеличить vertical padding до 12–14 px | open |
| Q-009 | P2 | a11y | `index.html` | `:focus` на nav без `:focus-visible` — outline при mouse click на части браузеров | Tab vs click по nav | Добавить `:focus-visible` стили | open |
| Q-010 | P2 | infra | `.github/workflows/pages.yml` | Artifact path `.` заливает в Pages все файлы репо (README, prompts) при коммите | Добавить `QA-AGENT-PROMPT.md` в git → URL на Pages | Ограничить path или `.pagesignore` / отдельная папка `site/` | open |
| Q-011 | P3 | assets | `assets/` | `descript_*.png`, `logo.svg`, `hero-logo.svg` не используются в `index.html` | grep по HTML | Удалить или подключить | open |
| Q-012 | P3 | CSS | `index.html` | Мёртвый класс `.hero-performer` | grep | Удалить | open |
| Q-013 | P3 | CSS | `index.html` | Дублирующиеся правила `.variant-toggle.is-live` (background + box-shadow) | DevTools | Объединить в одно правило | open |

---

## Матрица тестов (4 комбинации чекбоксов)

Базовая формула: `total = 280 000 + drums + bass`, скидка 20%, этапы 50/20/30% от `finalPrice`.

| Бас live | Барабаны live | Барабаны | Бас | total | discount | finalPrice | step1 | step2 | step3 | Actual (код) |
|:--:|:--:|--:|--:|--:|--:|--:|--:|--:|--:|:--|
| off | off | 30 000 | 15 000 | 325 000 | 65 000 | **260 000** | 130 000 | 52 000 | 78 000 | ✓ match |
| on | off | 30 000 | 27 000 | 337 000 | 67 400 | **269 600** | 134 800 | 53 920 | 80 880 | ✓ match |
| off | on | 60 000 | 15 000 | 355 000 | 71 000 | **284 000** | 142 000 | 56 800 | 85 200 | ✓ match |
| on | on | 60 000 | 27 000 | 367 000 | 73 400 | **293 600** | 146 800 | 58 720 | 88 080 | ✓ match |

Сумма этапов = `finalPrice` во всех комбинациях (округление согласовано).

**Проверенные DOM-поля (estimate.js → HTML):** все 24 id из JS найдены в HTML, дубликатов id нет. Якоря nav `#variants` … `#result` соответствуют `<section id>`.

**Календарь (статически):** все даты EVENTS валидны; MONTHS (июн–окт 2026) покрывают все события; каждый `ev.type` есть в `TYPES`; offset недели с понедельника корректен для июня 2026.

---

## Исправления

| Файл | Изменение |
|------|-----------|
| `index.html` | Viewport: убраны `maximum-scale=1`, `minimum-scale=1`, `user-scalable=no` — разрешён pinch-zoom |
| `index.html` | `@media (prefers-reduced-motion: reduce)`: добавлены `scroll-behavior: auto`, статичный `.top-logo-brand`, скрыт blur-слой логотипа |
| `calendar.js` | Early return, если отсутствуют `#calMonthTabs`, `#calGrid`, `#calViewport` и др. |

Коммит не создан (не запрашивался).

---

## Рекомендации на будущее

- **Unit-тесты** для `calcState()` (4 комбинации + сумма этапов).
- **E2E smoke** (Playwright): загрузка, toggle обоих чекбоксов, календарь prev/next, якоря nav.
- **eslint** + **htmlhint** в CI.
- **Оптимизация assets:** один lamp PNG, resize `top-logo.png`, WebP с PNG fallback.
- **Деплой:** artifact только из корня сайта (без markdown/prompts).
- **a11y:** `:focus-visible`, touch targets ≥ 44 px для `.cal-nav`.

---

## Что проверить Sam вручную за 5 минут

1. Открыть сайт на телефоне — нет белого экрана / ошибок в консоли.
2. Покликать «Бас вживую» / «Барабаны вживую» — итоговые суммы **со скидкой**: 260k / 269.6k / 284k / 293.6k (полные: 325k / 337k / 355k / 367k).
3. Footer показывает **260 000 ₽** при дефолте.
4. Календарь — клик по дням с точками, легенда читается; свайп месяца.
5. Nav — все ссылки скроллят к секциям; при скролле подсвечивается активный пункт.
6. *(После деплоя фиксов)* Pinch-zoom работает; при «Уменьшить движение» логотип не анимируется при скролле.

---

## Ограничения проверки

| Область | Метод | Статус |
|---------|--------|--------|
| Статический анализ HTML/JS/CSS | Прочитаны все файлы, скрипт сверки id | ✓ |
| Математика сметы | Node-скрипт, 4 комбинации | ✓ |
| HTTP / assets | curl localhost:8080 + GitHub Pages | ✓ |
| Консоль браузера, viewport 320–428 px, swipe, scroll UX | MCP browser недоступен | **требует ручной проверки** |
| Lighthouse / perf profiling | Не запускался | **требует ручной проверки** |

---

*Связанные документы: `QA-AGENT-PROMPT.md`, `DESIGN-AUDIT.md`, `README.md`*
