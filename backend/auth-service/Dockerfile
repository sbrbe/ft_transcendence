FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 build-essential curl \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN	npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

RUN npm rebuild better-sqlite3 bcrypt curl --build-from-source || true

RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./


CMD ["node", "dist/server.js"]