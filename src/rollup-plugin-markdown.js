const { createFilter } = require('@rollup/pluginutils')
const path = require('path')
const matter = require('gray-matter')
const MarkdownIt = require('markdown-it')

const markdownPlugin = (options = {}) => {
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

  markdownItPlugins.forEach(plugin => {
    // plugins are either `plugin` or `[plugin, ...params]`
    const [fn, ...params] = Array.isArray(plugin) ? plugin : [plugin]
    md.use(fn, ...params)
  })

  const filter = createFilter(include, exclude)

  return {
    name: 'rollup-plugin-markdown',
    transform(code, id) {
      if (!filter(id)) return

      const extension = path.extname(id)

      if (extension !== '.md') return

      const matterResult = matter(code)
      const html = md.render(matterResult.content)

      if (parseFrontMatterAsMarkdown) {
        const parseFrontMatterNested = frontMatter => {
          Object.entries(frontMatter).forEach(([key, value]) => {
            // recurse
            if (value && typeof value === 'object') parseFrontMatterNested(value)
            // convert markdown to inline HTML; leave numbers, booleans etc. alone
            else if (typeof value === 'string') frontMatter[key] = md.renderInline(value)
          })
        }

        parseFrontMatterNested(matterResult.data)
      }

      const exportFromModule = JSON.stringify({
        html,
        metadata: matterResult.data,
        filename: path.basename(id),
        path: id,
      })

      return {
        code: allowImports ? `export default ${exportFromModule}` : exportFromModule,
        map: null,
      }
    },
  }
}

module.exports = markdownPlugin
