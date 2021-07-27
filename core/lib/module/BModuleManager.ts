import Singleton from '../decorators/Singleton';
import BindToConfigs from '../types/interfaces/BindToConfigs';
import DecoratorMeta from '../types/interfaces/DecoratorMeta';
import DeferredModuleMeta from '../types/interfaces/DeferredModuleMeta';
import HashObject from '../types/interfaces/HashObject';
import WatchConfigs from '../types/interfaces/WatchConfigs';
import { BModule } from './BModule';

@Singleton
export default class BModuleManager {
  private decoratedBind: HashObject<Array<string>> = {};
  private decoratedBindTo: HashObject<Array<DecoratorMeta<BindToConfigs>>> = {};
  private decoratedWatch: HashObject<Array<DecoratorMeta<WatchConfigs>>> = {};
  private decoratedStatic: HashObject<Array<string>> = {};
  private modules: HashObject<BModule> = {};
  private deferredModules: HashObject<DeferredModuleMeta> = {};
  markForBind<T>(target: T, property: string) {
    if (!this.decoratedBind[target.constructor.name]) {
      this.decoratedBind[target.constructor.name] = [];
    }
    this.decoratedBind[target.constructor.name].push(property);
  }
  markForBindTo<T>(target: T, property: string, config: BindToConfigs) {
    if (!this.decoratedBindTo[target.constructor.name]) {
      this.decoratedBindTo[target.constructor.name] = [];
    }
    this.decoratedBindTo[target.constructor.name].push({
      name: property,
      config,
    });
  }
  markForWatch<T>(target: T, property: string, config?: WatchConfigs) {
    if (!this.decoratedWatch[target.constructor.name]) {
      this.decoratedWatch[target.constructor.name] = [];
    }
    this.decoratedWatch[target.constructor.name].push({
      name: property,
      config,
    });
  }
  markForStatic<T>(target: T, property: string) {
    if (!this.decoratedStatic[target.constructor.name]) {
      this.decoratedStatic[target.constructor.name] = [];
    }
    this.decoratedStatic[target.constructor.name].push(property);
  }
  getDecoratedBind(moduleName: string) {
    return this.decoratedBind[moduleName];
  }
  getDecoratedBindTo(moduleName: string) {
    return this.decoratedBindTo[moduleName];
  }
  getDecoratedWatch(moduleName: string) {
    return this.decoratedWatch[moduleName];
  }
  getDecoratedStatic(moduleName: string) {
    return this.decoratedStatic[moduleName];
  }
  registerModule(moduleName: string, module: BModule) {
    this.modules[moduleName] = module;
  }
  getModule(moduleName) {
    return this.modules[moduleName];
  }
  bindTo(
    uuid: string,
    source: BModule,
    property: string,
    config: BindToConfigs
  ) {
    const overrideModule = this.getModule(config.overrideModule);
    const bindTo = (bModule: BModule) => {
      bModule.βOverrideHandlers(uuid, {
        [property]: {
          isPreventDefault: Boolean(config.isPreventDefault),
          fn: source[property],
        },
      });
    };
    if (!overrideModule) {
      const deferred = new Promise(
        (resolve: (bModule: BModule) => void, reject) => {
          this.deferredModules[config.overrideModule] = { resolve, reject };
        }
      );
      deferred.then(bindTo);
    } else {
      bindTo(overrideModule);
    }
  }
}
