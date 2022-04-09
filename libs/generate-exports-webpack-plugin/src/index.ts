import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs/promises'
import globby from 'globby'
import { Options, PluginOptions } from './types'

class GenerateExportsWebpackPlugin {
  defaultOptions: PluginOptions = {
    omitExtension: true,
    omitSemi: false,
    singleQuote: true,
    filename: 'index.js',
    include: [],
    exclude: [],
    directories: [],
  }

  options!: PluginOptions

  constructor(options = {}) {
    this.options = { ...this.defaultOptions, ...options }
  }

  apply() {
    this.options.directories.forEach((directoryConfig) => {
      const directoryConfigIsArray = Array.isArray(directoryConfig)
      let directory = directoryConfigIsArray
        ? directoryConfig[0]
        : directoryConfig
      const options = directoryConfigIsArray
        ? { ...this.defaultOptions, ...(directoryConfig[1] || this.options) }
        : this.options
      if (!path.isAbsolute(directory)) directory = path.resolve(directory)
      if (process.env.NODE_ENV === 'production') {
        return this.generateIndex(directory, options)
      }
      const watcher = chokidar.watch(options.include, {
        ignored: /^\./,
        cwd: directory,
      })

      watcher
        .on('add', (filePath) =>
          this.handleFileChange(filePath, directory, options),
        )
        .on('unlink', (filePath) =>
          this.handleFileChange(filePath, directory, options),
        )
        .on('ready', () => this.handleFileChange('', directory, options))
    })
  }

  handleFileChange(filePath: string, directory, options) {
    if (filePath !== path.join(directory, options.filename)) {
      this.generateIndex(directory, options)
    }
  }

  btfs(path: string): string {
    return path.replace(/\\/g, '/')
  }

  async fileExists(path: string) {
    return !!(await fs.stat(path).catch((e) => false))
  }

  generateIndex(directory: string, options: PluginOptions | Options) {
    if (!path.isAbsolute(directory)) directory = path.resolve(directory)
    const { btfs } = this
    const { filename, include, exclude } = options
    const indexPath = btfs(path.join(directory, filename))
    globby(include, {
      cwd: directory,
      ignore: exclude,
    })
      .then((files) => {
        const indexTemplate = this.getTemplate(directory, options, files)
        return this.fileExists(indexPath)
          .then(async (exists) => {
            if (exists) {
              const fileContent = await fs.readFile(indexPath, 'utf8')
              if (fileContent === indexTemplate)
                return Promise.reject('Contents are identical.')
            }
            return fs.mkdir(path.parse(indexPath).dir, { recursive: true })
          })
          .then(() => fs.writeFile(indexPath, indexTemplate))
      })
      .catch(() => {})
  }

  getTemplate(
    directory: string,
    options: PluginOptions | Options,
    files: string[],
  ) {
    const { btfs } = this
    const { omitExtension, omitSemi, singleQuote } = options
    const quoteType = singleQuote ? "'" : '"'
    return `/**
* This file is auto-generated by GenerateExportsWebpackPlugin.
* Check this file into source control.
* Do not edit this file.
*/\n${files
      .sort((a, b) => a.localeCompare(b))
      .map((filePath) => {
        const { name } = path.parse(filePath)
        const exportRelativePath = btfs(
          btfs(filePath)
            .replace(btfs(directory), '')
            .replace(omitExtension ? /\.[^/.]+$/ : '', ''),
        )
        return `export { default as ${name} } from ${quoteType}${
          exportRelativePath.startsWith('/')
            ? `.${exportRelativePath}`
            : `./${exportRelativePath}`
        }${quoteType}${omitSemi ? '' : ';'}`
      })
      .join('\n')}\n/* End of auto-generated content. */\n`
  }
}

module.exports = GenerateExportsWebpackPlugin
