import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    base: '/metal-process-manual-web/',
    plugins: [react()],
    server: {
        allowedHosts: true,
    },
});
