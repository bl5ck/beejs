import BModuleManager from '../module/BModuleManager';
import WatchConfigs from '../types/interfaces/WatchConfigs';

function Watch(config?: WatchConfigs) {
  const manager = new BModuleManager();
  return function <T>(
    target: T,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    manager.markForWatch(target, key as string, config);
    return descriptor;
  };
}
export default Watch;
