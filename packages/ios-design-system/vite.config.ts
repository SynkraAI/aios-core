import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.stories.tsx'],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/tokens': resolve(__dirname, './src/tokens'),
      '@/components': resolve(__dirname, './src/components'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/utils': resolve(__dirname, './src/utils'),
    },
  },
  build: {
    lib: {
      entry: {
        'ios-design-system': resolve(__dirname, 'src/index.ts'),
        'tokens/index': resolve(__dirname, 'src/tokens/index.ts'),
        'components/index': resolve(__dirname, 'src/components/index.ts'),
      },
      name: 'iOSDesignSystem',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `${entryName}.${ext}`
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        // Preserve directory structure for tokens and components
        preserveModules: false,
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
})
