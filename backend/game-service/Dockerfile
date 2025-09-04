FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["node", "dist/server.js"]

#CMD ["node","-e","console.log('Use docker-compose command')"]
