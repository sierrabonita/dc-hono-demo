FROM node:24-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN yarn install

# ソースコードをコピー
COPY . .

# Viteのデフォルトポート
EXPOSE 5173

# Docker環境でViteを動かすための起動コマンド（--host が必須）
CMD ["yarn", "dev", "--host"]