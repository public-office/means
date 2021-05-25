import {resolve} from 'path'
// import liveReload from 'vite-plugin-live-reload'
import {createVuePlugin} from 'vite-plugin-vue2'

export default ({command, mode}) => {
  console.warn({mode})
  return {
    plugins: [
      createVuePlugin()
    ],
    base: mode === 'development' ? '/' : '/.ui/',
    build: {
      outDir: resolve(process.cwd(), '.ui'),
      manifest: true,
      target: 'es2018',
      rollupOptions: {
        input: '/src/index.js'
      }
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost'
      }
    }
  }
}