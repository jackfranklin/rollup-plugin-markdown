import type { MarkdownIt, MarkdownItOptions } from 'markdown-it'
import type { Plugin } from 'rollup'

/** A markdown-it plugin, as you would pass it to `md.use()`. */
export type MarkdownItPlugin = (md: MarkdownIt, ...params: any[]) => void

/** Options passed to the Markdown Rollup plugin. */
export interface MarkdownPluginOptions {
  /**
   * A glob, or globs, to limit which Markdown file(s) the plugin includes.
   *
   * @example "src/md/*.md"
   */
  include?: string | string[]

  /**
   * A glob, or globs, to limit which Markdown file(s) the plugin excludes.
   *
   * @example "README.md"
   */
  exclude?: string | string[]

  /**
   * Options to pass to markdown-it. These are merged over the plugin's
   * defaults of `{ html: true, linkify: true, breaks: true }`.
   *
   * @example
   *
   * ```ts
   * markdown({
   *   markdownItOptions: { breaks: false },
   * })
   * ```
   *
   * @default {}
   */
  markdownItOptions?: MarkdownItOptions

  /**
   * An array of markdown-it plugins. Pass `[plugin, ...params]` to give a
   * plugin parameters.
   *
   * @example
   *
   * ```ts
   * import anchor from 'markdown-it-anchor'
   * import taskLists from 'markdown-it-task-lists'
   *
   * markdown({
   *   markdownItPlugins: [taskLists, [anchor, { tabIndex: false }]],
   * })
   * ```
   *
   * @default []
   */
  markdownItPlugins?: Array<MarkdownItPlugin | [MarkdownItPlugin, ...any[]]>

  /**
   * Whether to export each Markdown file as a JavaScript module
   * (`export default {...}`). When `false`, the plugin outputs the bare JSON.
   *
   * @default true
   */
  allowImports?: boolean

  /**
   * Render each string front-matter value as inline Markdown.
   *
   * @default false
   */
  parseFrontMatterAsMarkdown?: boolean
}

/** The exported parsed HTML and metadata for a given Markdown file. */
export interface MarkdownModuleExport {
  /** The output HTML from the parsed Markdown. */
  html: string

  /**
   * The parsed YAML front matter.
   *
   * @example
   *
   * **input**:
   *
   * ```md
   * ---
   * name: John Doe
   * ---
   * ```
   *
   * **output**:
   *
   * ```ts
   * { name: 'John Doe' }
   * ```
   */
  metadata: Record<string, any>

  /**
   * The name of the parsed Markdown file.
   *
   * @example "blog-post.md"
   */
  filename: string

  /**
   * The absolute path to the parsed Markdown file.
   *
   * @example "/home/me/site/src/blog-post.md"
   */
  path: string
}

/**
 * A Rollup plugin that converts Markdown to HTML using markdown-it.
 *
 * @param options Options passed to the Markdown Rollup plugin.
 * @see https://github.com/jackfranklin/rollup-plugin-markdown
 */
export default function markdown(options?: MarkdownPluginOptions): Plugin
