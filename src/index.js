import path from 'node:path'
import { createFilter } from '@rollup/pluginutils'
import { CORE_SCHEMA, loadAll, mergeTag, timestampTag } from 'js-yaml'
import MarkdownIt from 'markdown-it'

// YAML 1.2 core schema plus dates and merge keys, which is what the plugin
// parsed (via gray-matter and js-yaml 3) before 0.5.0
const yamlSchema = CORE_SCHEMA.withTags(timestampTag, mergeTag)

// a `---` line, the YAML, then a closing `---` line, at the very start of the file
const frontMatterPattern =
  /^\uFEFF?---[ \t]*\r?\n(?:([\s\S]*?)\r?\n)?---[ \t]*(?:\r?\n|$)/

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * Splits a Markdown file into its YAML front matter and its body.
 *
 * @param {string} source
 * @returns {{ data: Record<string, unknown>, content: string }}
 */
const parseFrontMatter = (source) => {
  const match = frontMatterPattern.exec(source)
  if (!match) return { data: {}, content: source.replace(/^\uFEFF/, '') }

  const [data] = loadAll(match[1] ?? '', { schema: yamlSchema })
  return {
    data: isPlainObject(data) ? data : {},
    content: source.slice(match[0].length),
  }
}

/**
 * @param {import('./index.d.ts').MarkdownPluginOptions} [options]
 * @returns {import('rollup').Plugin}
 */
export default function markdown(options = {}) {
  const {
    include,
    exclude,
    markdownItOptions = {},
    markdownItPlugins = [],
    allowImports = true,
    parseFrontMatterAsMarkdown = false,
  } = options

  // html: raw HTML (including custom elements) passes through untouched
  // linkify: bare URLs become links, as on GitHub
  // breaks: single newlines become <br>, matching the showdown output of <= 0.4
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
    ...markdownItOptions,
  })

  for (const plugin of markdownItPlugins) {
    // plugins are either `plugin` or `[plugin, ...params]`
    const [fn, ...params] = Array.isArray(plugin) ? plugin : [plugin]
    md.use(fn, ...params)
  }

  const filter = createFilter(include, exclude)

  /**
   * Converts string values to inline HTML; leaves numbers, booleans, dates etc. alone.
   *
   * @param {unknown} value
   * @returns {unknown}
   */
  const renderFrontMatter = (value) => {
    if (typeof value === 'string') return md.renderInline(value)
    if (Array.isArray(value)) return value.map(renderFrontMatter)
    if (isPlainObject(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, v]) => [key, renderFrontMatter(v)])
      )
    }
    return value
  }

  return {
    name: 'rollup-plugin-markdown',
    transform(code, id) {
      if (!filter(id) || path.extname(id) !== '.md') return null

      const { data, content } = parseFrontMatter(code)

      const exportFromModule = JSON.stringify({
        html: md.render(content),
        metadata: parseFrontMatterAsMarkdown ? renderFrontMatter(data) : data,
        filename: path.basename(id),
        path: id,
      })

      return {
        code: allowImports
          ? `export default ${exportFromModule}`
          : exportFromModule,
        map: null,
      }
    },
  }
}
