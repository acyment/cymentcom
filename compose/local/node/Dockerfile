FROM gplane/pnpm:10.8.1-node22-bullseye

WORKDIR /app

COPY ./package.json ./pnpm-lock.yaml* /app/

# Ensure a stable pnpm store location across containers/volumes
RUN pnpm config set store-dir /app/.pnpm-store

RUN pnpm install

ENV PATH=./node_modules/.bin/:$PATH
