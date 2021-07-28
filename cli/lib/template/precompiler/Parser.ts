import Singleton from '../../decorators/Singleton';

@Singleton
export default class Parser {
  matchAll(
    regex: RegExp,
    processing: string,
    eachFn?: (matches: Array<string>, index: number) => void
  ) {
    let matches: RegExpMatchArray;
    // reassign to avoid the case regex constructor was passed in
    let r = regex;
    const allMatches: Array<Array<string>> = [];
    while ((matches = r.exec(processing)) !== null) {
      const found = [...matches];
      if (eachFn) {
        eachFn(found, matches.index);
      }
      allMatches.push(found);
    }
    return allMatches;
  }
  parse(content: string) {
    const scriptTags = this.getScriptTags(content);
    const styleTags = this.getStyleTags(content);
    const scripts = [];
    const styles = [];
    const processTag = (tag: string) => {
      if (scriptTags.includes(tag)) {
        scripts.push(this.parseTagString(tag, 'script'));
        return;
      }
      if (styleTags.includes(tag)) {
        styles.push(this.parseTagString(tag, 'style'));
      }
    };
    const template = []
      .concat(scriptTags, styleTags)
      .reduce((previousContent, replaceTag) => {
        processTag(replaceTag);
        return previousContent.replace(replaceTag, '');
      }, content);
    return {
      scripts,
      styles,
      template,
    };
  }
  parseTagString(tagString: string, tagName: string) {
    const processing = tagString.trim();
    const content = processing.replace(this.getTagContentToken(tagName), '');
    const args = {};
    const argsMatches = processing.match(this.getTagArgsStringToken(tagName));
    if (argsMatches && argsMatches[1]) {
      this.matchAll(this.getTagArgsToken(), argsMatches[1], matches => {
        const [_, key, value] = matches;
        args[key] = value || true;
      });
    }
    return {
      tagName,
      args,
      content,
    };
  }
  getTagToken(tagName: string): RegExp {
    return new RegExp(`(<${tagName}[^>]*>(?:.*?)<\/${tagName}>)`, 'gs');
  }
  getTagContentToken(tagName: string): RegExp {
    return new RegExp(`^<${tagName}[^>]*>|<\/${tagName}>$`, 's');
  }
  getTagArgsStringToken(tagName: string): RegExp {
    return new RegExp(`^<${tagName}([^>]*)>`, 's');
  }
  getTagArgsToken(): RegExp {
    return /(?:^| )([a-zA-Z][a-zA-Z_0-9$-]+)(?:="([^"]+)"| |$)/gs;
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
