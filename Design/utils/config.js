export const componentList = {
  root: {
    name: '根节点',
    attr() {
      return {

      }
    },
    attrForm() {
      return {

      }
    },
    child: {}
  }
}

const config = {
  // 组件列表
  list: {
    root: {
      text: '根节点',
      publicAttr: [
        'child'
      ],
      attr() {
        return {
          width: 750
        }
      },
      form() {

      }
    },
  }
}

export default config

/**
 * 定义一个组件配置
 * @param {String} key 组件标识
 * @param {Component} value 组件
 */
export const defineComponentConfig = (key, value) => {
  if (key === 'root') {
    console.warn('不能定义根节点属性')
    return
  }
  value.tag = key
  componentList[key] = value
}

/**
 * 定义多个组件配置
 * @param {Object} data 一个由key: 组件组成的对象
 */
export const defineComponentConfigs = data => {
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      defineComponentConfig(key, data[key])
    }
  }
}
