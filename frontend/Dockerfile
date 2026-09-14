# ------------------------------------------------------------------------------
# Production Frontend Web Dockerfile (Multi-stage Nginx)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@12.4.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build static web assets for Expo
ENV EXPO_PUBLIC_API_URL=http://localhost:8000
RUN npx expo export --platform web

# Production web server via lightweight Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
