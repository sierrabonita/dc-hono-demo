import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // コンテナ外からのアクセスを許可
    port: 5173,
    watch: {
      usePolling: true, // Docker環境でのファイル変更検知を確実にする
    },
  },
})
