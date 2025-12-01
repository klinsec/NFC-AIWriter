import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno (como API_KEY) desde el sistema o archivos .env
  // Fix: Cast process to any to avoid type error with missing cwd definition
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Base relativa para que funcione en subdirectorios de GitHub Pages
    base: './',
    define: {
      // Inyectar la API Key de forma segura
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Definir process.env vacío para evitar crash de librerías, pero permitir acceso a API_KEY
      'process.env': {} 
    },
    build: {
      outDir: 'dist',
      sourcemap: true // Útil para depurar si vuelve a fallar
    }
  };
});