# EDISON TRICK · Смета

Мобильный сайт со сметой на производство 3 треков группы **EDISON TRICK**.

Исполнитель: **Sam Bruev**

## Локальный просмотр

Откройте `index.html` в браузере или запустите локальный сервер:

```bash
python3 -m http.server 8080
```

Затем откройте http://localhost:8080

## Публикация на GitHub Pages

Репозиторий: [SamBruev/EDISON-TRICK-Estimate-](https://github.com/SamBruev/EDISON-TRICK-Estimate-)

**Live:** https://sambruev.github.io/EDISON-TRICK-Estimate-/

Деплой — автоматически при push в `main` (GitHub Pages, branch `main` / root). Файл `.nojekyll` отключает Jekyll-сборку: отдаётся статический `index.html` как есть.

Если сайт не открывается: **Settings → Pages → Build and deployment → Source → Deploy from a branch → main / (root)**. Не включайте одновременно «GitHub Actions» и branch deploy — достаточно branch deploy.
