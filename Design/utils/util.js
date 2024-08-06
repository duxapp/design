import { toast as duxToast } from '@/duxapp/utils/util'
import { QuickEvent } from '@/duxapp'
import { NodePosition } from './edit'

/**
 * 获取当前元素相对于指定元素的相对位置
 * @param {*} current 当前dom
 * @param {*} stop 查找结束dom
 * @param {*} data 数据 无需传入
 * @returns
 */
const getOffset = (current, stop = document, data = { left: 0, top: 0 }) => {
  if (!current || current === stop) {
    return data
  }
  data.left += current.offsetLeft
  data.top += current.offsetTop
  return getOffset(current.offsetParent, stop, data)
}

// 菜单数据
const globalMenuData = {
  menuDom: null,
  callback: [],
  close() {
    document.removeEventListener('click', globalMenuData.close)
    globalMenuData.callback[1] && globalMenuData.callback[1]()
    globalMenuData.removeEle()
  },
  removeEle() {
    if (!globalMenuData.menuDom) {
      return
    }
    globalMenuData.callback = []
    document.body.removeChild(globalMenuData.menuDom)
    globalMenuData.menuDom = null
  }
}

/**
 * 显示一个全局菜单
 * @param {*} param0
 * @returns
 */
const openMenu = ({ list, event }) => {

  if (globalMenuData.menuDom) {
    globalMenuData.close()
  }

  const childDom = list.map(item => `<div class='item'>${item.text}</div>`).join('')

  globalMenuData.menuDom = document.createElement('div')
  globalMenuData.menuDom.classList.add('global-menus')
  globalMenuData.menuDom.innerHTML = childDom

  document.addEventListener('click', globalMenuData.close)

  document.body.appendChild(globalMenuData.menuDom)

  // 窗口尺寸
  const [width, height] = [document.body.clientWidth, document.body.clientHeight]
  // 元素插入后才能获取宽高
  const domRect = globalMenuData.menuDom.getBoundingClientRect()

  const [left, top] = [Math.min(event.pageX, width - domRect.width), Math.min(event.pageY, height - domRect.height)]

  globalMenuData.menuDom.style.left = left + 'px'
  globalMenuData.menuDom.style.top = top + 'px'

  document.querySelectorAll('.global-menus > .item').forEach((ele, index) => {
    ele.onclick = () => {
      globalMenuData.callback[0] && globalMenuData.callback[0]({
        index,
        item: list[index]
      })
      globalMenuData.removeEle()
    }
  })

  return new Promise((resolve, reject) => {
    globalMenuData.callback = [resolve, reject]
  })
}

/**
 * 将原始的px转化为style
 * @param {*} size
 * @returns
 */
const toPx = size => size + 'px'

/**
 * 键盘事件监听
 */
const keyboardEvent = {
  callbacks: {},
  receive(event) {
    // 如果在input里面执行快捷键将不会触发快捷键
    if (['TEXTAREA', 'INPUT'].includes(event.target.tagName)) {
      return
    }
    const name = this.getName(event.key, event.ctrlKey || event.metaKey, event.shiftKey, event.altKey)

    this.callbacks[name]?.forEach(func => func())
    if (this.callbacks[name]?.length) {
      event.preventDefault()
      return false
    }
  },
  getName(name, ctrl, shift, alt) {
    return (typeof name === 'string' ? name.toLowerCase() : '') + (ctrl ? '1' : '0') + (shift ? '1' : '0') + (alt ? '1' : '0')
  },
  initStatus: false,
  add(name, cb, ctrl, shift, alt) {
    if (!this.initStatus) {
      document.addEventListener('keydown', this.receive.bind(this))
      this.initStatus = true
    }
    name = this.getName(name, ctrl, shift, alt)
    this.callbacks[name] = this.callbacks[name] || []
    this.callbacks[name].push(cb)
  },
  remove(name, cb, ctrl, shift, alt) {
    if (!name) {
      this.callbacks = {}
    }
    name = this.getName(name, ctrl, shift, alt)
    if (!cb) {
      delete this.callbacks[name]
    } else {
      this.callbacks[name]?.some((func, index) => {
        if (func === cb) {
          this.callbacks[name].splice(index, 1)
          return true
        }
      })
    }
  }
}

export const createHotKey = () => {
  const hotKey = {
    init() {
      this.copy = this.copy.bind(this)
      this.paste = this.paste.bind(this)
      this.del = this.del.bind(this)
      this.addKey()
    },
    addKey() {
      keyboardEvent.add('c', this.copy, true)
      keyboardEvent.add('v', this.paste, true)
      keyboardEvent.add('delete', this.del)
    },
    remove() {
      this.removeKey()
      remove()
    },
    removeKey() {
      keyboardEvent.remove('c', this.copy, true)
      keyboardEvent.remove('v', this.paste, true)
      keyboardEvent.remove('delete', this.del)
    },
    setData(hover, moveNode, nodes) {
      this.hover = hover
      this.moveNode = moveNode
      this.nodes = nodes
    },
    copy() {
      this.hover && this.moveNode(
        new NodePosition(this.hover.parentNode?.key || '__root__', this.hover.parentNode?.child?.findIndex(item => item.key === this.hover.key) || 0),
        '__copy__'
      )
    },
    paste() {
      this.moveNode(
        new NodePosition(this.hover?.key || '__root__', this.hover?.child?.length || this.nodes?.length || 0),
        '__paste__'
      )
    },
    del() {
      this.hover && this.moveNode(new NodePosition(this.hover.parentNode?.key || '__root__', this.hover.parentNode?.child?.findIndex(item => item.key === this.hover.key) || 0))
    }
  }

  let popCount = 0

  const { remove } = popEvent.on(type => {
    if (type === 'open') {
      popCount++
    } else if (type === 'close') {
      popCount--
    }
    if (!popCount) {
      hotKey.addKey()
    } else if (popCount === 1) {
      hotKey.removeKey()
    }
  })

  return hotKey
}

export const popEvent = new QuickEvent()

export const toast = text => {
  duxToast(text)
}

export const clipboard = (() => {
  let _data = null
  return data => {
    if (data) {
      const textarea = document.createElement('textarea')
      textarea.value = data
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      _data = data
    } else {
      // const clipboardData = window.clipboardData || event.clipboardData
      // return clipboardData.getData('Text')
      return _data
    }
  }
})()

export {
  getOffset,
  openMenu,
  toPx,
  keyboardEvent
}
