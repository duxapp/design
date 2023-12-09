import { Component, createElement } from 'react'
import classNames from 'classnames'
import { componentList } from './ComponentItem'
import { styled } from './utils/styled'

export class Render extends Component {

  /**
   * 精简渲染过程，去除重复组件
   * @param {*} nodes
   * @returns
   */
  simplify(nodes) {
    if (!nodes?.length) {
      return null
    }
    const childs = nodes.map(({ hidden, nodeName, child, children, ...props }) => {
      if (hidden) {
        return null
      }
      const comp = componentList[nodeName]
      if (!comp) {
        console.log(nodeName + ' 组件未定义')
        return null
      }

      const { style, className } = styled.styleTransform(props.style, true)
      return createElement(comp, {
        ...props,
        style,
        className: classNames(className, props.className),
      }, children || this.simplify(child))
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
