const { createFilter } = require('rollup-pluginutils')
const path = require('path')
const matter = require('gray-matter')
const showdown = require('showdown')

showdown.setFlavor('github')

const markdownPlugin = (options = {}) => {
  const {
    include,
    exclude,
    showdownOptions: showdownOpts = {},
    showdownExtensions: showdownExtns = [],
    allowImports = true,
    parseFrontMatterAsMarkdown = false,
  } = options

  showdownExtns.forEach(extension => {
    showdown.extension(extension.name, extension)
  })

  const converter = new showdown.Converter({
    metadata: true,
    ...showdownOpts,
  })

  const filter = createFilter(include, exclude)

  return {
    name: 'rollup-plugin-markdown',
    transform(code, id) {
      if (!filter(id) === -1) return

      const extension = path.extname(id)

      if (extension !== '.md') return

      const matterResult = matter(code)
      const html = converter.makeHtml(matterResult.content)

      if (parseFrontMatterAsMarkdown) {
        const parseFrontMatterNested = frontMatter => {
          Object.entries(frontMatter).forEach(([key, value]) => {
            // recurse
            if (value && typeof value === 'object') parseFrontMatterNested(value)
            // convert markdown and remove <p>
            else frontMatter[key] = converter.makeHtml(value).replace(/<\/?p[^>]*>/g, '')
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
        map: { mappings: '' },
      }
    },
  }
}

module.exports = markdownPlugin
