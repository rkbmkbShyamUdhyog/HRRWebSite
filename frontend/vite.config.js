import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 127.0.0.1, not localhost: Node may resolve localhost to IPv6 (::1), but the backend listens on 0.0.0.0 (IPv4).
      '/api': 'http://127.0.0.1:5000',
    },
  },
});
