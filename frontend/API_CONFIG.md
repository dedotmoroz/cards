# Конфигурация API

## Как это работает

Приложение автоматически использует правильный API URL в зависимости от окружения:

### Development (разработка)
- URL: `http://localhost:3000`
- Используется при запуске `npm run dev`

### Production (продакшн)
- URL: `/api` (относительный путь)
- Используется при сборке `npm run build`

## Настройка для продакшена

### Вариант 1: Nginx Proxy (рекомендуется)

Настройте Nginx для проксирования API запросов:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Вариант 2: Переменные окружения

Создайте файл `.env.production.local` в корне проекта:

```bash
VITE_API_BASE_URL=https://your-api-domain.com
```

### Вариант 3: Изменить код напрямую

Отредактируйте `src/shared/config/api.ts`:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' ? 'https://your-api-domain.com' : 'http://localhost:3000');
```

## Проверка

После деплоя откройте DevTools (F12) → Network и проверьте куда идут запросы:
- ✅ Должно быть: `/api/auth/register` или `https://your-api-domain.com/auth/register`
- ❌ Не должно быть: `http://localhost:3000/auth/register`

## CORS настройки на бэкенде

Не забудьте настроить CORS на вашем API сервере:

```javascript
// Express пример
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

