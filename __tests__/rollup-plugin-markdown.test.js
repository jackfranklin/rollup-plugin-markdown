const rollup = require('rollup')
const path = require('path')
const Module = require('module')
const markdownPlugin = require('../src/rollup-plugin-markdown')

function requireFromString(code) {
  const opts = {}
  const filename = 'test_require_from_string.js'

  opts.appendPaths = opts.appendPaths || []
  opts.prependPaths = opts.prependPaths || []

  if (typeof code !== 'string') {
    throw new Error('code must be a string, not ' + typeof code)
  }

  var paths = Module._nodeModulePaths(path.dirname(filename))

  var parent = module.parent
  var m = new Module(filename, parent)
  m.filename = filename
  m._compile(code, filename)

  var exports = m.exports
  parent &&
    parent.children &&
    parent.children.splice(parent.children.indexOf(m), 1)

  return exports
}

process.chdir(__dirname)

const bundleFileAndGetCode = async rollupConfig => {
  const bundle = await rollup.rollup(rollupConfig)

  const { output } = await bundle.generate({ format: 'cjs' })

  const [{ code }] = output
  return code
}

it('returns a module for the markdown file', async () => {
  const code = await bundleFileAndGetCode({
    input: 'fixtures/test.md',
    plugins: [markdownPlugin()],
  })

  const requiredModule = requireFromString(code)

  expect(requiredModule.html).toMatchSnapshot()
  expect(requiredModule.metadata).toEqual({
    layout: 'post',
    title: 'Avoiding recursive useEffect hooks in React',
    intro: expect.any(String),
  })
  expect(requiredModule.filename).toEqual('test.md')
  expect(requiredModule.path).toEqual(path.resolve(path.join(__dirname, 'fixtures/test.md')))
})
