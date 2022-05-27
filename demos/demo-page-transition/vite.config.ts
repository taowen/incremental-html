import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                page1: path.resolve(__dirname, 'page1.html'),
                page2: path.resolve(__dirname, 'page2.html'),
            }
        },
    }
})