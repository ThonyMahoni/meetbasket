import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // <-- wichtig für Webgo (Root-URL)
  build: {
    outDir: 'dist', // bleibt Standard
  },
});
