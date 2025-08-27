FROM node:22 AS build

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci --no-audit --no-fund --include=dev --silent || npm i --silent

COPY frontend/. .

RUN npx vite build --logLevel warn

FROM nginx:1.28

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/certs/selfsigned.crt /etc/ssl/certs/selfsigned.crt
COPY nginx/certs/selfsigned.key /etc/ssl/certs/selfsigned.key
COPY nginx/pki/ca/ca.crt /etc/nginx/ca/ca.crt

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]