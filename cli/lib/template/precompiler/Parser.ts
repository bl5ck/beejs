import Singleton from '../../decorators/Singleton';

@Singleton
export default class Parser {
  parse(content: string) {
    const scriptTags = this.getScriptTags(content);
    const styleTags = this.getStyleTags(content);
    const template = []
      .concat(scriptTags, styleTags)
      .reduce(
        (previousContent, replaceTag) =>
          previousContent.replace(replaceTag, ''),
        content
      );
    return {
      scriptTags,
      styleTags,
      template,
    };
  }
  getTagToken(tagName: string) {
    return new RegExp(`<${tagName}[^>]*>(?:.*?)</${tagName}>`, 'gs');
  }
  getTags(tagName: string, content: string) {
    const matches = content.match(this.getTagToken(tagName));
    if (!matches || !matches.length) {
      return [];
    }
    return matches;
  }
  getScriptTags(content: string) {
    return this.getTags('script', content);
  }
  getStyleTags(content: string) {
    return this.getTags('style', content);
  }
}
