/* eslint-disable local/enforce-comment-order */

import esbuild, { Plugin, PluginBuild } from 'esbuild'

export interface FileMap {
	'main.ts': string;
	[key: string]: string;
}

export function isFileMap(obj: unknown): obj is FileMap {
	return obj !== null &&
		typeof obj === 'object' &&
		'main.ts' in obj &&
		Object.values(obj).every(value => typeof value === 'string')
}

const createVirtualFilesPlugin = (files: FileMap): Plugin => ({
	name: 'virtual-files',
	setup(build: PluginBuild) {
		build.onResolve({ filter: /.*/ }, (args) => {
			const path = args.path
			// Try both with and without .ts extension
			const pathWithTs = path.endsWith('.ts') ? path : `${path}.ts`
			const pathWithoutTs = path.replace(/\.ts$/, '')

			// Check both variants in our virtual files
			if (files[pathWithTs] || files[pathWithoutTs]) {
				return { path: pathWithTs, namespace: 'virtual' }
			}

			// Handle relative imports
			if (path.startsWith('.')) {
				const resolvedPath = path.replace(/^\.\.\//, '')
					.replace(/^\.\//, '')
				const resolvedWithTs = resolvedPath.endsWith('.ts') ? resolvedPath : `${resolvedPath}.ts`
				const resolvedWithoutTs = resolvedWithTs.replace(/\.ts$/, '')

				if (files[resolvedWithTs] || files[resolvedWithoutTs]) {
					return { path: resolvedWithTs, namespace: 'virtual' }
				}
			}
			return null
		})

		build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
			// Try both with and without .ts extension
			const content = files[args.path] || files[args.path.replace(/\.ts$/, '')]
			return { contents: content, loader: 'ts' }
		})
	},
})

export async function bundleFiles(files: FileMap, globalName: string) {
	const result = await esbuild.build({
		entryPoints: ['main.ts'],
		bundle: true,
		format: 'iife',
		globalName: globalName,
		platform: 'node',
		write: false,
		plugins: [createVirtualFilesPlugin(files)],
	})

	const bundledCode = result.outputFiles[0].text
	return bundledCode
}
