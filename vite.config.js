import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so the build works on any GitHub Pages repo path.
export default defineConfig({
  plugins: [react()],
  base: './',
});
