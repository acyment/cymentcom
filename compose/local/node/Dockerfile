FROM node:20-bullseye-slim

WORKDIR /app

COPY ./package.json /app

RUN npm install -g pnpm
RUN pnpm install && pnpm store prune
