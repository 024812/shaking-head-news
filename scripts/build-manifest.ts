import manifest from '../manifest.config'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import type { Plugin } from 'vite'

const FILE_NAME = 'manifest.json'
const BUILD_PATH = 'dist'

const buildManifest = async () => {
  const scriptDir = fileURLToPath(new URL('.', import.meta.url))
  const file = resolve(scriptDir, '..', BUILD_PATH, FILE_NAME)

  await writeFile(file, JSON.stringify(manifest, undefined, 2))
  console.info('✓ manifest.json is created.')
}

export const viteBuildManifest: () => Plugin = () => ({
  name: 'vite-build-manifest',
  apply: 'build',
  closeBundle: buildManifest,
})
