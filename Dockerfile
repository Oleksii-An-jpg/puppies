# ---- Build stage: compile client.ts -> client.js ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY public ./public

RUN npm run build

# ---- Runtime stage: plain static file server ----
FROM nginx:alpine AS runtime

COPY --from=build /app/public /usr/share/nginx/html

EXPOSE 80
