/* eslint-disable local/enforce-comment-order */

import esbuild, { Plugin, PluginBuild } from 'esbuild'

type GameFiles = {
	[key: string]: string;
}

const createVirtualFilesPlugin = (files: GameFiles): Plugin => ({
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
				const resolvedWithoutTs = resolvedPath.replace(/\.ts$/, '')

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

export async function bundleFiles(files: GameFiles) {
	const result = await esbuild.build({
		entryPoints: ['main.ts'],
		bundle: true,
		format: 'iife',
		platform: 'node',
		write: false,
		plugins: [createVirtualFilesPlugin(files)],
	})

	const bundledCode = result.outputFiles[0].text // (() => { ... })();
	return bundledCode
}
