import BModuleManager from '../module/BModuleManager';

function Bind() {
  const manager = new BModuleManager();
  return function <T>(
    target: T,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    manager.markForBind(target, key as string);
    return descriptor;
  };
}

export default Bind;
