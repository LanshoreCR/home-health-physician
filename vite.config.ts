import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fijo: el redirect URI registrado en Okta es http://localhost:5173/login/callback.
  // Si Vite se corre a 5174 el login falla con un error de redirect_uri poco claro.
  server: { port: 5173, strictPort: true },
})
