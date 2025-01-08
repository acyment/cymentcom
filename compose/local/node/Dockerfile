FROM docker.io/node:22.12-bookworm-slim

WORKDIR /app

COPY ./package.json /app

RUN corepack enable
RUN pnpm fetch
RUN pnpm install
