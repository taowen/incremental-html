import { defineConfig } from 'vite'
export default defineConfig({
    build: {
        outDir: 'dist',
        lib: {
            entry: './src/index.ts',
            formats: ['es'],
            fileName: () => 'index.js'
        },
        rollupOptions: {
            external: ['@incremental-html/morph'],
            output: {
                paths: {
                    '@incremental-html/morph': 'https://cdn.jsdelivr.net/npm/@incremental-html/morph.js@1.0.0'
                }
            }
        }
    },
})