# -----------------------------
# 1) prod-зависимости
# -----------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev

# -----------------------------
# 2) билд TypeScript
# -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
# ожидается, что в backend есть скрипт "build" -> tsc компилирует в ./dist
RUN npm run build

# -----------------------------
# 3) рантайм
# -----------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=5000
# ставим только prod-модули
COPY --from=deps /app/node_modules ./node_modules
# копируем собранный код
COPY --from=builder /app/dist ./dist
# чтобы npm start и версия/имя не потерялись (не критично, но полезно)
COPY backend/package*.json ./

# Открываем порт и стартуем сервер
EXPOSE 5000

# (опционально) Healthcheck: вернёт healthy, если порт отвечает
HEALTHCHECK --interval=20s --timeout=3s --retries=3 CMD \
  wget -qO- http://127.0.0.1:${PORT}/health || exit 1

# ожидается точка входа dist/index.js (поменяй при необходимости)
CMD ["node", "dist/index.js"]