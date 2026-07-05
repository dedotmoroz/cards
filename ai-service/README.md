# ai-service

## Установка
```bash
npm i
brew install redis         # macOS
brew services start redis  # или redis-server в отдельном окне

```

## Схема работы
1. **HTTP-сервис**  
   Fastify-приложение поднимается на `http://localhost:4000`. Swagger (OpenAPI) доступен по маршруту `/docs`.

2. **Создание задачи**  
   Клиент вызывает `POST /generate`, передавая цель генерации (`target`), язык (`lang`), количество примеров (`count`) и дополнительные параметры.  
   - Тело запроса валидируется через Zod.  
   - После валидации данные кладутся в очередь BullMQ (`generate`).  
   - В ответе клиент получает `jobId`.

3. **Очередь и Redis**  
   Очередь `generate` работает поверх Redis (адрес берётся из `REDIS_URL`, по умолчанию `redis://127.0.0.1:6379`).  
   Для мониторинга событий создаётся `QueueEvents`; ошибки слушателя логируются.

4. **Воркер**  
   Отдельный процесс (`src/workers/generateWorker.ts`) подписывается на ту же очередь.  
   - Для каждой задачи обновляется прогресс (5% → 100%).  
   - Основная работа — вызов `generateSentences`.
   - При успешном выполнении результат сохраняется в задаче; ошибки логируются.

5. **Интеграция с OpenAI**  
   `generateSentences` обращается к OpenAI Chat Completions (модель настраивается через `OPENAI_MODEL`, ключ — `OPENAI_API_KEY`).  
   Функция формирует промпт, просит JSON с массивом предложений вида `{ text, translation }`, парсит ответ и возвращает его воркеру.

6. **Проверка статуса**  
   Клиент может вызывать `GET /jobs/:id`, чтобы узнать состояние (`waiting`, `active`, `completed`, `failed` и др.), текущий прогресс и результат (если задача завершена).

7. **Результат**  
   После `completed` результат включает массив сгенерированных предложений; клиент использует их для создания карточек/вспомогательных данных.

## Контекстное чтение и TTS

1. **POST /generate-context** — ставит задачу в очередь `context`.
2. **context-worker** — генерирует текст (`generateContextText`), затем mp3 через OpenAI TTS (`contextAudioService`).
3. **GET /jobs/:id?queue=context** — статус и `{ text, translation, hasAudio }`.
4. **GET /jobs/:id/audio?queue=context** — mp3 основного текста (если `hasAudio=true`).

### Переменные окружения (TTS)

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | ключ OpenAI (общий с chat) |
| `OPENAI_TTS_MODEL` | `tts-1` | `tts-1-hd` для лучшего качества |
| `OPENAI_TTS_VOICE` | `nova` | alloy, echo, fable, onyx, nova, shimmer |
| `AUDIO_STORAGE_DIR` | `./data/context-audio` | каталог mp3 |

### Docker volume (обязательно для TTS)

API (`ai`) и worker (`ai-worker-context`) должны использовать **один и тот же** volume:

```yaml
services:
  ai:
    environment:
      AUDIO_STORAGE_DIR: /app/data/context-audio
    volumes:
      - context-audio:/app/data/context-audio

  ai-worker-context:
    environment:
      AUDIO_STORAGE_DIR: /app/data/context-audio
    volumes:
      - context-audio:/app/data/context-audio

volumes:
  context-audio:
```

## Документация


После запуска сервиса Swagger UI доступен по адресу http://localhost:4000/docs