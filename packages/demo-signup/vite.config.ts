import Pages from 'vite-plugin-pages';
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
      Pages({
          dirs: 'src/server/pages',
          extensions: ['tsx']
      }),
    ],
})