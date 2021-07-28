import ParsedTagMeta from './ParsedTagMeta';

export default interface ParsedMeta {
  template: string;
  styles: Array<ParsedTagMeta>;
  scripts: Array<ParsedTagMeta>;
}
