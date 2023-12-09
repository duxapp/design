import { getKey } from '@/design/utils'
import { componentList, componentCate } from './config'
import { styled } from '../../Render'

export default {
  // 获取测试表单
  testForm() {
    return Object.keys(componentList).map(key => this.getComp(key))
  },

  // 获取组件列表
  getComps() {
    const list = []
    for (const key in componentList) {
      if (componentList.hasOwnProperty(key)) {
        list.push({
          name: componentList[key].name,
          cate: componentList[key].cate,
          nodeName: key
        })
      }
    }
    return list
  },
  // 获取组件分类
  getCates() {
    return Object.values(componentList).reduce((prev, current) => {
      const name = current.cate
      if (name && !prev.includes(name)) {
        prev.push(name)
      }
      return prev
    }, [])
  },

  getConfig(nodeName) {
    return componentList[nodeName] || {}
  },

  // 获取组件名称
  getCompName(nodeName) {
    if (!nodeName || !componentList[nodeName]) {
      return '未知节点'
    }
    return componentList[nodeName].name
  },

  /**
   * 获取组件属性
   * @param {string} nodeName 当前组件
   */
  getCompAttr(nodeName) {
    if (!nodeName) {
      throw nodeName + '请传入名称'
    }
    const item = componentList[nodeName]
    if (!item) {
      throw nodeName + '组件未定义'
    }
    const data = item.attr()
    data.nodeName = nodeName
    if (!data.key) {
      data.key = getKey()
    }
    if (!data.child) {
      data.child = []
    }
    return data
  },

  /**
   * 判断childNodeName组件能不能放在nodeName组件的child
   * @param {string} nodeName 当前组件
   * @param {string} childNodeName 子组件
   */
  isChildDisable(nodeName, childNodeName) {

    // 禁止将root添加到任何组件
    if (childNodeName === 'root') {
      return true
    }

    if (!nodeName) {
      return true
    }

    // 判断是否被父组件禁用
    const item = componentList[nodeName]
    if (typeof item?.child?.disable === 'function') {
      return item.child.disable(childNodeName)
    } else if (item?.child?.disable?.comp?.length) {
      const { disable } = item.child
      const mark = disable.comp.includes(childNodeName)
      if (mark && !disable.contain) {
        return true
      } else if (!mark && disable.contain) {
        return true
      }
    }

    // 判断是否被子组件禁用
    const childItem = componentList[childNodeName]
    if (typeof childItem?.parent?.disable === 'function') {
      return childItem.parent.disable(nodeName)
    } else if (childItem?.parent?.disable?.comp?.length) {
      const { disable } = childItem.parent
      const mark = disable.comp.includes(nodeName)
      if (mark && !disable.contain) {
        return true
      } else if (!mark && disable.contain) {
        return true
      }
    }
    return false
  },

  /**
   * 判断当前表单能不能继续添子表单 用于限制子表单最大数量
   * @param {string} nodeName
   * @param {number} length 当前表单长度
   * @param {number} insertLength 要插入的表单长度
   *
   */
  isChildAdd(nodeName, length, insertLength = 1) {
    const item = componentList[nodeName]
    if (item.child && ((item.child.max && (length + insertLength) <= item.child.max) || !item.child.max)) {
      return true
    }
    return false
  },

  /**
   * 获取当前编辑组件的表单
   * @param {string} nodeName 编辑的模板
   */
  getEditForm(nodeName) {
    const item = componentList[nodeName]
    const form = item.form?.() || []
    return { form, text: item.text }
  },

  /**
   * 复制一个节点
   * @param {array}} form 要复制的节点
   */
  copyNodes(node, resetKey = true) {
    if (!(node instanceof Object)) return node //如果不是对象的话直接返回
    const target = Array.isArray(node) ? [] : {} //数组兼容
    for (const k in node) {
      if (node.hasOwnProperty(k)) {
        if (typeof node[k] === 'object') {
          target[k] = this.copyNodes(node[k], resetKey)
        } else {
          target[k] = node[k]
        }
      }
    }
    if (target.key && target.nodeName) {
      if (resetKey) {
        target.key = getKey()
      }
      if (target.forceUpdate) {
        delete target.forceUpdate
      }
    }
    return target
  },
  /**
   * 简化节点
   * @param {array} form 要简化的节点
   */
  simplifyNodes(form) {
    form = (form instanceof Array) ? [...form] : { ...form }
    for (const key in form) {
      if (Object.hasOwnProperty.call(form, key)) {
        const item = form[key]
        if (key === 'showWhere') {
          if (!item.key) {
            delete form[key]
          }
        } else if (typeof item === 'object') {
          form[key] = this.simplifyNodes(item)
          if (key === 'parentAttr') {
            // 去删除空表单
          }
        } else if (styled.isStyleName(key) && styled.isInvalidStyle(key, item)) {
          delete form[key]
        }
      }
    }
    return form
  }
}
