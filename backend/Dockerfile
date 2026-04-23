# ── Stage 1: dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# ── Stage 2: production image ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 usra

# Copy only what's needed
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create uploads + logs dirs with correct ownership
RUN mkdir -p uploads logs \
 && chown -R usra:nodejs /app

USER usra

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "server.js"]
