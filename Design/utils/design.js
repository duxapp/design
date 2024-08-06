import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useDrop } from 'react-dnd'
import { isComponent, querySelectByKey, querySelectByKeyOriginal } from '../../Render'
import { EditHistory } from './history'
import { clipboard, createHotKey, toast } from './util'
import { NodePosition, diffAttr } from './edit'
import comp from './comp'
import EditTypes from './editTypes'

export const useDesign = (defaultNodes, onChange, userConfig) => {
  const [nodes, setNodes] = useState(defaultNodes)
  // 选中的节点
  // const [hover, setHover] = useState(void 0)
  // 选中的节点Key
  const [hoverKey, setHoverKey] = useState(void 0)
  // 历史记录按钮状态
  const [historyStatus, setHistoryStatus] = useState({})
  // 保存loading
  const [saveStatus, setSaveStatus] = useState(false)

  const history = useRef(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const nodesRef = useRef(nodes)
  nodesRef.current = nodes

  const configReg = useRef(userConfig)
  configReg.current = userConfig

  const [historyKey, setHistoryKey] = useState(0)

  const hoverKeyRef = useRef(hoverKey)
  hoverKeyRef.current = hoverKey

  // 选中的节点
  const hover = useMemo(() => {
    if (hoverKey) {
      return querySelectByKey(nodesRef.current, hoverKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverKey, historyKey])

  const hotKey = useMemo(() => createHotKey(), [])

  useEffect(() => {
    history.current = new EditHistory()
    hotKey.init()
    history.current.onAction(setHistoryStatus)
    return () => {
      history.current.destroy()
      hotKey.remove()
    }
  }, [hotKey])

  // 改变通知
  const change = useCallback(() => {
    const res = onChangeRef.current(nodesRef.current)
    if (res instanceof Promise) {
      setSaveStatus(true)
      res.finally(() => setSaveStatus(false))
    }
  }, [])

  // 记录历史操作的组件，下次操作时直接调用 避免再次查找
  const oldSetNodeKey = useRef({
    key: '',
    node: null
  })

  // 设置节点数据
  const setNodeData = useCallback((key, data, historyAction) => {
    let node
    if (oldSetNodeKey.current.key === key) {
      node = oldSetNodeKey.current.node
    } else {
      node = querySelectByKeyOriginal(nodesRef.current, key)
      oldSetNodeKey.current.key = key
      oldSetNodeKey.current.node = node
    }

    const historys = diffAttr(node.attr, data)
    historys.forEach(v => v.push(key))

    !historyAction && history.current.insert('edit', ...historys)

    nodesRef.current = [...nodesRef.current]
    setNodes(nodesRef.current)
    change()

    // 控制编辑表单重新渲染
    if (historyAction && hoverKeyRef.current === key) {
      setHistoryKey(old => !old)
    }
  }, [change])

  /**
   * 组件排序 插入 删除 复制 粘贴通用函数
   * 插入：第一个为模板名称 第二个为位置 或者第二个为空
   * 插入模板：第一个为模板 第二个为位置
   * 排序：第一个为位置 第二个为位置
   * 删除：第一个为位置 第二个为空 或者为number表示要删除的数量
   * 复制：第一个为位置 第二个 '__copy__'
   * 粘贴：第一个为位置 第二个 '__paste__'
   */
  const moveNode = useCallback((key1, key2, historyAction) => {
    if (isComponent(key1) && (key2 instanceof NodePosition || typeof key2 === 'undefined')) {
      // 插入组件
      const insertNode = comp.getCompAttr(key1)
      if (!key2) {
        // 获取当前选中的节点所在的插入位置
        const currentNode = querySelectByKey(nodesRef.current, hoverKeyRef.current || '__root__')
        const config = comp.getConfig(currentNode.tag)
        if (!config.child || currentNode.child.length >= config.child.max || comp.isChildDisable(currentNode.tag, key1)) {
          // 无法添加到子元素 添加到同级后面
          const index = currentNode.parentNode.child.findIndex(v => v.key === hoverKeyRef.current)
          key2 = new NodePosition(currentNode.parentNode.key, index + 1)
        } else {
          key2 = new NodePosition(currentNode.key, currentNode.child.length)
        }
      }
      const node = key2.getNode(nodesRef.current)
      if (comp.isChildDisable(node.tag, key1)) {
        toast('不支持插入到此位置')
        return
      }
      // 插入历史记录
      !historyAction && history.current.insert('insert', [key2, insertNode])
      node.child.splice(key2.index, 0, insertNode)
      nodesRef.current = [...nodesRef.current]
      setNodes(nodesRef.current)
      // 选中插入的项目
      !historyAction && setHoverKey(insertNode.key)
    } else if (key1 instanceof Array && key1[0] instanceof Object && key2 instanceof NodePosition) {
      // 插入模板
      const currentForm = key2.getNode(nodesRef.current)
      const addList = []
      comp.copyNodes(key1, !historyAction).forEach(item => {
        if (currentForm.tag === 'root' || (comp.isChildAdd(currentForm.tag, currentForm.child.length) && !comp.isChildDisable(currentForm.tag, item.tag))) {
          addList.push(item)
        } else {
          console.warn(comp.getCompName(item.tag) + '插入失败')
        }
      })
      if (addList.length !== key1.length) {
        toast((key1.length - addList.length) + '个模板插入失败!')
      }
      if (addList.length) {
        currentForm.child.splice(key2.index, 0, ...addList)
        // 插入历史记录
        !historyAction && history.current.insert('insert-template', [key2, addList])
      }
      nodesRef.current = [...nodesRef.current]
      setNodes(nodesRef.current)
    } else if (key1 instanceof NodePosition && key2 instanceof NodePosition) {
      // 排序
      if (key1.toString() === key2.toString()) {
        return
      }
      const node1 = key1.getNode(nodesRef.current)
      const node2 = key2.getNode(nodesRef.current)

      // 删除拖拽位置的节点
      const [node] = node1.child.splice(key1.index, 1)
      // 插入历史记录
      !historyAction && history.current.insert('move', [key1, key2])
      // 将其插入到新节点
      // 同一个数组里面 前面的拖动到后面需要索引 -1
      if (!historyAction && key1.key === key2.key && key1.index < key2.index) {
        key2.index--
      }
      node2.child.splice(key2.index, 0, node)
      nodesRef.current = [...nodesRef.current]
      setNodes(nodesRef.current)
    } else if (key1 instanceof NodePosition && (!key2 || typeof key2 === 'number')) {
      // 删除
      const [node] = key1.getNode(nodesRef.current).child.splice(key1.index, key2 || 1)
      // 插入历史记录
      !historyAction && history.current.insert('delete', [key1, comp.copyNodes(node, false)])
      nodesRef.current = [...nodesRef.current]
      setNodes(nodesRef.current)
      setHoverKey(void 0)
    } else if (key1 instanceof NodePosition && key2 === '__copy__') {
      // 复制
      let item = key1.getIndexNode(nodesRef.current)
      if (!item) {
        // 复制根节点下的所有组件
        item = nodesRef.current
      }
      clipboard(JSON.stringify(item))
      return
    } else if (key1 instanceof NodePosition && key2 === '__paste__') {
      // 粘贴
      try {
        let data = JSON.parse(clipboard())
        if (!data) {
          toast('没有要粘贴的数据')
          return
        }
        if (!(data instanceof Array) && data instanceof Object) {
          data = [data]
        }
        if (!(data instanceof Array)) {
          toast('数据类型错误')
          return
        }
        moveNode(data, key1)
      } catch (error) {
        console.log(error)
        toast('数据解析错误')
      }
      return
    }
    change()
  }, [change])

  /**
   * 快捷键数据绑定
   */
  useEffect(() => {
    hotKey.setData(hover, moveNode, nodes)
  }, [moveNode, hover, nodes, hotKey])

  // 给历史记录管理器添加工具
  useEffect(() => {
    history.current.setTools(nodes, setNodeData, moveNode)
  }, [nodes, setNodeData, moveNode])

  /**
   * 开始编辑表单 当key为空时表示退出表单编辑
   */
  const selectNode = useCallback(key => {
    setHoverKey(key)
  }, [])

  // 添加至最外层
  const [{ }, drop] = useDrop({
    accept: [EditTypes.FORM_MOVE, EditTypes.FORM_ADD, EditTypes.TEMPLATE_ADD],
    drop(item, monitor) {
      const type = monitor.getItemType()
      if (!monitor.isOver({ shallow: true }) || comp.isChildDisable('root', item.tag)) {
        return
      }

      const pos = new NodePosition('__root__', nodes.length)

      // 不同类型操作
      if (type === EditTypes.FORM_MOVE) {
        moveNode(item.position, pos)
      } else if (type === EditTypes.FORM_ADD) {
        moveNode(item.tag, pos)
      } else if (type === EditTypes.TEMPLATE_ADD) {
        moveNode(item.template, pos)
      }
    }
  })

  return {
    nodes,
    hoverKey,
    hover,
    historyStatus,
    drop,
    setNodeData,
    moveNode,
    selectNode,
    saveStatus
  }
}

