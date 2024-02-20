FROM docker.io/node:20-bookworm-slim

WORKDIR /app

COPY ./package.json /app

RUN corepack enable
RUN pnpm fetch
RUN pnpm install
