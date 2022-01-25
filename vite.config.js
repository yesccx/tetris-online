import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import styleImport, { VantResolve } from 'vite-plugin-style-import';
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        styleImport({
            resolves: [VantResolve()],
        }),
    ],
    base: "/game/",
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    build: {
        rollupOptions: {
            // 分离dist文件中的js，css
            output: {
                entryFileNames: 'js/[name]-[hash].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: 'css/[name]-[hash].css'
            }
        }
    },
    server: {
        host: true
    }
})
