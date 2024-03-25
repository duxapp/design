import { createElement, useCallback, useRef, Component, useEffect } from 'react'
import { TopView } from '@/duxapp/components/TopView'
import classNames from 'classnames'
import { styled, componentList, isNodeAttr } from '../../Render'
import { ZoomRoot } from '../common'
import { useDesignContext } from '../utils'
import './Editor.scss'

export const Editor = ({ className, ...props }) => {
  const { nodes, drop } = useDesignContext()

  const ref = useRef(null)

  drop(ref)

  useHover(ref)

  return <ZoomRoot
    ref={ref}
    className={classNames('DesignEditor', className)}
    {...props}
  >
    <TopView>
      <Render nodes={nodes} />
    </TopView>
  </ZoomRoot>
}

const useHover = (ref) => {
  const { hover, selectNode } = useDesignContext()

  const click = useCallback(e => {
    let target = e.target
    while (target !== ref.current && target && !target._designKey) {
      target = target.parentElement
    }
    if (target._designKey) {
      selectNode(target._designKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectNode])

  useEffect(() => {
    if (ref.current) {
      const el = ref.current
      el.addEventListener('click', click)
      return () => {
        el.removeEventListener('click', click)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [click])

  const mouseover = useCallback(e => {
    let target = e.target
    while (target !== ref.current && target && !target._designKey) {
      target = target.parentElement
    }
    if (target._designKey) {
      target.classList.add('Design-el-hover')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mouseout = useCallback(e => {
    let target = e.target
    while (target !== ref.current && target && !target._designKey) {
      target = target.parentElement
    }
    if (target._designKey) {
      target.classList.remove('Design-el-hover')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // 处理鼠标经过元素事件
    if (ref.current) {
      const el = ref.current
      el.addEventListener('mouseover', mouseover)
      el.addEventListener('mouseout', mouseout)
      return () => {
        el.removeEventListener('mouseover', mouseover)
        el.removeEventListener('mouseout', mouseout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ref.current || !hover?.key) {
      return
    }

    const root = ref.current
    const hoverEl = root.querySelectorAll(`[_design-key=${hover.key}]`)
    if (hoverEl.length) {
      hoverEl.forEach(v => v.classList.add('Design-el-select'))
      return () => {
        hoverEl.forEach(v => v.classList.remove('Design-el-select'))
      }
    } else {
      const els = []
      // 递归查找所有子元素并选中
      const getChild = child => {
        child.forEach(node => {
          const el = root.querySelectorAll(`[_design-key=${node.key}]`)
          if (el.length) {
            el.forEach(v => v.classList.add('Design-el-select'))
            els.push(...el)
          } else if (node.child?.length) {
            getChild(node.child)
          }
        })
      }
      hover.child?.length && getChild(hover.child)
      if (!els.length) {
        return
      }
      return () => {
        els.forEach(el => {
          el.classList.remove('Design-el-select')
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover])

}

class Render extends Component {

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
        _designKey: key,
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
