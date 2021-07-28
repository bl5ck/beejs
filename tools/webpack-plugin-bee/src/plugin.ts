import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/validate';
import * as schema from './options.json';
import * as path from 'path';
import { Compiler, Compilation, Dependency } from 'webpack';
import { Precompiler } from '@mybee/cli';
export = class BeeWebpackPlugin {
  options: {
    index: string;
    entry: string;
  };
  precompiler = new Precompiler();
  constructor(
    options = {
      index: path.resolve(__dirname, 'public', 'index.html'),
      entry: null,
    }
  ) {
    validate(schema as Schema, options, {
      name: 'Bee Webpack Plugin',
      baseDataPath: 'options',
    });
    this.options = options;
  }
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler: Compiler) {
    // Specify the event hook to attach to
    compiler.hooks.emit.tapAsync(
      'BeeWebpackPlugin',
      (compilation: Compilation, callback) => {
        // console.log(
        //   'Here’s the `compilation` object which represents a single build of assets:',
        //   compilation
        // );

        // Manipulate the build using the plugin API provided by webpack
        // compilation.addModule(/* ... */);
        if (this.options.entry) {
          // clean bee js chunk
          compilation.chunks.forEach(chunk => {
            if (this.options.entry === chunk.name) {
              chunk.files.forEach(file => {
                if (file.match(/.*\.js$/)) {
                  compilation.deleteAsset(file);
                }
              });
            }
          });
          const dependencies = compilation.entries.get(
            this.options.entry
          ).dependencies;
          Promise.all(
            dependencies.map((dependency: Dependency & { request: string }) =>
              new Promise(resolve =>
                resolve(this.precompiler.parseBeeFile(dependency.request))
              )
                .then(meta => {})
                .catch(error => ({ success: false, error: error }))
            )
          );
        }
        callback();
      }
    );
  }
};
