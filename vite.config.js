import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      svgr()
    ],
    resolve: {
      alias: [
        { find: '~', replacement: '/src' }
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    define: {
      // Make env variables available to the app
      __APP_ENV__: JSON.stringify(env.VITE_NODE_ENV || mode)
    },
    server: {
      port: parseInt(env.PORT) || 3001,
      host: true
    },
    preview: {
      port: parseInt(env.PORT) || 3001,
      host: true
    }
  }
})
