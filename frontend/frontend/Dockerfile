# Etapa 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Variables de build para Vite (se pasan con --build-arg o desde
# la configuración de build en Render/Vercel/Netlify)
ARG VITE_API_URL
ARG VITE_API_KEY
ARG VITE_STORAGE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_STORAGE_KEY=$VITE_STORAGE_KEY

RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]