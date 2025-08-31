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
            },
            '/api/lyrics': {
                target: 'https://api.ttapi.io/suno/v1',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api\/lyrics/, ''),
                headers: {
                    'TT-API-KEY': '15172b1c-cb9e-f173-d293-012f281a9181'
                }
            },
            '/api/openai-images': {
                target: 'https://api.ttapi.io/v1',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api\/openai-images/, ''),
                headers: {
                    'TT-API-KEY': '15172b1c-cb9e-f173-d293-012f281a9181',
                    'Content-Type': 'application/json'
                }
            },
            '/api/gpt4o-image': {
                target: 'https://api.ttapi.io/openai/4o-image',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api\/gpt4o-image/, ''),
                headers: {
                    'TT-API-KEY': '15172b1c-cb9e-f173-d293-012f281a9181',
                    'Content-Type': 'application/json'
                }
            },
            '/proxy': {
                target: 'https://cdn.ttapi.io',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/proxy/, '')
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