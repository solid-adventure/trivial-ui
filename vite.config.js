import vue from '@vitejs/plugin-vue'
import TrivialCore from 'trivial-core'

const actionRegistry = new TrivialCore.ActionRegistry()
actionRegistry.build()


export default {
  plugins: [vue()],
   resolve: {
      extensions: ['.js','.vue', 'scss'],
    },
    optimizeDeps: {
      include: ['trivial-core'],
    },
    build: {
    commonjsOptions: {
      include: [/trivial-core/, /node_modules/],
    },
  },
}