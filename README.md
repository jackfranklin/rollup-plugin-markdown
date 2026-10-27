# rollup-plugin-markdown

[![CircleCI](https://circleci.com/gh/jackfranklin/rollup-plugin-markdown.svg?style=svg)](https://circleci.com/gh/jackfranklin/rollup-plugin-markdown)

A Rollup plugin to parse Markdown files. The parsed Markdown can either be imported as a JavaScript module, or piped through the Rollup build process.

- [markdown-it][markdown-it] is used to parse a Markdown file.
- [Gray Matter][gray-matter] is used to parse front-matter from a Markdown file.

## Install

```text
npm install --save-dev @jackfranklin/rollup-plugin-markdown

yarn add --dev @jackfranklin/rollup-plugin-markdown
```

## Example module output

```js
import blogPost from './src/blog-post.md'

// from this import you get:
blogPost.html // the parsed HTML
blogPost.metadata // a JS object of the front-matter
blogPost.filename // blog-post.md - the filename that was imported
blogPost.path // ./src/blog-post.md - the path to the file that was imported
```

## Rollup configuration

```js
import markdown from '@jackfranklin/rollup-plugin-markdown'

export default {
  input: 'your-app.js',
  plugins: [
    markdown({
      include?: 'src/md/*.md',
      exclude?: 'README.md',
      markdownItOptions?: {},
      markdownItPlugins?: [],
      allowImports?: true,
      parseFrontMatterAsMarkdown?: false
    })
  ],
}
```

You can pass in six options:

- `include` and `exclude`, which are globs to limit which file(s) the plugin is applied to.
- `markdownItOptions`, which are [options to pass to markdown-it](https://markdown-it.github.io/markdown-it/#MarkdownIt.new). They are merged over the plugin's defaults of `{ html: true, linkify: true, breaks: true }`.
- `markdownItPlugins`, which is an array of [markdown-it plugins](https://www.npmjs.com/search?q=keywords:markdown-it-plugin). Pass `[plugin, ...params]` to give a plugin parameters.
- `allowImports`, a flag to tell the plugin whether or not to export the Markdown files as JavaScript modules.
- `parseFrontMatterAsMarkdown`, a flag that converts string front-matter values into inline HTML (without enclosing `<p></p>` tags).

The plugin will only parse `.md` files.

Raw HTML in your Markdown, including custom elements, is passed through untouched. The output is not sanitised, so only use the plugin on Markdown you trust.

### Heading IDs and task lists

Showdown, which this plugin used before 0.5.0, added `id` attributes to headings and rendered `- [ ]` task lists as checkboxes. markdown-it does neither by default; add plugins if you need them:

```js
import markdown from '@jackfranklin/rollup-plugin-markdown'
import anchor from 'markdown-it-anchor'
import taskLists from 'markdown-it-task-lists'

markdown({
  markdownItPlugins: [anchor, taskLists],
})
```

## TypeScript

The plugin ships its own type definitions. To import `.md` files from TypeScript, you can use the following declaration:

```ts
declare module '*.md' {
  const styles: {
    html: string
    filename: string
    path: string
    metadata: Record<string, string>
  }

  export default styles
}
```

[markdown-it]: https://github.com/markdown-it/markdown-it
[gray-matter]: https://github.com/jonschlinkert/gray-matter

## Changelog

#### Unreleased (breaking)

- Replace Showdown with markdown-it. Showdown is unmaintained and has unfixed security advisories ([GHSA-rmmh-p597-ppvv](https://github.com/advisories/GHSA-rmmh-p597-ppvv), [GHSA-cr32-g25g-vxjj](https://github.com/advisories/GHSA-cr32-g25g-vxjj), [GHSA-22g5-r2x5-97cx](https://github.com/advisories/GHSA-22g5-r2x5-97cx)).
  - **Breaking:** `showdownOptions` and `showdownExtensions` are replaced by `markdownItOptions` and `markdownItPlugins`.
  - **Breaking:** headings no longer get `id` attributes and task lists are no longer rendered as checkboxes. See [Heading IDs and task lists](#heading-ids-and-task-lists) to restore them.
  - Tables, raw HTML, autolinked URLs and single-newline line breaks work as before. Strikethrough now renders as `<s>` rather than `<del>`.
- Fix `include` and `exclude`, which were previously ignored.
- `parseFrontMatterAsMarkdown` no longer throws on front-matter values that are not strings (numbers, booleans, `null`); they are left as they are.
- Type definitions are now found by TypeScript (`types` in `package.json`), and cover `allowImports` and `parseFrontMatterAsMarkdown`.
- Switch from `rollup-pluginutils` to `@rollup/pluginutils`, and return `map: null` rather than an empty source map.

#### 0.4.0 [4th July 2022]

- [Add TypeScript definitions](https://github.com/jackfranklin/rollup-plugin-markdown/pull/17) - thanks @tommy-mitchell for the PR.
- [Add options for parsing front matter and piping through Rollup](https://github.com/jackfranklin/rollup-plugin-markdown/pull/16) - thanks @tommy-mitchell for the PR.

#### 0.3.0 [13th Jan 2021]

- Allow Showdown options and extensions to be registered. Thanks to @mattfran and @arnorhs for their contributions.

#### 0.2.0

- expose full path to Markdown file as `.path` from the import.

#### 0.1.0

- Initial release
