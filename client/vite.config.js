import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 开发时代理到 netlify dev 的 function 服务
      '/.netlify/functions': 'http://localhost:8888',
    }
  }
});
