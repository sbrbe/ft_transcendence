# Étape 1 : build du frontend
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Étape 2 : serveur Nginx
FROM nginx:stable
COPY --from=builder /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

