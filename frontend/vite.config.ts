import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	preview: {
		port: 4173,
		host: true,
		allowedHosts: [
			"309projfrontend-production.up.railway.app",
			"localhost"
		]
	},
	server: {
		port: 4173,
		host: true
	}
});
