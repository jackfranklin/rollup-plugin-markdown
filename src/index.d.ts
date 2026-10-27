import { Plugin } from "rollup";

// markdown-it's types are declared here rather than imported, because
// markdown-it's own .d.cts fails to compile under `module: node16`.
declare namespace markdownPlugin {
  /** A markdown-it plugin, as you would pass it to `md.use()`. */
  type MarkdownItPlugin = (md: any, ...params: any[]) => void;

  /** @see https://markdown-it.github.io/markdown-it/#MarkdownIt.new */
  interface MarkdownItOptions {
    html?: boolean;
    xhtmlOut?: boolean;
    breaks?: boolean;
    langPrefix?: string;
    linkify?: boolean;
    typographer?: boolean;
    quotes?: string | string[];
    highlight?: ((str: string, lang: string, attrs: string) => string) | null;
    maxNesting?: number;
  }

  /** Options passed to the Markdown Rollup plugin. */
  interface MarkdownPluginOptions {
    /**
     * A glob to limit which Markdown file(s) the plugin includes.
     *
     * @example "src/md/*.md"
     *
     */
    include?: string | string[];

    /**
     * A glob to limit which Markdown file(s) the plugin excludes.
     *
     * @example "README.md"
     *
     */
    exclude?: string | string[];

    /**
     * Options to pass to markdown-it. These are merged over the plugin's
     * defaults of `{ html: true, linkify: true, breaks: true }`.
     *
     * @example
     *
     * ```ts
     * import markdown from '@jackfranklin/rollup-plugin-markdown'
     *
     * markdown({
     *   markdownItOptions: {
     *     breaks: false
     *   }
     * })
     * ```
     *
     * @default { }
     *
     */
    markdownItOptions?: MarkdownItOptions;

    /**
     * An array of markdown-it plugins. Pass `[plugin, ...params]` to give a
     * plugin parameters.
     *
     * @example
     *
     * ```ts
     * import markdown from '@jackfranklin/rollup-plugin-markdown'
     * import anchor from 'markdown-it-anchor'
     * import taskLists from 'markdown-it-task-lists'
     *
     * markdown({
     *   markdownItPlugins: [taskLists, [anchor, { tabIndex: false }]]
     * })
     * ```
     *
     * @default [ ]
     *
     */
    markdownItPlugins?: Array<MarkdownItPlugin | [MarkdownItPlugin, ...any[]]>;

    /**
     * Whether to export each Markdown file as a JavaScript module
     * (`export default {...}`). When `false`, the plugin outputs the bare JSON.
     *
     * @default true
     *
     */
    allowImports?: boolean;

    /**
     * Render each string front-matter value as inline Markdown.
     *
     * @default false
     *
     */
    parseFrontMatterAsMarkdown?: boolean;
  }

  /** The exported parsed HTML and metadata for a given Markdown file. */
  interface MarkdownModuleExport {
    /** The output HTML from the parsed Markdown. */
    html: string;

    /**
     * A JS object of the parsed Markdown front-matter
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
     * {
     *   name: "John Doe"
     * }
     * ```
     *
     */
    metadata: {
      [key: string]: any;
    };

    /**
     * The name of the parsed Markdown file.
     *
     * @example "blog-post.md"
     *
     */
    filename: string;

    /**
     * The absolute path to the parsed Markdown file.
     *
     * @example "~/src/blog-post.md"
     *
     */
    path: string;
  }
}

/**
 * A Rollup plugin that converts Markdown to HTML using markdown-it.
 *
 * @param options Options passed to the Markdown Rollup plugin.
 * @see https://github.com/jackfranklin/rollup-plugin-markdown
 */
declare function markdownPlugin(options?: markdownPlugin.MarkdownPluginOptions): Plugin;

export = markdownPlugin;
