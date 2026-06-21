# Смета · 3 трека

Мобильный сайт со сметой на производство музыкального продукта.

## Локальный просмотр

Откройте `index.html` в браузере или запустите локальный сервер:

```bash
python3 -m http.server 8080
```

Затем откройте http://localhost:8080

## Публикация на GitHub Pages

1. Создайте новый репозиторий на [github.com/new](https://github.com/new) (например, `music-estimate`).

2. Загрузите код:

```bash
cd /Users/sam_bruev/Documents/music-estimate
git add .
git commit -m "Add mobile estimate site"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/music-estimate.git
git push -u origin main
```

3. В настройках репозитория: **Settings → Pages → Source → Deploy from branch → main / (root)**.

4. Сайт будет доступен по адресу:
   `https://ВАШ_ЛОГИН.github.io/music-estimate/`
