/**
 * 组件索引
 */
export const componentList = {}

/**
 * 是不是一个合法的节点
 * @param {string} nodeName 节点
 */
export const isComponent = nodeName => !!componentList[nodeName]

/**
 * 获取组件配置
 * @param {string} nodeName 节点
 * @returns
 */
export const getComponentConfig = nodeName => componentList[nodeName]?.designConfig || {}

/**
 * 获取指定的一系列节点转换为大驼峰命名后的结果
 * @param {*} nodeNames 指定要获取的节点 如果不传入此字段则返回所有组件
 */
export const getComponentList = nodeNames => {
  return Object.fromEntries(
    (nodeNames ? nodeNames : Object.keys(componentList))
      .map(key => [key.split('-').map(name => name.replace(name[0], name[0].toUpperCase())).join(''), componentList[key]])
  )
}

/**
 * 定义一个组件
 * @param {String} key 组件标识
 * @param {Component} value 组件
 */
export const defineComponent = (key, value) => {
  componentList[key] = value
}

/**
 * 定义多个组件
 * @param {Object} data 一个由key: 组件组成的对象
 */
export const defineComponents = (data) => {
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      componentList[key] = data[key]
    }
  }
}
