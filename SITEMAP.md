## Sitemap для Google

### Что сделано в репозитории

- **Strapi** теперь отдаёт sitemap по пути **`/sitemap.xml`** (через global middleware).
- Во фронте добавлены локализованные страницы списков:
  - `/{lang}/collections`
  - `/{lang}/ecosystem`

### Важно про продакшн-прокси

В проде Strapi у тебя доступен под `/cms`, но Google должен получать sitemap по **`https://kotcat.com/sitemap.xml`**.
Для этого нужно проксировать **только** этот путь на Strapi.

Пример для **Nginx**:

```nginx
location = /sitemap.xml {
  proxy_pass http://127.0.0.1:1337/sitemap.xml;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### robots.txt

Во фронте добавлен `next-frontend/public/robots.txt` со строкой:

`Sitemap: https://kotcat.com/sitemap.xml`

### Настройка base URL (опционально)

Если нужно генерировать sitemap для другого домена (стейджинг), задай переменную окружения для Strapi:

`SITE_BASE_URL=https://example.com`

