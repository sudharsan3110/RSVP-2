FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install -g pnpm
RUN pnpm install

COPY . . 
RUN pnpm build

FROM node:20-alpine AS runtime

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/prisma/schema.prisma ./src/prisma/schema.prisma
COPY package.json ./

RUN pnpm install --prod
RUN apk add --no-cache openssl
RUN pnpm generate


ENV NODE_ENV=production

EXPOSE 8000

CMD ["node", "dist/app.js"]
