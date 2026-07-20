# next-frontend rollout

## Ports (local)

| App | Command | URL |
|-----|---------|-----|
| Next.js | `npm run dev --prefix next-frontend` | http://localhost:7777 |
| Backend | `npm run dev --prefix backend` | http://localhost:3000 |
| Strapi | `npm run dev --prefix cms` | http://localhost:1337 |

## What runs where

| Route pattern | Next.js | Notes |
|---------------|---------|-------|
| `/`, `/:lang` | SSG + client landing | SEO metadata on server |
| `/collections`, `/:lang/collections` | ISR (60s) | Strapi list |
| `/collections/:slug`, `/:lang/collections/:slug` | ISR + CSR detail | Import cards still client |
| `/ecosystem`, `/:lang/ecosystem` | ISR | |
| `/ecosystem/:slug`, `/:lang/ecosystem/:slug` | ISR + CSR detail | |
| `/p/:slug`, `/:lang/p/:slug` | ISR | Strapi pages |
| `/learn/**` | CSR only | `src/legacy` modules (`@/` alias) |
| `/signin`, `/signup` | CSR | |

## Production (nginx example)

```nginx
# Next app
location / {
  proxy_pass http://127.0.0.1:7777;
}

# API / CMS unchanged
location /api/ {
  proxy_pass http://127.0.0.1:3000/;
}
location /cms/ {
  proxy_pass http://127.0.0.1:1337/;
}
```

## Env

Copy `next-frontend/.env.example` to `next-frontend/.env.local`.

Backend and Strapi **do not require code changes** for this rollout; only proxy/env if hostnames change.

UI for the learn flow lives in `next-frontend/src/legacy` (`@/` alias).
