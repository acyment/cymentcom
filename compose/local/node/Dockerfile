FROM docker.io/node:22.14-bookworm-slim

WORKDIR /app

COPY ./package.json /app

RUN npm install -g corepack

RUN corepack prepare pnpm@10.4.1 --activate && \
    corepack enable pnpm
RUN pnpm fetch
RUN pnpm install
