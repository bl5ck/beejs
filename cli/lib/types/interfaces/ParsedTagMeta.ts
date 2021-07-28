import HashObject from '../types/HashObject';

export default interface ParsedTagMeta {
  tagName: string;
  args: HashObject<string | boolean>;
  content: string;
}
