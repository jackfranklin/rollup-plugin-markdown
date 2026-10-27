// Types for `import post from './post.md'`. Reference them with
// `/// <reference types="@jackfranklin/rollup-plugin-markdown/md" />`
// or `"types": ["@jackfranklin/rollup-plugin-markdown/md"]` in tsconfig.json.
declare module '*.md' {
  const markdown: import('./index.js').MarkdownModuleExport
  export default markdown
}
