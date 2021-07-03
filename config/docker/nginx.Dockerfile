FROM nginx:stable-alpine

WORKDIR /etc/nginx/

COPY config/nginx/docker.nginx.conf .

RUN mv docker.nginx.conf nginx.conf

WORKDIR /var/log/nginx

RUN chown -R nobody:nobody /var/log/nginx && touch error.log && touch access.log

EXPOSE 3000
