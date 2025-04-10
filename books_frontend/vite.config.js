import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    root: path.resolve(__dirname, 'src'),
    publicDir: path.resolve(__dirname, 'public'),
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true,
        open: '/',
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,

                rewrite: (path) => path.replace(/^\/api/, '/api'), // Удаляем /api для Django
                configure: (proxy, _options) => {
                    proxy.on('proxyReq', (proxyReq) => {
                        // Добавляем заголовки для POST/PUT запросов
                        if (proxyReq.method === 'POST' || proxyReq.method === 'PUT') {
                            proxyReq.setHeader('Content-Type', 'application/json')
                        }
                    })
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log(`[PROXY]: ${req.method} ${req.url} -> ${proxyRes.statusCode}`)
                    })
                }
            }
        }
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'src/index.html')
        }
    }
})