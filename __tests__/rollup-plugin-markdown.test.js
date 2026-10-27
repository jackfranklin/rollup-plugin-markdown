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
    plugins: [
      markdownPlugin({
        parseFrontMatterAsMarkdown: true,
      }),
    ],
  })

  const requiredModule = requireFromString(code)

  expect(requiredModule.html).toMatchSnapshot()
  expect(requiredModule.metadata).toEqual({
    layout: 'post',
    title: 'Avoiding recursive useEffect hooks in React',
    intro: 'A short post today about an easy tactic to avoid your <em>useEffect</em> calls becoming recursive when setting state.',
    about: [
      {
        author: 'John Doe'
      },
      {
        keywords: ['React', 'useEffect', 'recursion']
      },
    ]
  })
  expect(requiredModule.filename).toEqual('test.md')
  expect(requiredModule.path).toEqual(path.resolve(path.join(__dirname, 'fixtures/test.md')))
})

it('does not return a module for the markdown file', async () => {
  await expect(
    bundleFileAndGetCode({
      input: 'fixtures/test.md',
      plugins: [
        markdownPlugin({
          allowImports: false
        })
      ],
    })
  ).rejects.toThrow(
    'Unexpected token (Note that you need plugins to import files that are not JavaScript)'
  )
})

const transformMarkdown = (markdown, options, id = '/project/src/test.md') =>
  markdownPlugin(options).transform(markdown, id)

const htmlFor = (markdown, options) =>
  JSON.parse(transformMarkdown(markdown, options).code.replace(/^export default /, '')).html

it('respects include and exclude', () => {
  expect(transformMarkdown('# hi', { exclude: '**/test.md' })).toBeUndefined()
  expect(transformMarkdown('# hi', { include: 'docs/**' })).toBeUndefined()
  expect(transformMarkdown('# hi', { include: '**/src/*.md' })).toBeDefined()
})

it('ignores files that are not markdown', () => {
  expect(transformMarkdown('# hi', {}, '/project/src/test.js')).toBeUndefined()
})

it('returns no source map', () => {
  expect(transformMarkdown('# hi').map).toBeNull()
})

it('passes raw HTML, including custom elements, through untouched', () => {
  expect(htmlFor('Press <help-key>WASD</help-key> to move.\n\n<game-key>h</game-key>')).toEqual(
    '<p>Press <help-key>WASD</help-key> to move.</p>\n<p><game-key>h</game-key></p>\n'
  )
})

it('renders GitHub-style tables', () => {
  expect(htmlFor('| Speed | Cost |\n|:--|--:|\n| Fast | 3 |')).toMatchSnapshot()
})

it('leaves non-string front matter alone when parsing it as markdown', () => {
  const { code } = transformMarkdown('---\ncount: 3\ndraft: false\nnothing:\ntitle: A *b*\n---\nhi', {
    parseFrontMatterAsMarkdown: true,
  })

  expect(JSON.parse(code.replace(/^export default /, '')).metadata).toEqual({
    count: 3,
    draft: false,
    nothing: null,
    title: 'A <em>b</em>',
  })
})

it('accepts markdown-it options', () => {
  expect(htmlFor('one\ntwo', { markdownItOptions: { breaks: false } })).toEqual('<p>one\ntwo</p>\n')
})

it('accepts markdown-it plugins, with or without params', () => {
  const shout = (md, suffix = '!') => {
    md.core.ruler.push('shout', state => {
      state.tokens.forEach(token => {
        if (token.type === 'inline') {
          token.children.forEach(child => {
            if (child.type === 'text') child.content = child.content.toUpperCase() + suffix
          })
        }
      })
    })
  }

  expect(htmlFor('hi', { markdownItPlugins: [shout] })).toEqual('<p>HI!</p>\n')
  expect(htmlFor('hi', { markdownItPlugins: [[shout, '?']] })).toEqual('<p>HI?</p>\n')
})
