import React, { useMemo, useState, useCallback, useRef } from 'react'
import classNames from 'classnames'
import { useDrag, useDrop } from 'react-dnd'
import { stopPropagation } from '@/duxapp/utils'
import EditTypes from '../utils/editTypes'
import { openMenu } from '../utils/util'
// import { addTemplate } from '../template/utils'
import comp from '../utils/comp'
import { useDesignContext } from '../utils/context'
import { NodePosition } from '../utils/edit'
import { isChildNode } from '../../Render'
import { Row, ZoomRoot } from '../common'
import youIcon from './images/you.png'
import './Layer.scss'

const Item = React.memo(({
  item: currentItem,
  index,
  parentNode,
  level,
  defaultUnfold
}) => {

  const { nodes, selectNode, moveNode, setNodeData, hover } = useDesignContext()

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
  const isRoot = useMemo(() => currentItem.nodeName === 'root', [currentItem.nodeName])

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

  // 添加模板
  const add = useCallback(() => {
    // addTemplate(currentItem).catch(() => { })
  }, [currentItem])

  // 显示右键菜单
  const showMenu = useCallback(event => {
    selectNode(currentItem.key)
    event.preventDefault()
    const menu = []

    if (!isRoot) {
      menu.push({ text: '复制', value: copy })
    }

    if (comp.isChildAdd(currentItem.nodeName, currentItem.child ? currentItem.child.length : 0) || isRoot) {
      menu.push({ text: '粘贴', value: paste })
    }
    // menu.push({ text: '添加至模板', value: add })
    if (!isRoot) {
      menu.push({ text: '删除', value: delItem })
    }

    openMenu({ list: menu, event }).then(({ item }) => {
      item.value()
    }).catch(() => {

    })
  }, [currentItem, isRoot, selectNode, delItem, copy, paste, add])

  const [edit, setEdit] = useState(false)
  // 双击事件
  const editName = useCallback(() => {
    setEdit(true)
  }, [])

  // 设置名称
  const setName = useCallback(e => {
    setEdit(false)
    if (!e.target.value) {
      return
    }
    setNodeData(currentItem.key, {
      tplAlias: e.target.value
    })
  }, [currentItem.key, setNodeData])

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
      tpls.push(item.nodeName)
    } else if (type === EditTypes.TEMPLATE_ADD) {
      // 模板添加
      item.template.forEach(v => tpls.push(v.nodeName))
    }

    if (tpls.length === 0) {
      return data
    }

    // 拖动的模块是否能插入到当前这个模板
    const isInsert = tpls.every(v => !comp.isChildDisable(currentItem.nodeName, v)) && comp.isChildAdd(currentItem.nodeName, currentItem.child?.length, tpls.length)

    // 是否能插入到当前父组件里面
    const isMove = !tpls.some(v => comp.isChildDisable(parentNode.nodeName, v)) && comp.isChildAdd(parentNode.nodeName, parentNode.child.length)

    return [isInsert || isMove, isInsert, isMove]

  }, [parentNode.nodeName, nodes, currentItem.key, currentItem.child, currentItem.nodeName, parentNode.child])


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
      return { position: new NodePosition(parentNode.key, index), key: currentItem.key, nodeName: currentItem.nodeName }
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
        moveNode(item.nodeName, pos)
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

  drag(drop(ref))

  return <React.Fragment>
    <Row
      ref={ref}
      items='center'
      className={classNames('item', `level-${level}`, {
        select: isLastSelect || (isSelect && !unfold),
        hover: isDragging,
        insert: over && insertPos === 'insert'
      })}
      onClick={selectItem}
      onContextMenu={showMenu}
    >
      <img
        src={youIcon}
        className={classNames('you2', { hide: !isChild, unfold })}
        onClick={unfoldSwitch}
      />
      {
        edit && isSelect
          ? <input focus autoFocus className='text' onBlur={setName} value={currentItem.tplAlias || ''} placeholder='请输入节点名称' />
          : <span className='text' onDoubleClick={editName}>
            {currentItem.tplAlias || comp.getCompName(currentItem.nodeName)}
          </span>
      }

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
    />}
  </React.Fragment>
})

const List = ({ list, parentNode, level = 1 }) => {
  return list.map((item, index) => <Item
    key={item.key}
    item={item}
    index={index}
    level={level}
    parentNode={parentNode}
  />)
}

export const Layer = ({
  className,
  ...props
}) => {

  const { nodes, moveNode } = useDesignContext()

  const rootProps = useMemo(() => ({
    item: {
      nodeName: 'root',
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

      if (!monitor.isOver({ shallow: true }) || comp.isChildDisable('root', item.nodeName)) {
        return
      }

      const pos = new NodePosition('__root__', nodes.length)

      // 不同类型操作
      if (type === EditTypes.FORM_MOVE_NODE) {
        moveNode(item.position, pos)
      } else if (type === EditTypes.FORM_ADD) {
        moveNode(item.nodeName, pos)
      } else if (type === EditTypes.TEMPLATE_ADD) {
        moveNode(item.template, pos)
      }
    }
  })

  drop(ref)

  return <ZoomRoot className={classNames('Layer', className)} {...props} ref={ref}>
    <div className='scroll-root'>
      <div className='scroll-main'>
        <Item {...rootProps} />
      </div>
    </div>
  </ZoomRoot>
}
