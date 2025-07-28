FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY backend ./backend
COPY users ./users
COPY chat ./chat

CMD ["node"]
