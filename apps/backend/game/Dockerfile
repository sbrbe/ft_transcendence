FROM node:22-alpine

RUN apk add --no-cache sqlite openssl

WORKDIR /app

COPY package.json ./

RUN npm cache clean --force && npm install

COPY . .

RUN mkdir -p /app/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /app/ssl/key.pem \
        -out /app/ssl/cert.pem \
        -subj "/C=FR/ST=Occitanie/L=Perpignan/O=42School/CN=localhost"

RUN if [ -f ".env" ]; then echo "Fichier .env trouvé et copié"; else echo "Aucun fichier .env trouvé, utilisation des variables d'environnement Docker"; fi

EXPOSE 4000 4443

ENV NODE_ENV=production
ENV PORT=4000
ENV HTTPS_PORT=4443
ENV HOST=0.0.0.0
ENV SSL_KEY_PATH=/app/ssl/key.pem
ENV SSL_CERT_PATH=/app/ssl/cert.pem

CMD ["npm", "start"]