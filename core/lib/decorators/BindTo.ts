import BModuleManager from '../module/BModuleManager';
import BindToConfigs from '../types/interfaces/BindToConfigs';

function BindTo(config: BindToConfigs) {
  const manager = new BModuleManager();
  return function <T>(
    target: T,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    manager.markForBindTo(target, key as string, config);
    return descriptor;
  };
}

export default BindTo;
