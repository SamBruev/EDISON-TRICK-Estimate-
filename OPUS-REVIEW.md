# Промт для Opus — аудит проекта EDISON TRICK Estimate

Ты — senior front-end инженер и дизайнер с опытом ревью production-ready проектов. Проведи полный независимый аудит проекта. Будь критичен. Не пропускай мелочи.

---

## Контекст проекта

Личная смета-страница для группы **EDISON TRICK** — продакшн 3 треков. Vanilla HTML/CSS/JS, single-page, деплой на GitHub Pages.

**Live URL:** https://sambruev.github.io/EDISON-TRICK-Estimate-/

**Файлы проекта:**
- `index.html` — весь CSS inline в `<style>`, всё содержимое
- `estimate.js` — логика пересчёта цен (4 варианта чекбоксов)
- `calendar.js` — календарь с событиями июнь–октябрь 2026
- `nav-scroll.js` — IntersectionObserver для подсветки активного пункта nav
- `logo-scroll.js` — scroll-driven анимация логотипа
- `edge-refresh.js` — свайп с правого края для обновления страницы
- `assets/` — symbol.png (оранжевая лампа), et-logo.png (комбо-логотип ET), фавиконки

---

## Что проверить

### 1. Цены и математика
- `estimate.js`: BASE.other=250000, BASE.drumsMidi=30000, BASE.bassMidi=15000, скидка 20%
- Все 4 комбинации чекбоксов (бас MIDI/live, барабаны MIDI/live) должны давать корректные:
  - total, discountAmount, finalPrice, steps[0/1/2] (50%/20%/30%)
  - Сумма steps должна равняться finalPrice
- Все DOM-id из estimate.js должны существовать в index.html (проверь все 24 id)

### 2. Календарь
- Все даты в EVENTS должны быть валидны и попадать в диапазон MONTHS (июн–окт 2026)
- Текущие даты событий:
  - Репетиции: 28 июня, 5 июля
  - Барабаны MIDI: 6, 7 июля
  - Бас MIDI: 8 июля
  - Гитары: 12, 19, 26 июля, 2 авг
  - Вокал: 12, 19, 26 авг, 2 сен
  - Сведение: 8, 15, 22 сен
  - Дедлайн: 1 окт
- Каждый `ev.type` должен существовать в TYPES
- `renderDetailPlaceholder()` должен делать `innerHTML = ''` (не текст)
- Карточка deadline не должна содержать `<img src="assets/symbol.png">`

### 3. CSS / дизайн-система
- Переменные: `--time`, `--label`, `--muted`, `--border`, `--glass-bg`, `--hairline`, `--border-strong`
- `.variant-toggle.is-live .variant-check-wrap` должен показывать лампу (34×34px, symbol.png), а не квадратный чекбокс
- `.cal-detail:empty { display: none }` — пустой блок после календаря должен быть скрыт
- `.brand-watermark` width: min(780px, 98vw)
- Нет `.hero-performer` в использовании (мёртвый класс — ок если просто не используется)
- `#terms .section-title` — центрирован, с анимацией termsTitleGlow
- Секция `#bonus` присутствует с тремя карточками

### 4. SEO / мета
- `<meta name="apple-mobile-web-app-title" content="by Sam Bruev">` должен быть
- `<meta name="apple-mobile-web-app-capable" content="yes">` должен быть
- Фавиконки подключены: favicon.ico, favicon-32.png, apple-touch-icon.png

### 5. Edge-refresh анимация
- `edge-refresh.js`: EDGE=34, THRESHOLD=92, MAX_PULL=128
- `.edge-refresh-lamp` НЕ должен иметь `transition: transform` (убрали для плавности)
- Commit-таймаут: 620ms обычный / 80ms при reduced-motion
- `isBlockedTarget` блокирует nav, cal-grid, variant-toggle

### 6. Навигация
- Все якоря в nav (`#variants`, `#summary`, `#dates`, `#payment`, `#calendar`, `#terms`, `#result`, `#bonus`) должны соответствовать `<section id>` в HTML
- `nav-scroll.js` использует IntersectionObserver для active-state

### 7. Анимации
- `@keyframes variantPressAnim` — spring-эффект при нажатии на тоггл
- `@keyframes termsTitleGlow` — 3.2s пульс заголовка "Несколько важных моментов"
- `@keyframes recLampBlink` — красная точка при is-live

### 8. Footer bar
- Блок `<div class="deadline">` с "Готовность / 1 ОКТ 2026" **должен отсутствовать** — его удалили
- Остаётся только: label "Итого со скидкой 20%" + amount

---

## Формат ответа

Раздели на:
1. **✅ Всё корректно** — что проверено и в порядке
2. **⚠️ Замечания** — некритично, но стоит поправить
3. **🔴 Ошибки** — что сломано или несогласовано
4. **💡 Предложения** — что можно улучшить

Для каждой проблемы указывай: файл, строку (если возможно), что именно не так и как исправить.

Читай файлы напрямую из репозитория, не полагайся на описание выше — оно может не совпадать с реальным кодом.
