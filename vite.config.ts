import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    host: true, // bind to 0.0.0.0 so *.localhost subdomains resolve
    allowedHosts: ['.localhost'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Forward the original browser host so the backend can resolve the portal
            proxyReq.setHeader('x-portal-host', req.headers.host ?? '');
          });
        },
      },
    },
  },
})

