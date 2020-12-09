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
    showdownExtensions: showdownExtns = []
  } = options

  showdownExtns.forEach(extension => {
    showdown.extension(extension.name, extension);
  });

  const converter = new showdown.Converter({
    metadata: true,
    ...showdownOpts
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

      const exportFromModule = JSON.stringify({
        html,
        metadata: matterResult.data,
        filename: path.basename(id),
        path: id,
      })

      return {
        code: `export default ${exportFromModule}`,
        map: { mappings: '' },
      }
    },
  }
}

module.exports = markdownPlugin
