FROM gplane/pnpm:10.8.1-node22-bullseye

WORKDIR /app

COPY ./package.json ./pnpm-lock.yaml* /app/

RUN pnpm install

ENV PATH=./node_modules/.bin/:$PATH
