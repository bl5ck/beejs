import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/validate';
import * as schema from './options.json';
export = class BeeWebpackPlugin {
  constructor(options = {}) {
    validate(schema as Schema, options, {
      name: 'Bee Webpack Plugin',
      baseDataPath: 'options',
    });
  }

  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    // Specify the event hook to attach to
    compiler.hooks.emit.tapAsync(
      'BeeWebpackPlugin',
      (compilation, callback) => {
        console.log('This is an example plugin!');
        console.log(
          'Here’s the `compilation` object which represents a single build of assets:',
          compilation
        );

        // Manipulate the build using the plugin API provided by webpack
        // compilation.addModule(/* ... */);

        callback();
      }
    );
  }
};
