/// <reference path="../src/md.d.ts" />
// Type-checked by `npm run typecheck`, never run.
import markdown, {
  type MarkdownModuleExport,
  type MarkdownPluginOptions,
} from '@jackfranklin/rollup-plugin-markdown'
import type { Plugin } from 'rollup'
import post from './fixtures/test.md'

const plugin = (md: { use: Function }, prefix: string) => {}

const options: MarkdownPluginOptions = {
  include: ['src/**/*.md'],
  exclude: 'README.md',
  markdownItOptions: { breaks: false, typographer: true },
  markdownItPlugins: [plugin, [plugin, 'prefix']],
  allowImports: false,
  parseFrontMatterAsMarkdown: true,
}

const result: Plugin = markdown(options)
markdown()

// @ts-expect-error showdown options are gone
markdown({ showdownOptions: {} })

// @ts-expect-error markdown-it options are checked
markdown({ markdownItOptions: { breaks: 'yes' } })

const imported: MarkdownModuleExport = post
const html: string = post.html
