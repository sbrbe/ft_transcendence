FROM node:22

WORKDIR /app

# 1) Dépendances racine (tu as TypeScript et les types ici)
COPY package*.json ./
RUN npm ci

# 2) Sources
COPY backend ./backend
COPY users ./users
# 👉 on ajoute le moteur (cas B)
COPY frontend/engine_play ./frontend/engine_play

# 4) CMD par défaut (sera écrasé par docker-compose: command:)
CMD ["node","-e","console.log('Use docker-compose command')"]
