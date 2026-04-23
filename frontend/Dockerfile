# ── Stage 1: build React app ─────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

COPY . .

# Build args for runtime env vars
ARG REACT_APP_API_URL
ARG REACT_APP_RAZORPAY_KEY_ID

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_RAZORPAY_KEY_ID=$REACT_APP_RAZORPAY_KEY_ID

RUN npm run build

# ── Stage 2: serve with Nginx ─────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/build /usr/share/nginx/html

# SPA routing — serve index.html for all routes
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ { expires 1y; add_header Cache-Control "public, immutable"; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
