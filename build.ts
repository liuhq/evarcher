import dts from 'bun-plugin-dts'

await Bun.build({
    entrypoints: ['src/main.ts'],
    outdir: './dist',
    minify: true,
    plugins: [
        dts({
            output: {
                sortNodes: false,
                exportReferencedTypes: false,
            },
        }),
    ],
})
