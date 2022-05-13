import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: './client-entry.js',
            formats: ['es'],
            fileName: () => 'client-entry.js'
        },
    },
})