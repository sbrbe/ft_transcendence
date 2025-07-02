FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY backend ./backend
COPY users ./users

# Facultatif : build TS
# COPY tsconfig.json ./
# RUN npx tsc

CMD ["node"]
