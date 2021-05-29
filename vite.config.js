import {resolve} from 'path'
import {createVuePlugin} from 'vite-plugin-vue2'

export default ({command, mode}) => {
  const dir = mode === 'development' ? 'dev' : 'dist/.ui'

  return {
    plugins: [
      createVuePlugin()
    ],
    base: mode === 'development' ? '/' : '/.ui/',
    build: {
      outDir: resolve(process.cwd(), dir),
      manifest: true,
      target: 'es2018',
      rollupOptions: {
        input: '/src/index.js',
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
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