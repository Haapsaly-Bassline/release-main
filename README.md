# Release — Haapsaly Bassline

Веб-приложение для управления релизами лейбла: публичный каталог релизов, страницы альбомов с обложками, треклистами и ссылками на стриминги, а также админ-панель.

- Публичный сайт: https://release.hpsbassline.club
- Публичный API: `/api/releases`, `/api/footer`

## Стек

- Node.js (ESM) + Express 4
- Хранение данных в JSON-файлах (`data/`)
- Загрузка обложек через `multer` (`src/uploads/`)
- Server-side rendering мета-тегов Open Graph / Twitter Card для страниц альбомов
- Ванильный JS/CSS на фронтенде (без сборки)
- Vercel-конфиг (`vercel.json`) для серверного деплоя

## Структура

```
server.js              Express-сервер, API, SSR страниц альбомов
src/index.html         Публичная страница (SPA)
src/js/app.js          Логика публичной части
src/css/styles.css     Стили
src/admin-panel.html   Админ-панель
src/js/admin-panel.js  Логика админ-панели
src/uploads/           Загруженные обложки (runtime, не в git)
data/                  releases.json, footer.json и settings (runtime, не в git)
```

## Запуск

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm start              # или npm run dev — с nodemon
```

По умолчанию сервер слушает `http://localhost:1616` (порт задаётся переменной `PORT`).

На Windows есть `Release.bat` — запускает `node server.js` из папки проекта.

## Переменные окружения

| Переменная | Назначение | По умолчанию |
|---|---|---|
| `PORT` | Порт HTTP-сервера | `1616` |
| `ADMIN_PASSWORD` | Пароль входа в админ-панель | — |
| `SESSION_SECRET` | Секрет для подписи cookie сессий | случайный при старте |
| `DATA_DIR` | Каталог с JSON-данными | `data` |
| `PUBLIC_BASE_URL` | Базовый URL сайта для OG-тегов | `https://release.hpsbassline.club` |
| `SHARE_BASE_URL` | Базовый URL для ссылок «поделиться» | `https://rls.hpsbassline.club` |

`.env` в репозиторий не попадает — там реальные секреты.

## Админ-панель

- Вход: `/admin` (или скрытая иконка замка в левом верхнем углу публичной страницы)
- Управление релизами: название, артист, slug, жанры, год, треки, ссылки на сервисы, мерч, обложка, черновик/публикация
- Редактирование футера сохраняется в `data/footer.json`

## Деплой

В текущей инфраструктуре сайт стоит за Caddy: `release.hpsbassline.club` → `reverse_proxy 192.168.0.128:1500`.
Порт приложения должен совпадать с портом в Caddy.

## Лицензия

[MIT](LICENSE) © 2026 Haapsaly Bassline
