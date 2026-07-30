import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // react()      -> JSX / React desteği
  // tailwindcss() -> Tailwind CSS v4 (ayrı config dosyası gerekmez, tema index.css'te)
  plugins: [react(), tailwindcss()],
})
