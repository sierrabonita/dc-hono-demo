import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true, // コンテナ外からのアクセスを許可
    port: 5173,
    watch: {
      usePolling: true, // Docker環境でのファイル変更検知を確実にする
    },
  },
});
