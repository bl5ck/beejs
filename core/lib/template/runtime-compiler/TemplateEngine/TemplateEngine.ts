import Singleton from '../../../decorators/Singleton';
import jsonPath from '../../../utils/jsonPath';
import * as ejs from 'ejs';
@Singleton
export default class TemplateEngine {
  private __template__ = {};
  private templateHtmlsByIds = {};
  setTemplateHtml(id, html) {
    this.templateHtmlsByIds[id] = html;
  }
  getTemplateHtml(id) {
    return this.templateHtmlsByIds[id];
  }
  render(id, uuid, data, index) {
    if (typeof uuid === 'undefined') {
      uuid = '';
    }
    const templateId = id + uuid;
    let tmpl = this.getTemplateHtml(templateId);
    if (!tmpl) {
      const templateDom = document.getElementById(templateId);
      if (templateDom) {
        tmpl = templateDom.innerHTML;
        this.setTemplateHtml(templateId, tmpl);
      } else {
        throw new Error('template ' + templateId + ' is not available!');
      }
    }
    const evaluateExp = /(&lt;|<)%=( |)([^%]+)( |)%(>|&gt;)/g;
    const segmentExp = /(&lt;|<)%=( |)([^%]+)( |)%(>|&gt;)/;
    if (typeof data !== 'object' || !evaluateExp.test(tmpl)) {
      return tmpl;
    }
    tmpl.match(evaluateExp).forEach(function (match) {
      const matches = segmentExp.exec(match);
      if (!matches[3]) {
        return;
      }
      const path = matches[3].trim();
      const res = jsonPath(data, '$.' + path);
      if (typeof res[0] === 'string' || typeof res[0] === 'number') {
        tmpl = tmpl.replace(match, res[0]);
      } else if (typeof res[0] !== 'undefined') {
        const indexString = ((index || index === 0) && index.toString()) || '-';
        if (!this.__template__) {
          this.__template__ = {};
        }
        if (!this.__template__[uuid]) {
          this.__template__[uuid] = {};
        }
        if (!this.__template__[uuid][path]) {
          this.__template__[uuid][path] = {};
        }
        this.__template__[uuid][path][indexString] = res[0];

        tmpl = tmpl.replace(
          match,
          'template.resolveValue:' + uuid + ':' + path + ':' + indexString + ':'
        );
      }
    });
    // tmpl = tmpl.replace(
    //   /<([^\/>]+)>/g,
    //   '<$1 data-rendered-from="' + templateId + '">'
    // );

    return tmpl;
  }
  isFunction(functionToCheck) {
    return (
      functionToCheck &&
      {}.toString.call(functionToCheck) === '[object Function]'
    );
  }
  dataDOMRegex(context, regex) {
    const output = [];
    for (const el of context.querySelectorAll('*')) {
      if (
        Object.keys(el.dataset).some(function (attr) {
          return regex.test(attr);
        })
      ) {
        output.push(el);
      }
    }
    return output;
  }
  renderChildren(container, id, uuid, data, handlers, overriddenHandlers) {
    if (!container) {
      throw new Error('Container is not available!');
      return;
    }
    const renderTemplate = function (templateId, replace, mOpen, mClose) {
      container.innerHTML = container.innerHTML.replace(
        replace,
        mOpen +
          data
            .map(function (dataItem, index) {
              return this.render(templateId, uuid, dataItem, index);
            })
            .join('') +
          mClose
      );
    };
    function markTemplates(target, finishScanned = false) {
      const templates = target.getElementsByTagName('template');
      for (let i = 0; i < templates.length; i++) {
        const templateDom = templates[i];
        const mOpen = '<!--:' + templateDom.id + '-->';
        const mClose = '<!--' + templateDom.id + ':-->';
        if (!this.getTemplateHtml(templateDom.id)) {
          this.setTemplateHtml(templateDom.id, templateDom.innerHTML);
        }
        templateDom.outerHTML = mOpen + templateDom.outerHTML + mClose;
        if (templateDom.innerHTML.indexOf('</template>') !== -1) {
          const ghostDom = document.createElement('div');
          ghostDom.innerHTML = templateDom.innerHTML;
          this.markTemplates(ghostDom);
          ghostDom.remove();
        }
      }
      if (
        !finishScanned &&
        target.tagName !== 'template' &&
        target.innerHTML.indexOf('</template>') !== -1
      ) {
        markTemplates(target, true);
      }
    }

    markTemplates(container);
    const templateId = id + uuid;
    const markerOpen = '<!--:' + templateId + '-->';
    const markerClose = '<!--' + templateId + ':-->';
    const toReplace = new RegExp(
      markerOpen.replace('!', '\\!') + '(.*)' + markerClose.replace('!', '\\!'),
      'gs'
    );
    renderTemplate(id, toReplace, markerOpen, markerClose);
    this.bindHandlers(uuid, container, handlers, overriddenHandlers);
  }
  bindHandlers(uuid, container, handlers, overriddenHandlers) {
    const bindingDataTest = /^on([a-zA-Z][a-zA-Z0-9]*)$/;
    const eventArgTest = /^\$e( |)(,|$)/;
    const argsExtractor = /^([a-zA-Z_$][a-zA-Z0-9_$]*)\(([^)]+)\)$/;
    const bindingItems = this.dataDOMRegex(container, bindingDataTest);
    bindingItems.forEach(function (item) {
      const dataBindings = Object.keys(item.dataset);
      dataBindings.forEach(function (binding) {
        if (!bindingDataTest.test(binding)) {
          return;
        }
        const segments = argsExtractor.exec(item.dataset[binding]);
        if (!segments || !segments[1]) {
          throw new Error(
            '[' +
              uuid +
              '] Invalid binding ' +
              '"' +
              binding +
              '" on ' +
              item.tagName +
              '.' +
              item.className
          );
        }
        const name = segments[1];
        let handler =
          (overriddenHandlers[uuid] && overriddenHandlers[uuid][name]) ||
          handlers[name];

        let args = segments[2];
        if (args) {
          function parseArgs(args) {
            let parsedArgs = args;
            const resolved = {};
            if (parsedArgs.indexOf('template.resolveValue:') !== -1) {
              parsedArgs = parsedArgs.replace(
                /template\.resolveValue:([^:]+):([^:]+):([^:]+):/g,
                function (_, uuid, path, index) {
                  const resolvePlaceholder =
                    '$' + (index === '-' ? '0' : index);
                  resolved[resolvePlaceholder] = this.resolveValue(
                    uuid,
                    path,
                    index
                  );
                  return "'" + resolvePlaceholder + "'";
                }
              );
            }
            try {
              parsedArgs = JSON.parse(
                '[' + parsedArgs.replace(/"/g, '\\"').replace(/'/g, '"') + ']'
              );
              for (let i = 0; i < parsedArgs.length; i++) {
                if (/^\$\d+$/.test(parsedArgs[i])) {
                  parsedArgs[i] = resolved[parsedArgs[i]];
                }
              }
              return parsedArgs;
            } catch (e) {
              throw new Error(
                '[' +
                  uuid +
                  '] Invalid binding ' +
                  '"' +
                  binding +
                  '" on ' +
                  item.tagName +
                  '.' +
                  item.className
              );
              return;
            }
          }

          const overriddenHandler = handler;
          if (eventArgTest.test(args)) {
            args = args.replace(eventArgTest, '');
            const parsedArgs = parseArgs(args);
            handler = function (e) {
              overriddenHandler.apply(null, [e].concat(parsedArgs));
            };
          } else {
            const parsedArgs = parseArgs(args);
            handler = function () {
              overriddenHandler.apply(null, parsedArgs);
            };
          }
        }

        const bindingName = binding.toLowerCase().replace(/^on/, '');
        item.removeEventListener(bindingName, handler);
        item.addEventListener(bindingName, handler);
      });
    });
  }
  createHandler(uuid, fn, overriddenHandlers, overriddenName) {
    return function () {
      if (overriddenHandlers && overriddenHandlers[overriddenName]) {
        const handler = overriddenHandlers[overriddenName].fn;
        if (!overriddenHandlers[overriddenName].isPreventDefault) {
          fn.apply(null, arguments);
        }
        handler.apply(null, arguments);
        return;
      }
      fn.apply(null, arguments);
    };
  }
  registerHandler(uuid, handlers, newHandlers) {
    return Object.keys(newHandlers).reduce(function (composed, name) {
      return Object.assign({}, composed, {
        [name]: this.createHandler(uuid, handlers[name], newHandlers, name),
      });
    }, {});
  }
  resolveValue(uuid, path, index) {
    return this.__template__[uuid][path][index];
  }
  waitForDom(dom, fn) {
    if (!dom) {
      function reRender() {
        fn();
        this.removeEventListener('DOMContentLoaded', reRender);
      }
      window.addEventListener('DOMContentLoaded', reRender);
      return;
    }
    fn();
  }
}
