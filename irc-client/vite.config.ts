import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr' // Import svgr

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()], // Add svgr() to the plugins array
})