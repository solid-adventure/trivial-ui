import vue from '@vitejs/plugin-vue'

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