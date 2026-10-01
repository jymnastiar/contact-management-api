FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
COPY prisma ./prisma/
COPY prisma*.config.ts ./

RUN bun install --frozen-lockfile
RUN bunx prisma generate

COPY src ./src
RUN bun run build

FROM oven/bun:latest AS runner
WORKDIR /app

LABEL maintainer="Jymnastiar"
LABEL project="Contact-Management-API"

ENV NODE_ENV=production
ENV PORT=3000

COPY --chown=bun:bun package.json bun.lock ./
COPY --chown=bun:bun prisma ./prisma/
COPY --chown=bun:bun prisma*.config.ts ./
RUN bun install --production --frozen-lockfile && bunx prisma generate

COPY --chown=bun:bun --from=builder /app/dist ./dist

RUN mkdir -p /app/logs && chown -R bun:bun /app && chmod -R 777 /app

USER bun

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "dist/index.js"]