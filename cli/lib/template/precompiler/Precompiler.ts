import Singleton from '../../decorators/Singleton';
import * as fs from 'fs';
import Parser from './Parser';

@Singleton
export default class Precompiler {
  private staticValues;
  private parser = new Parser();
  setStaticValue<T>(filePath: string, property: string, value: T) {
    if (!this.staticValues[filePath]) {
      this.staticValues[filePath] = {};
    }
    this.staticValues[filePath][property] = value;
  }
  resolveStaticValue<T>(filePath: string, property: string): T {
    return this.staticValues[filePath][property];
  }
  parseBeeFile(path: string) {
    const content = fs.readFileSync(path, 'utf8');
    return this.parser.parse(content);
  }
  bootstrap() {}
}
