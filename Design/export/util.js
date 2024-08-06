import classNames from 'classnames'
import { styled, isNodeAttr } from '../../Render'
import comp from '../utils/comp'

/**
 * 节点中用到的不重复的组件名称列表
 * @param {*} nodes
 * @param {*} tags
 * @returns
 */
export const getTags = (nodes, tags = []) => {
  nodes.forEach(item => {
    if (!tags.includes(item.tag)) {
      tags.push(item.tag)
    }
    for (const key in item.attr) {
      if (Object.hasOwnProperty.call(item.attr, key)) {
        const element = item.attr[key]
        if (isNodeAttr(element)) {
          getTags(element, tags)
        }
      }
    }
    if (item.child?.length) {
      getTags(item.child, tags)
    }
  })
  return tags
}

/**
 * 获取组件框架
 * @param {*} tags 用到的组件列表
 * @param {*} jsx 组件JSX内容
 */
const getBase = (tags = [], jsx) => {

  const imports = tags.reduce((prev, tag) => {
    const imp = comp.getCompConfig(tag).import
    if (!imp) {
      return prev
    }
    const path = imp.path || imp
    if (!prev[path]) {
      prev[path] = []
    }
    if (!prev[path].includes(imp.name || tag)) {
      prev[path].push(imp.name || tag)
    }
    return prev
  }, {})
  return `import { px, TopView } from '@/duxapp'
${Object.keys(imports).map(path => `import { ${imports[path].join(', ')} } from '${path}'`).join('\n')}

export default TopView.HOC(function Page() {

  return <>
${jsx}
  </>
})`
}

/**
 * 获取空格
 * @param {*} type
 * @param {*} level
 * @returns
 */
const getSpace = level => {
  let base = ''
  for (let i = 0, l = level + 2; i < l; i++) {
    base += '  '
  }
  return base
}

const styleBeautify = style => {
  return JSON
    .stringify(style)
    // 尺寸函数转换
    .replace(/\"px\(([-\d]{1,})\)\"/g, (res, val) => 'px(' + val + ')')
    // 将双引号改为单引号
    .replace(/\"([a-zA-Z]{1,})\":\"([a-zA-Z-#,\(\)]{1,})\"/g, (res, val1, val2) => `"${val1}":'${val2}'`)
    // 增加属性之间的空格 和 名称的引号
    .replace(/,\"([a-zA-Z]{1,})\":/g, (res, val) => ', ' + val + ': ')
    // // 去除名称的引号
    .replace(/\"([a-zA-Z]{1,})\":/g, (res, val) => val + ': ')
}

const toJsxItem = (
  { tag, child, attr: { className, style, children, ...attr } },
  { index, length },
  globalClass,
  cssSeparate,
  level,
  cssList
) => {
  // 当前空格缩进
  const space = getSpace(level)
  // 是否是最后一个
  const isLast = index === length - 1
  // 转换后的组件名称
  const compConfig = comp.getConfig(tag)
  const name = compConfig.import?.tag || tag

  const styleTransform = styled.styleTransform(style, globalClass, cssSeparate, true)

  // css和样式处理
  if (styleTransform.css && !cssList[styleTransform.css]) {
    cssList[styleTransform.css] = 'class-' + (++cssList.index)
  }
  if (styleTransform.css) {
    className = classNames(className, styleTransform.className, cssList[styleTransform.css])
  }

  const styleRes = cssSeparate
    ? ''
    : styleBeautify(styleTransform.style)

  const start = [
    space,
    // 标识
    '<' + name,
    // 类名
    ...(className ? [' className=\'' + className + '\''] : []),
    // 样式
    ...(!cssSeparate && styleTransform.style && Object.keys(styleTransform.style).length ? [' style={{ ' + styleRes.substring(1, styleRes.length - 1) + ' }}'] : []),
    // 属性
    Object.keys(attr).map(k => {
      const keyType = typeof attr[k]
      if (k.endsWith('Style')) {
        return `${k}={${styleBeautify(styled.styleTransform(attr[k], false, false, true).style)}}`
      }
      if (isNodeAttr(attr[k])) {
        // 节点
        const more = attr[k].length > 1
        const jsx = nodeToJsx(attr[k], globalClass, cssSeparate, level + (more ? 2 : 1), cssList)
        return ` ${k}={${more ? '<>\n' : ''}${more ? jsx : jsx.trim()}${more ? `\n${getSpace(level + (more ? 1 : 0))}</>` : ''}}`
      }

      return ` ${k}${attr[k] === true ? '' : '='}${attr[k] === true
        ? ''
        : keyType === 'object'
          ? `{${objectToString(attr[k], null, 0, true)}}`
          : keyType === 'number' || keyType === 'boolean'
            ? `{${attr[k]}}`
            : `'${attr[k]}'`}`
    }).join(''),
    // 结尾
    child?.length || children ? '>' : ' />'
  ].join('')
  const center = child?.length || isNodeAttr(children)
    ? nodeToJsx(isNodeAttr(children) ? children : child, globalClass, cssSeparate, level + 1, cssList)
    : children
      ? children : ''
  const end = space + (child?.length || children ? `</${name}>` : '')
  return start + (
    center && (child?.length || isNodeAttr(children))
      ? ('\r\n' + center + '\r\n' + end)
      : center
        ? (center + `</${name}>`)
        : ''
  ) + (isLast ? '' : '\r\n')
}

/**
 * 将节点转换为jsx数据
 * @param {*} nodes 节点
 * @param {*} globalClass 使用全局样式
 * @param {*} cssSeparate 样式分离
 * @param {*} level
 * @returns
 */
export const nodeToJsx = (nodes, globalClass, cssSeparate, level = 0, css = { index: 0 }) => {
  const jsx = nodes.map((node, index) => toJsxItem(node, {
    index,
    length: nodes.length
  }, globalClass, cssSeparate, level, css)).join('')
  if (level === 0) {
    return {
      jsx: getBase(getTags(nodes), jsx),
      css: Object.keys(css).filter(key => key !== 'index').map(value => `.${css[value]} ${value}`).join('\n\r')
    }
  }
  return jsx
}

/**
 * 将对象或数组转化为Object形式的的字符串
 * @param {any} value 将要序列化成 一个 JSON 字符串的值
 * @param {number} space 指定缩进用的空白字符串，用于美化输出（pretty-print）；如果参数是个数字，它代表有多少的空格；上限为10。该值若小于1，则意味着没有空格；如果该参数为字符串（当字符串长度超过10个字母，取其前10个字母），该字符串将被作为空格；如果该参数没有提供（或者为 null），将没有空格。
 * @param {boolean} simplify 是否简化输出 简化后对于不需要引号括起来的字符串 将没有引号
 * @return {string} 序列化后的字符串
 */
export const objectToString = (() => {
  const rx_key = /^[A-Za-z0-9_]*$/
  const rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g

  let gap
  let indent
  let meta
  let rep
  let simpl
  let quot = '"'

  function quote(string, isKey) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

    rx_escapable.lastIndex = 0
    return rx_escapable.test(string)
      ? quot + string.replace(rx_escapable, function (a) {
        var c = meta[a];
        return typeof c === "string"
          ? c
          : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
      }) + quot
      : (simpl && isKey && rx_key.test(string) ? string : quot + string + quot);
  }


  function str(key, holder) {

    // Produce a string from holder[key].

    var i;          // The loop counter.
    var k;          // The member key.
    var v;          // The member value.
    var length;
    var mind = gap;
    var partial;
    var value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.

    if (
      value
      && typeof value === "object"
      && typeof value.toJSON === "function"
    ) {
      value = value.toJSON(key);
    }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

    if (typeof rep === "function") {
      value = rep.call(holder, key, value);
    }

    // What happens next depends on the value's type.

    switch (typeof value) {
      case "string":
        return quote(value);

      case "number":

        // JSON numbers must be finite. Encode non-finite numbers as null.

        return (Number.isFinite(value))
          ? String(value)
          : "null";

      case "boolean":
      case "null":

        // If the value is a boolean or null, convert it to a string. Note:
        // typeof null does not produce "null". The case is included here in
        // the remote chance that this gets fixed someday.

        return String(value);

      // If the type is "object", we might be dealing with an object or an array or
      // null.

      case "object":

        // Due to a specification blunder in ECMAScript, typeof null is "object",
        // so watch out for that case.

        if (!value) {
          return "null";
        }

        // Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

        // Is the value an array?

        if (Object.prototype.toString.apply(value) === "[object Array]") {

          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || "null";
          }

          // Join all of the elements together, separated with commas, and wrap them in
          // brackets.

          v = partial.length === 0
            ? "[]"
            : gap
              ? (
                "[\n"
                + gap
                + partial.join(",\n" + gap)
                + "\n"
                + mind
                + "]"
              )
              : "[" + partial.join(",") + "]";
          gap = mind;
          return v;
        }

        // If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === "object") {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === "string") {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k, true) + (
                  (gap)
                    ? ": "
                    : ":"
                ) + v);
              }
            }
          }
        } else {

          // Otherwise, iterate through all of the keys in the object.

          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k, true) + (
                  (gap)
                    ? ": "
                    : ":"
                ) + v);
              }
            }
          }
        }

        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0
          ? "{}"
          : gap
            ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
            : "{" + partial.join(",") + "}";
        gap = mind;
        return v;
    }
  }

  // If the JSON object does not yet have a stringify method, give it one.

  meta = {    // table of character substitutions
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",
    "\"": "\\\"",
    "\\": "\\\\"
  };
  return (value, replacer, space, simplify = false) => {

    // The stringify method takes a value and an optional replacer, and an optional
    // space parameter, and returns a JSON text. The replacer can be a function
    // that can replace values, or an array of strings that will select the keys.
    // A default replacer method can be provided. Use of the space parameter can
    // produce text that is more easily readable.

    simpl = simplify
    if (simpl) {
      quot = "'"
    }

    var i;
    gap = "";
    indent = "";

    // If the space parameter is a number, make an indent string containing that
    // many spaces.

    if (typeof space === "number") {
      for (i = 0; i < space; i += 1) {
        indent += " ";
      }

      // If the space parameter is a string, it will be used as the indent string.

    } else if (typeof space === "string") {
      indent = space;
    }

    // If there is a replacer, it must be a function or an array.
    // Otherwise, throw an error.

    rep = replacer;
    if (replacer && typeof replacer !== "function" && (
      typeof replacer !== "object"
      || typeof replacer.length !== "number"
    )) {
      throw new Error("JSON.stringify");
    }

    // Make a fake root object containing our value under the key of "".
    // Return the result of stringifying the value.

    return str("", { "": value });
  }
})()
