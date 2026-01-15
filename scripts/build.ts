// deno-lint-ignore-file no-import-prefix
import { join } from 'node:path'
import { sortPackage, writePackageJSON } from 'npm:pkg-types@2.3.0'
import { build } from 'npm:tsdown@0.20.0-beta.2'
import type _ from 'npm:typescript@5.9.3'

import denoJson from '../deno.json' with { type: 'json' }

const outDir = 'dist'

await build({
    configLoader: 'native',
    entry: 'src/main.ts',
    outDir,
    platform: 'neutral',
    target: false,
    format: 'esm',
    dts: true,
    outputOptions: {
        entryFileNames: '[name].js',
    },
})

const pkgFile = 'package.json'
const pkgPath = join(outDir, pkgFile)
console.info(`ℹ Generate ${pkgFile}`)
await writePackageJSON(
    pkgPath,
    sortPackage({
        name: denoJson.name,
        version: denoJson.version,
        description: 'A type-safe, zero-dependency event manager.',
        keywords: ['event manager', 'type-safe'],
        license: denoJson.license,
        author: {
            name: 'Horace Liu',
            email: 'im.liuhq@gmail.com',
        },
        repository: {
            type: 'git',
            url: 'https://github.com/liuhq/evarcher',
        },
        type: 'module',
        files: ['main.js', 'main.d.ts'],
        exports: './main.js',
        types: 'main.d.ts',
    }),
)
console.info(`✔ Generate complete`)

// Copy README.md and LICENSE to "dist"
const outDirStat = await Deno.stat(outDir)
if (!outDirStat.isDirectory) throw new Error(`"${outDir}" is not a directory.`)

const readmeFile = 'README.md'
const readmePath = join(outDir, readmeFile)
const licenseFile = 'LICENSE'
const licensePath = join(outDir, licenseFile)

console.info(`ℹ Copy ${readmeFile} to ${readmePath}`)
console.info(`ℹ Copy ${licenseFile} to ${licensePath}`)
await Deno.copyFile(readmeFile, readmePath)
await Deno.copyFile(licenseFile, licensePath)
console.info(`✔ Copy complete`)
