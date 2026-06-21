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

Деплой — автоматически при push в `main`.

**Live:** https://sambruev.github.io/EDISON-TRICK-Estimate-/

В **Settings → Pages → Build and deployment → Source** выберите **GitHub Actions** (рекомендуется, workflow `.github/workflows/pages.yml`). Если выбран «Deploy from a branch», Jekyll тоже будет собирать сайт — тогда держите только branch deploy и удалите workflow.

Файл `.nojekyll` отключает Jekyll-обработку HTML.
