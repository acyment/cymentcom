FROM docker.io/node:22.12-bookworm-slim

WORKDIR /app

COPY ./package.json /app

RUN corepack prepare pnpm@9.15.4 --activate && \
    corepack enable pnpm
RUN pnpm fetch
RUN pnpm install
