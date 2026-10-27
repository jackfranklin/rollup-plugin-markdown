import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'
import { rollup } from 'rollup'
import markdown from '../src/index.js'

const fixture = path.join(import.meta.dirname, 'fixtures/test.md')

const bundleAndImport = async (input, options) => {
  const bundle = await rollup({ input, plugins: [markdown(options)] })
  const { output } = await bundle.generate({ format: 'es' })
  const { default: result } = await import(
    `data:text/javascript,${encodeURIComponent(output[0].code)}`
  )
  return result
}

const transform = (source, options, id = '/project/src/test.md') =>
  markdown(options).transform(source, id)

const parse = (source, options) =>
  JSON.parse(transform(source, options).code.replace(/^export default /, ''))

const htmlFor = (source, options) => parse(source, options).html

test('returns a module for the markdown file', async () => {
  const result = await bundleAndImport(fixture, {
    parseFrontMatterAsMarkdown: true,
  })

  assert.equal(
    result.html,
    `<p>It's fair to say that React 16.8 and the introduction of<br>
<a href="https://reactjs.org/docs/hooks-intro.html">hooks</a> has really changed how we<br>
write React. Hooks are one of those APIs that make you realise the flaws of the<br>
previous approach <em>after</em> you stop using it. I remember being very skeptical of<br>
hooks when they were first released, not thinking that the previous class based<br>
design had many flaws, but I've since come to realise I was very wrong, and<br>
hooks are a vast improvement on how we build React components. If you're<br>
interested in comparing the old vs the new, I wrote a<br>
<a href="/refactoring-to-react-hooks/">blog post refactoring a component to use hooks</a><br>
that offers a nice comparison.</p>
`
  )
  assert.deepEqual(result.metadata, {
    layout: 'post',
    title: 'Avoiding recursive useEffect hooks in React',
    intro:
      'A short post today about an easy tactic to avoid your <em>useEffect</em> calls becoming recursive when setting state.',
    about: [
      { author: 'John Doe' },
      { keywords: ['React', 'useEffect', 'recursion'] },
    ],
  })
  assert.equal(result.filename, 'test.md')
  assert.equal(result.path, fixture)
})

test('does not return a module when allowImports is false', async () => {
  await assert.rejects(bundleAndImport(fixture, { allowImports: false }), {
    code: 'PARSE_ERROR',
  })
})

test('respects include and exclude', () => {
  assert.equal(transform('# hi', { exclude: '**/test.md' }), null)
  assert.equal(transform('# hi', { include: 'docs/**' }), null)
  assert.ok(transform('# hi', { include: '**/src/*.md' }))
})

test('ignores files that are not markdown', () => {
  assert.equal(transform('# hi', {}, '/project/src/test.js'), null)
})

test('returns no source map', () => {
  assert.equal(transform('# hi').map, null)
})

test('passes raw HTML, including custom elements, through untouched', () => {
  assert.equal(
    htmlFor(
      'Press <help-key>WASD</help-key> to move.\n\n<game-key>h</game-key>'
    ),
    '<p>Press <help-key>WASD</help-key> to move.</p>\n<p><game-key>h</game-key></p>\n'
  )
})

test('renders GitHub-style tables', () => {
  assert.equal(
    htmlFor('| Speed | Cost |\n|:--|--:|\n| Fast | 3 |'),
    `<table>
<thead>
<tr>
<th style="text-align:left">Speed</th>
<th style="text-align:right">Cost</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left">Fast</td>
<td style="text-align:right">3</td>
</tr>
</tbody>
</table>
`
  )
})

test('parses YAML front matter', () => {
  const { metadata, html } = parse(
    '---\ntitle: Hi\ndate: 2024-01-02\ndraft: yes\nbase: &base\n  a: 1\nmerged:\n  <<: *base\n  b: 2\n---\n# Body\n'
  )

  assert.deepEqual(metadata, {
    title: 'Hi',
    date: '2024-01-02T00:00:00.000Z',
    draft: 'yes',
    base: { a: 1 },
    merged: { a: 1, b: 2 },
  })
  assert.equal(html, '<h1>Body</h1>\n')
})

test('handles files without front matter, or with empty front matter', () => {
  assert.deepEqual(parse('# Body'), parse('---\n---\n# Body'))
  assert.deepEqual(parse('# Body'), parse('---\n# just a comment\n---\n# Body'))
  assert.deepEqual(parse('# Body').metadata, {})
  assert.equal(parse('\uFEFF---\na: 1\n---\n# Body').metadata.a, 1)
  assert.equal(parse('---\r\na: 1\r\n---\r\n# Body').metadata.a, 1)
})

test('treats an unclosed opening --- as markdown, not front matter', () => {
  assert.equal(htmlFor('---\n\nHello'), '<hr>\n<p>Hello</p>\n')
})

test('reports invalid front matter', () => {
  assert.throws(() => transform('---\na: [1\n---\n'))
})

test('leaves non-string front matter alone when parsing it as markdown', () => {
  const { metadata } = parse(
    '---\ncount: 3\ndraft: false\nnothing:\ntitle: A *b*\n---\nhi',
    { parseFrontMatterAsMarkdown: true }
  )

  assert.deepEqual(metadata, {
    count: 3,
    draft: false,
    nothing: null,
    title: 'A <em>b</em>',
  })
})

test('accepts markdown-it options', () => {
  assert.equal(
    htmlFor('one\ntwo', { markdownItOptions: { breaks: false } }),
    '<p>one\ntwo</p>\n'
  )
})

test('accepts markdown-it plugins, with or without params', () => {
  const shout = (md, suffix = '!') => {
    md.core.ruler.push('shout', (state) => {
      for (const token of state.tokens) {
        if (token.type !== 'inline') continue
        for (const child of token.children) {
          if (child.type === 'text') {
            child.content = child.content.toUpperCase() + suffix
          }
        }
      }
    })
  }

  assert.equal(htmlFor('hi', { markdownItPlugins: [shout] }), '<p>HI!</p>\n')
  assert.equal(
    htmlFor('hi', { markdownItPlugins: [[shout, '?']] }),
    '<p>HI?</p>\n'
  )
})
