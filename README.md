# rollup-plugin-markdown

[![CircleCI](https://circleci.com/gh/jackfranklin/rollup-plugin-markdown.svg?style=svg)](https://circleci.com/gh/jackfranklin/rollup-plugin-markdown)

A Rollup plugin to parse Markdown files.

- [Showdown][showdown] is used to parse the Markdown
- [Gray Matter][gray-matter] is used to parse front-matter from the markdown file.

## Install

```
npm install --save-dev @jackfranklin/rollup-plugin-markdown

yarn add --dev @jackfranklin/rollup-plugin-markdown
```

## Example module output

```js
import blogPost from './blog-post.md'

// from this import you get:
blogPost.html // the parsed HTML
blogPost.metadata // a JS object of the front-matter
blogPost.filename // blog-post.md - the filename that was imported
```

## Rollup configuration

```js
import markdown from '@jackfranklin/rollup-plugin-markdown'

export default {
  input: 'your-app.js',
  plugins: [markdown()],
}
```

You can pass in two options: `include` and `exclude`, which are globs to limit which file(s) the plugin is applied to.

The plugin will only parse `.md` files.

[showdown]: https://github.com/showdownjs/showdown
[gray-matter]: https://github.com/jonschlinkert/gray-matter
 
## Changelog

#### 0.2.0
- expose full path to Markdown file as `.path` from the import.

#### 0.1.0
- Initial release
