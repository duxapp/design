import { deepCopy } from '@/duxapp/utils'
import { querySelectByKeyOriginal } from '../../Render'

/**
 * 节点位置信息类
 */
export class NodePosition {
  /**
   *
   * @param {*} key
   * @param {*} index
   */
  constructor(key, index) {
    this.key = key
    this.index = index
  }

  getNode(nodes) {
    return querySelectByKeyOriginal(nodes, this.key)
  }

  getIndexNode(nodes) {
    return querySelectByKeyOriginal(nodes, this.key)?.child?.[this.index]
  }

  toString() {
    return this.key + '-' + this.index
  }
}


// 查找属性中的不同值，当检测到不同值是将会进行赋值
export const diffAttr = (a, b, keys = [], diff = []) => {
  for (const k in b) {
    if (Object.hasOwnProperty.call(b, k)) {
      const typeb = typeof b[k]
      const currentKeys = [...keys, k]
      if (typeb === 'undefined') {
        const res = a[k]
        delete a[k]
        delete b[k]
        diff.push([currentKeys, res, b[k]])
      } else if ((typeb !== 'object' || b[k] === null) && a[k] != b[k]) {
        const res = a[k]
        a[k] = b[k]
        diff.push([currentKeys, res, b[k]])
      } else if (b[k] instanceof Array) {
        if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
          const res = deepCopy(a[k])
          a[k] = b[k]
          diff.push([currentKeys, res, deepCopy(b[k])])
        }
        continue
      } else if (typeb === 'object') {
        if (typeof a[k] === 'undefined') {
          // 跨级别新增属性
          a[k] = b[k]
          diff.push([currentKeys, undefined, b[k]])
        } else {
          diffAttr(a[k], b[k], currentKeys, diff)
        }
      }
    }
  }
  return diff
}
