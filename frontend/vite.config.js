import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

// Helper to get all HTML files
const getHtmlFiles = () => {
    const files = fs.readdirSync(__dirname)
    const htmlFiles = {}
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const name = file.replace('.html', '')
            htmlFiles[name] = resolve(__dirname, file)
        }
    })
    return htmlFiles
}

export default defineConfig({
    build: {
        rollupOptions: {
            input: getHtmlFiles()
        }
    },
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false
            },
            '/uploads': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false
            },
            '/barcodes': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
