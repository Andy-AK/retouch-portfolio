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
1. Подготовьте файлы (именуйте последовательно, например `product-17-after-800.webp` и т.д.):
   - Превью AFTER: 800w и 1200w webp → `assets/img/previews/<section>/...-after-800.webp` и `...-after-1200.webp`
   - Превью BEFORE: 800w и 1200w webp → `assets/img/previews/<section>/...-before-*.webp`
   - Full AFTER: 1600w и 2560w avif → `assets/img/full/<section>/...-after-*.avif`
   - Full BEFORE: 1600w и 2560w avif → `assets/img/full/<section>/...-before-*.avif`
   Секции: `product`, `fashion`, `cinematic`, `compositing`, `ai`.
2. Откройте `assets/data/works.json` и добавьте объект с нужными путями. Пример:
   ```json
   {
     "id": "product-17",
     "section": "product",
     "order": 17,
     "alt": "Product retouch 17",
     "previewAfter": {
       "sources": [
         { "src": "assets/img/previews/product/product-17-after-800.webp", "w": 800 },
         { "src": "assets/img/previews/product/product-17-after-1200.webp", "w": 1200 }
       ],
       "sizes": "(min-width: 1280px) 24vw, (min-width: 960px) 32vw, (min-width: 640px) 48vw, 92vw",
       "aspect": "4/3"
     },
     "previewBefore": {
       "sources": [
         { "src": "assets/img/previews/product/product-17-before-800.webp", "w": 800 },
         { "src": "assets/img/previews/product/product-17-before-1200.webp", "w": 1200 }
       ],
       "sizes": "(min-width: 1280px) 24vw, (min-width: 960px) 32vw, (min-width: 640px) 48vw, 92vw",
       "aspect": "4/3"
     },
     "fullAfter": {
       "sources": [
         { "src": "assets/img/full/product/product-17-after-1600.avif", "w": 1600 },
         { "src": "assets/img/full/product/product-17-after-2560.avif", "w": 2560 }
       ],
       "largest": { "src": "assets/img/full/product/product-17-after-2560.avif", "w": 2560, "h": 1920 }
     },
     "fullBefore": {
       "sources": [
         { "src": "assets/img/full/product/product-17-before-1600.avif", "w": 1600 },
         { "src": "assets/img/full/product/product-17-before-2560.avif", "w": 2560 }
       ],
       "largest": { "src": "assets/img/full/product/product-17-before-2560.avif", "w": 2560, "h": 1920 }
     }
   }
   ```
3. В `order` задайте позицию в секции (1 — сверху). Файл сохраняем — фронт сам перерисуется.

## Как узнать width/height (macOS)
Используйте `sips` на файле максимального размера (2560):
```bash
sips -g pixelWidth -g pixelHeight assets/img/full/product/product-17-after-2560.avif
```
Возьмите значения в `largest.w` и `largest.h`.

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
