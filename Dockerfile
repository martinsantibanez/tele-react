# Install dependencies only when needed
FROM node:alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install --frozen-lockfile


# Rebuild the source code only when needed
FROM deps AS builder
WORKDIR /app
COPY . .
COPY package.json package.json
WORKDIR /app

RUN yarn build

# Production image, copy all the files and run next
FROM node:alpine AS runner

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/.env /app/.env
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/public /app/public
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/next.config.js /app/next.config.js
COPY --from=builder /app/public /app/public
COPY --from=builder --chown=nextjs:nodejs /app/.next /app/.next
COPY --from=builder /app/package.json /app/package.json

USER nextjs

EXPOSE 3001
ENV PORT 3001

ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app

CMD yarn start
