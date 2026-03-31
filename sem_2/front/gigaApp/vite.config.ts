import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
	},
	resolve: {
		alias: {
			buffer: 'buffer',
		},
	},
	server: {
		proxy: {
			'/api/oauth': {
				target: 'https://ngw.devices.sberbank.ru:9443',
				changeOrigin: true,
				rewrite: path => path.replace(/^\/api\/oauth/, ''),
				secure: false,
				configure: proxy => {
					proxy.on('error', err => {
						console.log('proxy error', err)
					})
				},
			},
			'/api/gigachat': {
				target: 'https://gigachat.devices.sberbank.ru',
				changeOrigin: true,
				rewrite: path => path.replace(/^\/api\/gigachat/, ''),
				secure: false,
				configure: proxy => {
					proxy.on('error', err => {
						console.log('proxy error', err)
					})
				},
			},
		},
	},
})

