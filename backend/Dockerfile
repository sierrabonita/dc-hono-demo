FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.16.0 --activate

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

CMD ["yarn", "dev"]