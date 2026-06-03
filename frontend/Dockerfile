FROM node:22-bookworm-slim

WORKDIR /app

# Corepackの有効化とYarn v4の準備
RUN corepack enable && corepack prepare yarn@4.16.0 --activate

# 設定ファイルとロックファイルを先にコピーしてパッケージをインストール
COPY package.json yarn.lock* .yarnrc.yml* ./

RUN yarn install

# 残りのソースコードをコピー
COPY . .

EXPOSE 5173

# Viteをコンテナ外からアクセス可能にする
CMD ["yarn", "dev", "--host"]