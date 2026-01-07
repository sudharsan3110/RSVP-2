FROM node:20-alpine AS builder
WORKDIR /repo

RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/server/package.json apps/server/package.json

RUN pnpm install --frozen-lockfile
COPY . .

# Build app instll deps
RUN pnpm --filter "./apps/server" build

# install node_modules only in server
RUN pnpm deploy --legacy --prod --filter "./apps/server" /deploy/server



COPY apps/server/src/prisma /deploy/server/src/prisma
RUN cd /deploy/server && pnpm prisma generate


FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl \
    && addgroup -S nodejs \
    && adduser -S nodeuser -G nodejs


COPY --chown=nodeuser:nodejs --from=builder /deploy/server/node_modules ./node_modules
COPY --chown=nodeuser:nodejs --from=builder /repo/apps/server/dist ./dist
COPY --chown=nodeuser:nodejs --from=builder /repo/apps/server/package.json ./
COPY --chown=nodeuser:nodejs --from=builder /deploy/server/src/prisma ./src/prisma
COPY --chown=nodeuser:nodejs --from=builder /repo/apps/server/start.sh ./start.sh


USER nodeuser

CMD ["sh", "start.sh"]
