import { BModule } from '../../module/BModule';

export default interface DeferredModuleMeta {
  resolve: (bModule: BModule) => void;
  reject: (error: Error) => void;
}
