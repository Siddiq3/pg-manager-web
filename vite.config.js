import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The React plugin was a dependency but never wired up, so dev builds had no
// Fast Refresh. VITE_API_URL points the app at the backend.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
