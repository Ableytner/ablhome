# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine
RUN apk add --no-cache python3 py3-yaml
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.py /entrypoint.py
COPY --from=build /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html /var/log/nginx /var/cache/nginx
USER nginx
EXPOSE 8080
ENTRYPOINT ["python3", "/entrypoint.py"]
