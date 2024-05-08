import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { generateExportsPlugin } from '@packages/vite-plugin-generate-exports'
import { getRootExternal } from '../../utils/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        dts(),
        generateExportsPlugin({
            watch: mode === 'development',
            entries: [
                {
                    exportAllAsAlias: false,
                    exportAll: true,
                    omitSemi: true,
                    filename: 'index.ts',
                    include: ['**/*.ts'],
                    exclude: ['**/index.*'],
                    directories: ['./src/utils'],
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            name: 'main',
            formats: ['cjs', 'es'],
            fileName: (format, entryName) =>
                `${ entryName }.${
                    {
                        cjs: 'cjs',
                        es: 'js',
                    }[format]
                }`,
        },
        rollupOptions: {
            external: [
                ...getRootExternal(),
            ],
        },
    },
}))
