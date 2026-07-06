# next-frontend

Next.js App Router app running **alongside** the legacy Vite `frontend`.

- **SSR/SSG/ISR**: landing, Strapi pages (`/p/...`), collections, ecosystem
- **CSR**: cards and learn flow (`/learn/**`) via `@/` imports from `src/legacy` (copy of Vite UI; independent from `frontend/`)
- **Global card search**: 🔍 in the folders sidebar → dialog with debounced query (min 2 chars) → `GET /cards/search` on backend → click a result to open `/learn/{userId}/{folderId}?cardId={id}` with scroll and highlight

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:7777 (backend on :3000, Strapi on :1337)

**Google Sign-In:** set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local` (same as `VITE_GOOGLE_CLIENT_ID` for the Vite app). Without it the Google button is hidden on `/signin` and in the login dialog.

See [ROLLOUT.md](./ROLLOUT.md) for parallel deployment with the old frontend.


