FROM nginx:1.28

COPY nginx.conf etc/nginx/nginx.conf
COPY certs/selfsigned.crt /etc/ssl/certs/selfsigned.crt
COPY certs/selfsigned.key /etc/ssl/certs/selfsigned.key


EXPOSE 443