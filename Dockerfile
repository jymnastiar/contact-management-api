# Base Stage
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
COPY prisma ./prisma/
COPY prisma*.config.ts ./

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN bun install
RUN bunx prisma generate
EXPOSE 3000
CMD ["bun", "--watch", "src/index.ts"]

# Builder Stage
FROM base AS builder
RUN bun install --frozen-lockfile
RUN bunx prisma generate
COPY src ./src
RUN bun run build
RUN rm -rf node_modules && bun install --production --frozen-lockfile

# Runner Stage
FROM oven/bun:1-slim AS runner
WORKDIR /app

LABEL maintainer="Jymnastiar"
LABEL project="Contact-Management-API"

ENV NODE_ENV=production
ENV PORT=3000

COPY --chown=bun:bun package.json bun.lock ./
COPY --chown=bun:bun prisma ./prisma/
COPY --chown=bun:bun --from=builder /app/node_modules ./node_modules
COPY --chown=bun:bun --from=builder /app/dist ./dist

RUN mkdir -p /app/logs && chown -R bun:bun /app

USER bun
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "dist/index.js"]