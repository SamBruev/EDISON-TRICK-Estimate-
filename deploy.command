#!/bin/bash
# Двойной клик по этому файлу в Finder = выложить сайт.
# Снимает застрявшие git-замки, коммитит все изменения и пушит в main.
cd "$(dirname "$0")" || exit 1

echo "▶ Папка: $(pwd)"
find .git -name '*.lock' -delete 2>/dev/null

git add -A

MSG="${1:-Обновление сайта $(date '+%Y-%m-%d %H:%M')}"
if git diff --cached --quiet; then
  echo "Нет новых изменений для коммита."
else
  git commit -m "$MSG" && echo "✓ Коммит создан"
fi

echo "▶ Пушу в GitHub…"
if git push origin main; then
  echo ""
  echo "✅ Готово! Сайт обновится через 1–2 минуты:"
  echo "   https://sambruev.github.io/EDISON-TRICK-Estimate-/"
else
  echo ""
  echo "⚠ Пуш не прошёл. Проверь интернет/доступ к GitHub и запусти ещё раз."
fi

echo ""
echo "Можно закрыть это окно."
