import Singleton from '../../decorators/Singleton';
import HashObject from '../../types/interfaces/HashObject';
import TemplateEngine from './TemplateEngine/TemplateEngine';

@Singleton
export default class RuntimeCompiler {
  private template = new TemplateEngine();
  private rootNode: HTMLElement;
  registerRootNode(node: HTMLElement) {
    this.rootNode = node;
  }
  registerHandler(
    uuid: string,
    handlers: HashObject<(...args: Array<any>) => any>,
    newHandlers: any
  ) {
    this.template.registerHandler(uuid, handlers, newHandlers);
  }
  render(uuid) {}
}
