/**
 * Prepack/pre-publish sanity check: confirm every file the bundle needs to be
 * loadable is present and that the pack would not silently produce a broken
 * tarball (missing `cordis.patch.yml`, unbuilt `lib/`, or an unpopulated
 * `src/client`). Runs automatically via the `prepack` script before
 * `npm pack` / `npm publish`.
 */

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Files a usable bundle must carry. `files` in package.json whitelists them. */
const REQUIRED = [
  'package.json',
  'cordis.patch.yml',
  'lib/index.js',
  'lib/client.js',
]

const missing = []
for (const rel of REQUIRED) {
  const p = join(root, rel)
  if (!existsSync(p)) missing.push(rel)
}
if (missing.length > 0) {
  console.error(`[check-pack] missing required file(s): ${missing.join(', ')}\n  (build the bundle first with \`pnpm run build\`)`)
  process.exit(1)
}

// The browser bundle must be the module-loader handoff, not an empty wrapper.
const client = readFileSync(join(root, 'lib/client.js'), 'utf8')
if (!client.includes('window.__ModuleLoader__.load')) {
  console.error('[check-pack] lib/client.js is not a ModuleLoader bundle (missing the load handoff)')
  process.exit(1)
}

// `cordis.patch.yml` must reference this package by its own name, matching the
// manifest, so the loader resolves the inserted row.
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const patch = readFileSync(join(root, 'cordis.patch.yml'), 'utf8')
const namePattern = new RegExp(`name:\\s*["']?${manifest.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']?`)
if (!namePattern.test(patch)) {
  console.error(`[check-pack] cordis.patch.yml does not reference the package name "${manifest.name}"`)
  process.exit(1)
}

if (manifest.private === true) {
  console.error('[check-pack] package.json still marks "private": true; it cannot be published')
  process.exit(1)
}

console.log('[check-pack] OK: publish bundle is complete')
