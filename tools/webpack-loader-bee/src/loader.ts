import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/validate';

import * as schema from './options.json';

export = function beeLoader(source) {
  const options = getOptions(this);

  validate(schema as Schema, options, {
    name: 'Bee Loader',
    baseDataPath: 'options',
  });
  const json = JSON.stringify(source)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  const esModule =
    typeof options.esModule !== 'undefined' ? options.esModule : true;

  return `${esModule ? 'export default' : 'module.exports ='} ${json};`;
};
