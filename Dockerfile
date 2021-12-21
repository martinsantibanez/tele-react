# Install dependencies only when needed
FROM node:alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM deps AS builder
WORKDIR /app

COPY . .
RUN yarn build

FROM node:alpine AS runner

ENV NODE_ENV production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

WORKDIR /app/


CMD ["node", "dist/main"]