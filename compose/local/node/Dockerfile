FROM docker.io/node:22.14-bookworm-slim

WORKDIR /app

COPY ./package.json /app

RUN npm install -g bun

RUN bun install
