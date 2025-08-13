FROM node:22-alpine

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    openssl

WORKDIR /app

RUN npm install -g ts-node typescript

COPY package.json ./

RUN npm cache clean --force && npm install

COPY . .

RUN mkdir -p /app/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /app/ssl/key.pem \
        -out /app/ssl/cert.pem \
        -subj "/C=FR/ST=Occitanie/L=Perpignan/O=42School/CN=localhost"

EXPOSE 3443

ENV NODE_ENV=production
ENV PORT=3443
ENV HTTPS_PORT=3443
ENV HOST=0.0.0.0
ENV SSL_KEY_PATH=/app/ssl/key.pem
ENV SSL_CERT_PATH=/app/ssl/cert.pem

CMD ["npm", "start"]
