# Parallel rollout: `frontend` (Vite) + `next-frontend` (Next.js)

## Ports (local)

| App | Command | URL |
|-----|---------|-----|
| Legacy Vite | `npm run dev --prefix frontend` | http://localhost:8888 |
| Next.js | `npm run dev --prefix next-frontend` | http://localhost:7777 |
| Backend | `npm run dev --prefix backend` | http://localhost:3000 |
| Strapi | `npm run dev --prefix cms` | http://localhost:1337 |

## What runs where

| Route pattern | Next.js | Notes |
|---------------|---------|-------|
| `/`, `/:lang` | SSG + client landing | SEO metadata on server |
| `/collections`, `/:lang/collections` | ISR (60s) | Strapi list |
| `/collections/:locale/:slug` | ISR + CSR detail | Import cards still client |
| `/ecosystem`, `/:lang/ecosystem` | ISR | |
| `/ecosystem/:locale/:slug` | ISR + CSR detail | |
| `/p/:locale/:slug` | ISR | Strapi pages |
| `/learn/**` | CSR only | `src/legacy` modules (`@/` alias) |
| `/signin`, `/signup` | CSR | |

## Production switch (nginx example)

Serve Next on `/` and keep legacy as fallback during migration:

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

Optional: route only migrated paths to Next first (`/collections`, `/ecosystem`, `/p/`), keep `/learn` on Vite until QA passes.

## Env

Copy `next-frontend/.env.example` to `next-frontend/.env.local`.

Backend and Strapi **do not require code changes** for this rollout; only proxy/env if hostnames change.

`next-frontend` no longer imports from `../frontend`; UI lives in `next-frontend/src/legacy`. Changes there do not affect the Vite app unless copied manually.
