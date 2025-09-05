FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 build-essential \
	&& rm -rf /var/lib/apt/lists/*

COPY backend/game-service/package*.json ./
RUN npm ci

COPY backend/game-service/tsconfig.json ./
COPY backend/game-service/src ./src

COPY shared ./shared

RUN npm run build

RUN npm rebuild better-sqlite3 bcrypt --build-from-source || true

RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./


CMD ["node", "dist/src/server.js"]