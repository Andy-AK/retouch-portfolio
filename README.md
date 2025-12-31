# Портфолио ретушера (one-page, GH Pages ready)

Статический лендинг без сборки: все данные — в JSON, изображения лежат в `assets/img`. Навигация, сетки и лайтбокс собираются на клиенте из этих файлов.

## Структура
- `index.html` — страница с подключениями стилей/скриптов.
- `assets/data/site.json` — тексты (бренд, секции, контакты).
- `assets/data/works.json` — карточки работ с путями к превью/фулам.
- `assets/img/previews/{section}/...` — 4:3 webp превью (after/before, 800/1200).
- `assets/img/full/{section}/...` — avif full (after/before, 1600/2560).
- `assets/vendor/photoswipe` и `assets/vendor/vanta` — локальные библиотеки.

## Как добавить новую работу
1. Файлы лежат по секциям (пример: `02_Product`, `03_Fashion`, `04_Cinematic`, `05_Compositing`, `06_AI-Assisted`) с префиксами `pro / fas / cin / com / ais`. Форматы сейчас `.jpg`:
   - Превью AFTER: `assets/img/previews/<folder>/_after_800/<prefix>XXX_after_800.jpg` и `_after_1200/..._after_1200.jpg`  
     (если 1200 нет, можно продублировать 800 или положить before1200 — скрипт подхватит)
   - Превью BEFORE (для hover): берутся из `_before_1600` или `_before_2560` в `assets/img/full/<folder>/...`.
   - Full AFTER: `_after_1600` и `_after_2560` в `assets/img/full/<folder>/`.
   - Full BEFORE: `_before_1600` (имена без нижнего подчеркивания, например `pro001_before1600.jpg`) и `_before_2560`.
2. Откройте `assets/data/works.json` и добавьте объект с нужными путями. Пример:
   ```json
   {
     "id": "product-017",
     "section": "product", // id из site.json
     "order": 17,
     "alt": "Product retouch 17",
     "previewAfter": {
       "sources": [
         { "src": "assets/img/previews/02_Product/_after_800/pro017_after_800.jpg", "w": 800 },
         { "src": "assets/img/previews/02_Product/_after_1200/pro017_after_1200.jpg", "w": 1200 }
       ],
       "sizes": "(min-width: 1280px) 24vw, (min-width: 960px) 32vw, (min-width: 640px) 48vw, 92vw",
       "aspect": "4/3"
     },
     "previewBefore": {
       "sources": [
         { "src": "assets/img/full/02_Product/_before_1600/pro017_before1600.jpg", "w": 1600 },
         { "src": "assets/img/full/02_Product/_before_2560/pro017_before_2560.jpg", "w": 2560 }
       ],
       "sizes": "(min-width: 1280px) 24vw, (min-width: 960px) 32vw, (min-width: 640px) 48vw, 92vw",
       "aspect": "4/3"
     },
     "fullAfter": {
       "sources": [
         { "src": "assets/img/full/02_Product/_after_1600/pro017_after_1600.jpg", "w": 1600 },
         { "src": "assets/img/full/02_Product/_after_2560/pro017_after_2560.jpg", "w": 2560 }
       ],
       "largest": { "src": "assets/img/full/02_Product/_after_2560/pro017_after_2560.jpg", "w": 2560, "h": 1707 }
     },
     "fullBefore": {
       "sources": [
         { "src": "assets/img/full/02_Product/_before_1600/pro017_before1600.jpg", "w": 1600 },
         { "src": "assets/img/full/02_Product/_before_2560/pro017_before_2560.jpg", "w": 2560 }
       ],
       "largest": { "src": "assets/img/full/02_Product/_before_2560/pro017_before_2560.jpg", "w": 2560, "h": 1707 }
     }
   }
   ```
3. В `order` задайте позицию в секции (1 — сверху). Файл сохраняем — фронт сам перерисуется.

## Как узнать width/height (macOS)
Используйте `sips` на файле максимального размера (2560):
```bash
sips -g pixelWidth -g pixelHeight assets/img/full/product/product-17-after-2560.avif
```
Возьмите значения в `largest.w` и `largest.h`. Файлы без подчеркивания (`before1600`) тоже читаются.

## Локальный запуск
```bash
cd /path/to/retouch-portfolio
python3 -m http.server 8000
# откройте http://localhost:8000
```

## Деплой на GitHub Pages
1. Закоммитьте/запушьте репозиторий.
2. В GitHub: Settings → Pages → Source: выберите ветку `main` (или нужную) и папку `/ (root)`.
3. Сохраните — через минуту страница будет доступна на адресе GitHub Pages.

## Обновление текстов/секций
- `assets/data/site.json`: меняйте brandName/brandSubtitle/homeTagline, контакты и набор секций (`id`, `title`, `tagline`, `desktopCols`). Навигация и сетки обновятся автоматически.

## Вендоры
PhotoSwipe 5 и Vanta (three.js + effect) лежат в `assets/vendor` — никакого CDN.
