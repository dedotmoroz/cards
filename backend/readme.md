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
- Для **Google Sheets** (импорт/экспорт): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (например `http://localhost:3000/auth/google/sheets/callback`), `FRONTEND_URL` (например `http://localhost:8888`). **Обязательно применить миграцию** `drizzle/0004_google_sheets_tokens.sql` (таблица `google_sheets_tokens`), иначе подключение не сохранится. В [Google Cloud Console](https://console.cloud.google.com/) для проекта должны быть включены **Google Sheets API** и **Google Drive API** (список таблиц при импорте). OAuth запрашивает доступ к таблицам и метаданным Drive (`drive.metadata.readonly`).
- Для **публикации в Strapi** (`POST /publish/page`, `POST /publish/collection`): `STRAPI_API_TOKEN` (API token из Strapi). Опционально `STRAPI_CMS_URL` — базовый URL CMS (по умолчанию `https://cms.kotcat.com`). Без токена маршруты публикации не регистрируются.

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

