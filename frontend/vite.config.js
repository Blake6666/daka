import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 开发服务器配置：固定端口 5173，方便每天照抄同一条地址
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true
  }
})
