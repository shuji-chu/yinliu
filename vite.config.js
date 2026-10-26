import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 子路径部署：必须为 /yinliu/，否则白屏
export default defineConfig({
  plugins: [vue()],
  base: '/yinliu/',
  build: {
    chunkSizeWarningLimit: 1200
  }
})
