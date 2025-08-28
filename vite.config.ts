import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
        open: true,
        proxy: {
            '/api/music': {
                target: 'https://api.ttapi.io/suno/v1',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api\/music/, ''),
                headers: {
                    'TT-API-KEY': '15172b1c-cb9e-f173-d293-012f281a9181'
                }
            }
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
    },
    css: {
        postcss: {
            plugins: [
                require('autoprefixer'),
            ],
        },
    },
}); 