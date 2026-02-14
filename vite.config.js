import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 开发服务器配置 - 如果后端CORS仍有问题，可以启用代理
  server: {
    port: 5173,
    proxy: {
      // 代理API请求到后端
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // 不重写路径
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      // 代理学生管理等无/api前缀的接口
      '/findPageStudent': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/insertStudent': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/updateStudent': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/deleteBatchByIds': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/findByStudentId': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // 学院相关接口
      '/getAllAcademy': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/insertAcademy': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/updateAcademy': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/deleteById': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/findByAcademyId': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
