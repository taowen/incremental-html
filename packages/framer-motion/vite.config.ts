import { defineConfig } from 'vite'
import pkg from './package.json'

export default defineConfig({
    build: {
        outDir: 'dist',
        lib: {
            entry: './index.ts',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format}.js`
        },
        minify: false,
        rollupOptions: {
            external: [
                ...Object.keys(pkg.dependencies), 
                ...Object.keys(pkg.devDependencies),
            ]
        }
    },
})