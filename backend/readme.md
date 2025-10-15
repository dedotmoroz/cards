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

