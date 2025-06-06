import { defineConfig } from 'vite'

export default defineConfig({
  server: {
      proxy: {
          '/api': 'http://localhost:3000',
      },
       host:"0.0.0.0",  // Allows external devices to access the server
      port:5174 // You can change this port if needed
  },
});
