import React, { useMemo, useState, useCallback, useRef } from 'react'
import classNames from 'classnames'
import { useDrag, useDrop } from 'react-dnd'
import { stopPropagation } from '@/duxapp/utils'
import EditTypes from '../utils/editTypes'
import { openMenu } from '../utils/util'
import comp from '../utils/comp'
import { useDesignContext } from '../utils/context'
import { NodePosition } from '../utils/edit'
import { isChildNode } from '../../Render'
import { Row, ScrollView, ZoomRoot, Text } from '../common'
import './Layer.scss'

export const Layer = ({
  className,
  onContextMenuBefore,
  ...props
}) => {

  const { nodes, moveNode } = useDesignContext()

  const rootProps = useMemo(() => ({
    item: {
      tag: 'root',
      key: '__root__',
      child: nodes
    },
    index: 0,
    level: 0,
    parentNode: {},
    defaultUnfold: true
  }), [nodes])


  const ref = useRef(null)
  // 添加至最外层
  const [{ }, drop] = useDrop({
    accept: [EditTypes.FORM_MOVE_NODE, EditTypes.FORM_ADD, EditTypes.TEMPLATE_ADD],
    drop(item, monitor) {
      const type = monitor.getItemType()

      if (!monitor.isOver({ shallow: true }) || comp.isChildDisable('root', item.tag)) {
        return
      }

      const pos = new NodePosition('__root__', nodes.length)

      // 不同类型操作
      if (type === EditTypes.FORM_MOVE_NODE) {
        moveNode(item.position, pos)
      } else if (type === EditTypes.FORM_ADD) {
        moveNode(item.tag, pos)
      } else if (type === EditTypes.TEMPLATE_ADD) {
        moveNode(item.template, pos)
      }
    }
  })

  drop(ref)

  const onContextMenuBeforeRef = useRef(onContextMenuBefore)
  onContextMenuBeforeRef.current = onContextMenuBefore

  const common = useMemo(() => {
    return { onContextMenuBeforeRef }
  }, [])

  return <ZoomRoot className={classNames('Layer', className)} {...props} ref={ref}>
    <ScrollView>
      <Item {...rootProps} common={common} />
    </ScrollView>
  </ZoomRoot>
}

const Item = React.memo(({
  item: currentItem,
  index,
  parentNode,
  level,
  defaultUnfold,
  common
}) => {

  const { nodes, selectNode, moveNode, hover } = useDesignContext()

  // 是否是展开状态
  const [unfold, setUnfold] = useState(defaultUnfold)

  // 是否选中 子元素选中，则当前元素也选中
  const isSelect = useMemo(() => {
    let hoverCopy = hover
    while (hoverCopy) {
      if (hoverCopy?.key === currentItem.key) {
        return true
      }
      hoverCopy = hoverCopy?.parentNode
    }
    return false
  }, [hover, currentItem.key])

  // 是否是最后一个并选中
  const isLastSelect = useMemo(() => hover?.key === currentItem.key, [hover, currentItem.key])

  // 是否有子元素
  const isChild = typeof currentItem.child === 'object' && currentItem.child.length > 0

  // 是不是根节点
  const isRoot = useMemo(() => currentItem.tag === 'root', [currentItem.tag])

  // 当前插入的位置 start 开始 insert插入 end结束
  const [insertPos, setInsertPos] = useState('')

  // 点击收起展开
  const unfoldSwitch = useCallback(e => {
    stopPropagation(e)
    setUnfold(!unfold)
  }, [unfold])

  // 点击选择表单
  const selectItem = useCallback(() => {
    selectNode(currentItem.key)
  }, [selectNode, currentItem.key])

  // 删除节点
  const delItem = useCallback(() => {
    moveNode(new NodePosition(parentNode.key, index))
  }, [moveNode, parentNode.key, index])

  // 复制按钮
  const copy = useCallback(() => {
    moveNode(new NodePosition(parentNode.key, index), '__copy__')
  }, [moveNode, parentNode.key, index])

  // 粘贴
  const paste = useCallback(() => {
    moveNode(new NodePosition(currentItem.key, currentItem.child?.length || 0), '__paste__')
  }, [moveNode, currentItem.child, currentItem.key])

  // 显示右键菜单
  const showMenu = useCallback(event => {
    selectNode(currentItem.key)
    event.preventDefault()
    let menu = []

    if (!isRoot) {
      menu.push({ text: '复制', value: copy })
    }

    if (comp.isChildAdd(currentItem.tag, currentItem.child ? currentItem.child.length : 0) || isRoot) {
      menu.push({ text: '粘贴', value: paste })
    }
    // menu.push({ text: '添加至模板', value: add })
    if (!isRoot) {
      menu.push({ text: '删除', value: delItem })
    }

    if (common.onContextMenuBeforeRef.current) {
      menu = common.onContextMenuBeforeRef.current({
        menu,
        node: currentItem
      })
    }

    openMenu({ list: menu, event }).then(({ item }) => {
      item.value()
    }).catch(() => {

    })
  }, [selectNode, currentItem, isRoot, common.onContextMenuBeforeRef, copy, paste, delItem])

  const ref = useRef(null)

  /**
   * 判断能不能插入到当前节点 或者移动到当前节点的前后
   */
  const getOver = useCallback((monitor, item = monitor.getItem()) => {
    const data = [false, false, false]
    // 没有拖到当前项目
    if (!monitor.isOver({ shallow: true })) {
      return data
    }

    const type = monitor.getItemType()
    // 要插入的模块列表
    const tpls = []
    if (type === EditTypes.FORM_MOVE_NODE || type === EditTypes.FORM_ADD) {

      if (type === EditTypes.FORM_MOVE_NODE) {

        // 跳过相同的位置
        if (item.key === currentItem.key) {
          return data
        }

        // 禁止将父组件拖动到自己的子组件
        if (isChildNode(currentItem.key, item.key, nodes)) {
          return data
        }

      }
      // 模块排序 基础模块添加
      tpls.push(item.tag)
    } else if (type === EditTypes.TEMPLATE_ADD) {
      // 模板添加
      item.template.forEach(v => tpls.push(v.tag))
    }

    if (tpls.length === 0) {
      return data
    }

    // 拖动的模块是否能插入到当前这个模板
    const isInsert = tpls.every(v => !comp.isChildDisable(currentItem.tag, v)) && comp.isChildAdd(currentItem.tag, currentItem.child?.length, tpls.length)

    // 是否能插入到当前父组件里面
    const isMove = !tpls.some(v => comp.isChildDisable(parentNode.tag, v)) && comp.isChildAdd(parentNode.tag, parentNode.child.length)

    return [isInsert || isMove, isInsert, isMove]

  }, [parentNode.tag, nodes, currentItem.key, currentItem.child, currentItem.tag, parentNode.child])


  /**
   * 获取当前插入位置
   */
  const getPos = useCallback((isInsert, isMove, monitor) => {
    const dropRect = ref.current?.getBoundingClientRect()
    const { y } = monitor.getClientOffset()
    // 计算索引 能插入当前组件分三份，不能插入当前组件份二份
    const num = (y - dropRect.top) / dropRect.height * (isInsert && isMove ? 3 : isMove ? 2 : 1) | 0
    const posAllValue = ['start', 'insert', 'end', 'end']
    const posMoveValues = ['start', 'end', 'end']
    const posIndertValue = ['insert', 'insert']
    return (isInsert && isMove ? posAllValue : isMove ? posMoveValues : posIndertValue)[num]
  }, [])

  // 拖
  const [{ isDragging }, drag] = useDrag({
    type: EditTypes.FORM_MOVE_NODE,
    item: () => {
      selectNode()
      return { position: new NodePosition(parentNode.key, index), key: currentItem.key, tag: currentItem.tag }
    },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      }
    }
  })

  // 放
  const [{ over }, drop] = useDrop({
    accept: [EditTypes.FORM_MOVE_NODE, EditTypes.FORM_ADD, EditTypes.TEMPLATE_ADD],
    hover(item, monitor) {

      if (!ref.current) {
        return
      }
      const [isOver, isInsert, isMove] = getOver(monitor, item)

      if (!isOver) {
        return
      }

      const pos = getPos(isInsert, isMove, monitor)

      // 跳过已选中位置
      if (isOver && insertPos === pos) {
        return
      }
      setInsertPos(pos)

    },
    drop(item, monitor) {
      if (!over) {
        return
      }
      const type = monitor.getItemType()

      const pos = new NodePosition(
        insertPos === 'insert' ? currentItem.key : parentNode.key,
        insertPos === 'insert' ? (currentItem.child?.length || 0)
          : insertPos === 'start'
            ? index
            : index + 1
      )

      if (insertPos === 'insert' && !unfold) {
        unfoldSwitch()
      }


      // 不同类型操作
      if (type === EditTypes.FORM_MOVE_NODE) {
        moveNode(item.position, pos)
      } else if (type === EditTypes.FORM_ADD) {
        moveNode(item.tag, pos)
      } else if (type === EditTypes.TEMPLATE_ADD) {
        moveNode(item.template, pos)
      }
    },
    collect(monitor) {
      return {
        over: getOver(monitor)[0]
      }
    }
  })

  const isMouseOver = useRef(false)
  const hoverEls = useRef([])

  const mouseOver = useCallback(() => {
    if (!isMouseOver.current) {
      isMouseOver.current = true
      // 查找选中的元素
      const root = document.querySelector('.DesignEditor')
      const hoverEl = root.querySelectorAll(`[_design-key=${currentItem.key}]`)
      if (hoverEl.length) {
        hoverEl.forEach(v => v.classList.add('Design-el-hover'))
        hoverEls.current.push(...hoverEl)
      } else {
        // 递归查找所有子元素并选中
        const getChild = child => {
          child.forEach(node => {
            const el = root.querySelectorAll(`[_design-key=${node.key}]`)
            if (el.length) {
              el.forEach(v => v.classList.add('Design-el-hover'))
              hoverEls.current.push(...el)
            } else if (node.child?.length) {
              getChild(node.child)
            }
          })
        }
        currentItem.child?.length && getChild(currentItem.child)
        if (!hoverEls.current.length) {
          return
        }
      }
    }
  }, [currentItem.child, currentItem.key])

  const mouseOut = useCallback(e => {
    if (e.target === ref.current) {
      isMouseOver.current = false
      hoverEls.current.forEach(el => {
        el.classList.remove('Design-el-hover')
      })
      hoverEls.current = []
    }
  }, [])

  drag(drop(ref))

  const compConfig = comp.getCompConfig(currentItem.tag)

  const desc = compConfig.desc?.(currentItem) || {}

  return <>
    <Row
      ref={ref}
      items='center'
      key={currentItem.key}
      className={classNames('item', `level-${level}`, {
        hover: isDragging,
        select: isLastSelect || (isSelect && !unfold),
        insert: over && insertPos === 'insert'
      })}
      onMouseOver={mouseOver}
      onMouseOut={mouseOut}
      onClick={selectItem}
      onContextMenu={showMenu}
    >
      <div onClick={unfoldSwitch}>
        <div className={classNames('expand', { hide: !isChild, unfold })} />
      </div>
      {
        desc.icon ?
          <img src={desc.icon} className='icon-img' /> : Array.isArray(compConfig.icon) ?
            <Text className={`icon ${compConfig.icon[0]} ${compConfig.icon[0]}-${compConfig.icon[1]}`} />
            : null
      }
      <Text className='text' numberOfLines={1}>{desc.text || compConfig.name}</Text>

      {over && insertPos !== 'insert' && <div className={classNames('item-add', `level-${level}`, {
        top: insertPos === 'start',
        bottom: insertPos === 'end'
      })}
      />}
    </Row>

    {isChild && unfold && <List
      list={currentItem.child}
      parentNode={currentItem}
      level={level + 1}
      common={common}
    />}
  </>
})

const List = ({ list, parentNode, level = 1, common }) => {
  return list.map((item, index) => <Item
    key={item.key}
    item={item}
    index={index}
    level={level}
    parentNode={parentNode}
    common={common}
  />)
}
