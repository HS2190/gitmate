import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 로 두면 GitHub Pages 등 하위 경로 정적 호스팅에서도
// 에셋 경로가 깨지지 않는다. HashRouter 와 함께 딥링크 대응.
//
// dev 프록시: 로컬에서 `npm run dev`(프론트) + `npm run dev:api`(함수)를
// 동시에 띄우면 /api 요청이 로컬 함수 서버(8787)로 전달된다.
// 배포(Vercel)에서는 이 프록시가 관여하지 않고 api/ 서버리스 함수가 처리한다.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
