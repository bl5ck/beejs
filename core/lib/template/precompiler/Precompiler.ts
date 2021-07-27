import Singleton from '../../decorators/Singleton';

@Singleton
export default class Precompiler {
  private staticValues = (window as any).βStaticValues;
  setStaticValue<T>(filePath: string, property: string, value: T) {
    if (!this.staticValues[filePath]) {
      this.staticValues[filePath] = {};
    }
    this.staticValues[filePath][property] = value;
  }
  resolveStaticValue<T>(filePath: string, property: string): T {
    return this.staticValues[filePath][property];
  }
  transformImportStatement(path: string) {}
  bootstrap() {}
}
