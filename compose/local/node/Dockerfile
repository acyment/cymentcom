FROM node:20-bullseye-slim

WORKDIR /app

COPY ./package.json /app

RUN corepack enable
RUN pnpm fetch
RUN pnpm install
