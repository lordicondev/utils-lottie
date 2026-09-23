import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        dts({
            include: ['src'],
            // Declarations mirror src/ but sit at the dist root, next to index.js.
            beforeWriteFile: (filePath, content) => ({
                filePath: filePath.replace('/dist/src/', '/dist/'),
                content,
            }),
        }),
    ],
    build: {
        target: 'es2022',
        lib: {
            formats: ['es'],
            entry: resolve(import.meta.dirname, 'src', 'index.ts'),
            fileName: () => 'index.js',
        },
    },
});
