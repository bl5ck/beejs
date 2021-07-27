import BModuleManager from '../module/BModuleManager';

function Static() {
  const manager = new BModuleManager();
  return function <T>(
    target: T,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    manager.markForStatic(target, key as string);
    return descriptor;
  };
}
export default Static;
