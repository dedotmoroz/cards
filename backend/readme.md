# 📐 Flashcards App Core

🧱️ Это ядро приложения для изучения слов через карточки. Реализовано по принципам **гексагональной архитектуры (Hexagonal Architecture)**, также известной как **Ports and Adapters**.

---

## 🛡️ Архитектура

```
          +------------------+
          |     Adapters     | ← Web, Telegram, DB
          +------------------+
                   ↑ ↓
          +------------------+
          |      Ports       | ← Interfaces (CardRepository, и др.)
          +------------------+
                   ↑ ↓
          +------------------+
          |   Application    | ← Use Cases, сервисы (CardService)
          +------------------+
                   ↑ ↓
          +------------------+
          |      Domain      | ← Сущности (Card, Folder), бизнес-логика
          +------------------+
```

---

## 📂 Структура

```
src/
├── domain/              # Card, Folder и логика внутри
├── application/         # CardService, FolderService
├── ports/               # Интерфейсы (CardRepository, и др.)
└── adapters/            # (будет позже) TelegramBot, DB, Web
```

---

## 🧪 Тестирование

```
npm test
```

Используется `ts-jest`, конфиг в `jest.config.ts`.

---

## 🛠️ Зависимости

- `typescript`
- `jest`, `ts-jest`, `@types/jest`
- `ts-node` (для подключения `jest.config.ts`)

---

## 🌐 Переменные окружения

- `AI_SERVICE_URL` — базовый URL внешнего сервиса генерации (по умолчанию `http://localhost:4000`)
- `JWT_SECRET` — секрет для подписи JWT (обязателен)
- `TURNSTILE_SECRET_KEY` — секрет Cloudflare Turnstile для проверки капчи при регистрации (`POST /auth/register`). Обязателен для успешной регистрации: без него проверка токена капчи не пройдёт.
- Для **Google Sheets** (импорт и экспорт через Picker): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (для вызова Sheets API с переданным access token), `FRONTEND_URL`. На frontend: `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_API_KEY` для Google Picker и GIS (`drive.file`). В [Google Cloud Console](https://console.cloud.google.com/) включите **Google Sheets API**, **Google Drive API** и **Google Picker API**; в consent screen — scope `drive.file` (без `spreadsheets`). Импорт/экспорт: GIS token в заголовке `x-google-picker-access-token` на `GET .../sheet-titles`, `POST .../import/google` и `POST .../export/google` (`mode: new` — новая таблица, `mode: existing` — запись в выбранную через Picker). Опционально: миграция `drizzle/0004_google_sheets_tokens.sql` и OAuth `/auth/google/sheets` — legacy; для импорта/экспорта токены в БД не нужны.
- Для **публикации в Strapi** (`POST /publish/page`, `POST /publish/collection`): `STRAPI_API_TOKEN` (API token из Strapi). Опционально `STRAPI_CMS_URL` — базовый URL CMS (по умолчанию `https://cms.kotcat.com`). Без токена маршруты публикации не регистрируются.

---

## 🛠️ Админка

Админка живёт в основном backend и frontend как набор маршрутов `/admin/*` и SPA-страниц `/admin`, `/admin/users/:id`. Доступ выдаётся через таблицу `admin_users`.

### Применение миграции

Миграция `drizzle/0005_admin.sql` добавляет колонку `users.last_login_at` и таблицы `admin_users`, `admin_audit_log`. Если используете `drizzle-kit push`, схема применится автоматически. Иначе примените SQL вручную:

```bash
psql "$DATABASE_URL" -f drizzle/0005_admin.sql
```

### Назначение первого админа

Список админов хранится в `admin_users`. Чтобы выдать роль админа существующему пользователю:

```sql
INSERT INTO admin_users (user_id) VALUES ('<USER_UUID>');
```

Узнать `user_id` можно по email:

```sql
SELECT id, email FROM users WHERE email = 'you@example.com';
```

После этого пользователь увидит маршрут `/admin` в SPA, а его cookie `token` будет проходить декоратор `requireAdmin` на роутах `/admin/*`.

### Что умеет админка

- `GET /admin/users` — список всех пользователей со счётчиками папок и карточек, датой регистрации и последнего входа.
- `GET /admin/users/:id/stats` — детальная статистика по пользователю (папки, карточки, выученные карточки).
- `DELETE /admin/users/:id` — каскадное удаление пользователя со всеми его данными. Запрещено удалять самого себя и других админов.
- `POST /admin/users/:id/impersonate` — выдаёт отдельный cookie `impersonation_token` (TTL 1 час, JWT с полями `userId`, `impersonatedBy`, `type=impersonation`). Декоратор `authenticate` приоритетно использует этот токен — все остальные роуты видят запросы как от пользователя-жертвы. Запрещено impersonate-ить себя или другого админа.
- `POST /admin/impersonate/stop` — очищает `impersonation_token`, возвращая админа к собственной сессии.

Все мутации (`delete_user`, `impersonate_start`, `impersonate_stop`) пишутся в `admin_audit_log`.

---

## 📌 Принцип

- Ядро (`domain`, `application`, `ports`) **не зависит от фреймворков**
- Внешний мир подключается через **ports**
- Логика изолирована, легко тестируется

---

## 📍 Следующий шаг

🔹 Реализовать адаптеры:


- Telegram Bot
- Web API (например, Express)
- БД-хранилище (например, Prisma, SQLite)

