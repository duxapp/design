import { useCallback, useEffect, useRef, useState } from 'react'
import { deepCopy } from '@/duxapp/utils'
import classNames from 'classnames'
import { useDesignContext } from '../utils'
import { Create, Form } from './form'
import comp from '../utils/comp'
import { ZoomRoot } from '../common'
import './Attr.scss'

export const Attr = ({ className, ...props }) => {
  const { hover, setNodeData } = useDesignContext()

  const [form, setForm] = useState([])

  const [formValue, setFormValue] = useState({})

  const change = useCallback(value => {
    setNodeData(hover?.key, value)
  }, [hover, setNodeData])

  /**
   * 获取编辑表单
   */
  const getEditForm = useCallback((valueOnly) => {
    if (hover) {
      const config = comp.getConfig(hover.nodeName)
      const value = deepCopy(hover)
      delete value.child
      delete value.parentNode
      delete value.forceUpdate
      delete value.key
      delete value.nodeName

      if (!valueOnly) {
        let _from = typeof config.attrForm === 'function' ? config.attrForm(hover) : config.attrForm
        if (_from instanceof Promise) {
          _from.then(setForm)
          setFormValue(value)
        } else {
          setForm(_from)
          setFormValue(value)
        }
      } else {
        setFormValue(value)
      }
    } else {
      setForm([])
      setFormValue({})
    }
  }, [hover])

  /**
   * 记录历史数据，防止重复获取表单
   */
  const getFormOldData = useRef({
    hover: '-1'
  })

  /**
   * 监听什么时候重新生成表单
   */
  useEffect(() => {
    const hoverString = hover?.key
    if (getFormOldData.current.hover !== hoverString) {
      getEditForm()
      getFormOldData.current.hover = hoverString
    } else {
      // 重新获取value
      getEditForm(true)
    }
  }, [hover, getEditForm])

  return <ZoomRoot {...props} className={classNames('Attr', className)}>
    <div>
      <Form data={formValue} key={hover?.key} onChange={change}>
        <Create form={form} />
      </Form>
    </div>
  </ZoomRoot>
}
