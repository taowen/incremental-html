import { defineConfig } from 'vite'
import pkg from './package.json'

export default defineConfig({
    build: {
        minify: false,
        lib: {
            // will be loaded as window['example-lib']
            name: 'example-lib', 
            entry: './src/index.ts',
            formats: ['es', 'umd'],
            fileName: (format) => format === 'es' ? `esm/index.js` : `lib/index.js`,
        },
        target: 'esnext',
        outDir: 'dist',
        rollupOptions: {
            external: [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]
        }
    },
})