import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno (como API_KEY) desde el sistema o archivos .env
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Base relativa para que funcione en subdirectorios de GitHub Pages (ej: usuario.github.io/repo)
    base: './',
    define: {
      // Inyectar la API Key de forma segura durante el build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});