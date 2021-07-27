import RuntimeCompiler from '../template/runtime-compiler/RuntimeCompiler';
import DecoratedModule from '../types/interfaces/DecoratedModule';
import WatchConfigs from '../types/interfaces/WatchConfigs';
import EventHandler from '../types/types/Handler';

export class BModule {
  private handlers = {};
  private overriddenHandlers = {};
  private runtimeCompiler = new RuntimeCompiler();
  private watchingData = {};
  βWatch(target: DecoratedModule, property: string, config?: WatchConfigs) {
    Object.defineProperty(target, property, {
      get: () => {
        return this.watchingData[property];
      },
      set: (value: any) => {
        if (this.watchingData[property] !== value) {
          this.watchingData[property] = value;
          this.βRender(target.βModule.βUuidOrDefault(undefined));
        }
      },
    });
  }
  βUuidOrDefault(uuid: string) {
    // placeholder for precompiler uuid process
    return uuid;
  }
  βRegisterHandler(handlerName: string, f: EventHandler) {
    this.handlers[handlerName] = f;
  }
  βOverrideHandlers(uuid: string, newHandlers) {
    this.overriddenHandlers[uuid] = this.runtimeCompiler.registerHandler(
      uuid,
      this.handlers,
      newHandlers
    );
  }
  βStartup(uuid: string) {
    uuid = this.βUuidOrDefault(uuid);
    this.βRender(uuid);
  }
  βRender(uuid: string) {
    uuid = this.βUuidOrDefault(uuid);
  }
}
