import { ConverterOptions, ShowdownExtension } from "showdown";
import { Plugin } from "rollup";

/** Options passed to the Markdown Rollup plugin. */
interface MarkdownPluginOptions {
  /**
   * A glob to limit which Markdown file(s) the plugin includes.
   * 
   * @example "src/md/*.md"
   * @default ""
   * 
   */
  include?: string;

  /**
   * A glob to limit which Markdown file(s) the plugin excludes.
   * 
   * @example "README.md"
   * @default ""
   * 
   */
  exclude?: string;

  /**
   * An object of options to pass to the Showdown converter.
   * 
   * @example
   * 
   * ```ts
   * import markdown from 'rollup-plugin-markdown'
   * 
   * markdown({
   *   showdownOptions: {
   *     ghMentions: false
   *   }
   * })
   * ```
   * 
   * @defualt { }
   * 
   */
  showdownOptions?: ConverterOptions;

  /**
   * An array of extensions for the Showdown converter to use.
   * 
   * @example
   * 
   * ```ts
   * import markdown from 'rollup-plugin-markdown'
   * import example from './example-extension'
   * 
   * markdown({
   *   showdownExtensions: [example],
   *   showdownOptions: { extensions: ['example'] }
   * })
   * ```
   * 
   * @defualt [ ]
   * 
   */
  showdownExtensions?: ShowdownExtension[];
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

/**
 * A Rollup plugin that converts Markdown to HTML using Showdown.
 * 
 * @param options Options passed to the Markdown Rollup plugin.
 * @see https://github.com/tommy-mitchell/rollup-plugin-markdown
 */
export default function markdownPlugin(options?: MarkdownPluginOptions): Plugin;
