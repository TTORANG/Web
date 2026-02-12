import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import type { Connect } from 'vite';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// .mp4 파일 요청에 Accept-Ranges 헤더를 추가하는 미들웨어
// Chrome에서 비디오 탐색(seeking)이 가능하도록 함
const addAcceptRangesMiddleware: Connect.NextHandleFunction = (req, res, next) => {
  if (req.url?.endsWith('.webm')) {
    res.setHeader('Accept-Ranges', 'bytes');
  }
  next();
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    // TODO: Vite에서 mp4 파일에 대해 Accept-Ranges 헤더를 추가하는 임시 플러그인
    {
      name: 'add-accept-ranges',
      configureServer(server) {
        server.middlewares.use(addAcceptRangesMiddleware);
      },
      configurePreviewServer(server) {
        server.middlewares.use(addAcceptRangesMiddleware);
      },
    },
  ],
  // CDN CORS 우회를 위한 proxy 설정 (개발 환경)
  server: {
    proxy: {
      '/cdn-proxy': {
        target: 'https://cdn.ttorang.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn-proxy/, ''),
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom') ||
              id.includes('sonner') ||
              id.includes('zustand')
            ) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'tanstack-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('hls.js')) {
              return 'video-vendor';
            }
            if (id.includes('dayjs') || id.includes('clsx') || id.includes('axios')) {
              return 'app-vendor';
            }
          }

          if (id.includes('/src/pages/feedback/') || id.includes('/src/pages/Feedback')) {
            return 'feedback-pages';
          }
          if (id.includes('/src/components/insight/') || id.includes('/src/pages/InsightPage')) {
            return 'insight-pages';
          }
          if (id.includes('/src/components/video/') || id.includes('/src/pages/Video')) {
            return 'video-pages';
          }

          return undefined;
        },
      },
    },
  },
});
