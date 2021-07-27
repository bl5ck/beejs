import { BModule } from '../module/BModule';
import BModuleManager from '../module/BModuleManager';
import DecoratedModule from '../types/interfaces/DecoratedModule';

function Module<
  T extends { new (...args: any[]): DecoratedModule; βModule: BModule }
>(constructor: T): T & DecoratedModule {
  return class extends constructor implements DecoratedModule {
    βModule: BModule;
    constructor(...args: Array<any>) {
      super(...args);
      this.βModule = new BModule();
      const moduleManager = new BModuleManager();

      const decoratedBinds = moduleManager.getDecoratedBind(constructor.name);
      const decoratedBindTos = moduleManager.getDecoratedBindTo(
        constructor.name
      );
      const decoratedWatches = moduleManager.getDecoratedWatch(
        constructor.name
      );

      if (decoratedBinds && decoratedBinds.length) {
        decoratedBinds.forEach(property => {
          this.βModule.βRegisterHandler(property, this[property]);
        });
      }

      if (decoratedBindTos && decoratedBindTos.length) {
        decoratedBindTos.forEach(({ name, config }) => {
          moduleManager.bindTo(
            this.βModule.βUuidOrDefault(undefined),
            this.βModule,
            name,
            config
          );
        });
      }

      decoratedWatches.forEach(({ name, config }) => {
        this.βModule.βWatch(this, name, config);
      });

      moduleManager.registerModule(constructor.name, this.βModule);
    }
  };
}
export default Module;
