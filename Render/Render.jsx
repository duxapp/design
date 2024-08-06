import { Component, createElement } from 'react'
import classNames from 'classnames'
import { componentList } from './ComponentItem'
import { styled } from './utils/styled'
import { isNodeAttr } from './utils/node'

export class Render extends Component {

  getAttr = attr => {
    const _attr = {}
    for (const key in attr) {
      if (Object.hasOwnProperty.call(attr, key)) {
        const item = attr[key]
        if (key === 'className' || key === 'style' || key.endsWith('Style')) {
          _attr[key] = item
        } else if (isNodeAttr(item)) {
          _attr[key] = this.simplify(item)
        } else if (item && typeof item === 'object' && !Array.isArray(item)) {
          _attr[key] = this.getAttr(item)
        } else {
          _attr[key] = item
        }
      }
    }
    return _attr
  }

  /**
   * 精简渲染过程，去除重复组件
   * @param {*} nodes
   * @returns
   */
  simplify(nodes) {
    if (!nodes?.length) {
      return null
    }
    const childs = nodes.map(({ tag, child, key, attr }) => {

      const comp = componentList[tag]
      if (!comp) {
        console.log(tag + ' 组件未定义')
        return null
      }

      const renderAttr = this.getAttr(attr)

      const { style, className } = styled.styleTransform(renderAttr.style, true)
      return createElement(comp, {
        key,
        ...renderAttr,
        style,
        className: classNames(className, renderAttr.className),
      }, renderAttr.children || this.simplify(child))
    })
    if (childs.length === 1) {
      return childs[0]
    }
    return childs
  }

  render() {
    const { nodes = [] } = this.props

    return this.simplify(nodes)
  }
}
