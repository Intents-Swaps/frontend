import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            include: ["buffer"],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
            protocolImports: true,
        }),
    ],
    define: {
        'global': 'window',
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@bch-intents/sdk-xmr-swap": path.resolve(__dirname, "../bch-intents-sdk/packages/sdk-xmr-swap/src/index.ts"),
            "@bch-intents/sdk-contracts": path.resolve(__dirname, "../bch-intents-sdk/packages/sdk-contracts/src/index.ts"),
        },
    },
    server: {
        proxy: {
            '/api/bardock': {
                target: 'https://aptos.testnet.bardock.movementlabs.xyz',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api\/bardock/, ''); },
                secure: true,
            }
        }
    }
});
