import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 關鍵修正：設定基礎路徑為相對路徑，解決開發環境或預覽環境下的 404 問題
  base: './',
  server: {
    host: '0.0.0.0', // 確保伺服器監聽所有網卡位址
    port: 5173,
  }
})