import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { deepCopy } from '@/duxapp/utils'
import classNames from 'classnames'
import { useDesignContext } from '../utils'
import { Create, Form } from './form'
import comp from '../utils/comp'
import { ScrollView, Tab, ZoomRoot } from '../common'
import './Attr.scss'

export const Attr = ({ className, ...props }) => {
  const { hover, setNodeData } = useDesignContext()

  const [form, setForm] = useState({})

  const [formValue, setFormValue] = useState({})

  const change = useCallback(value => {
    setNodeData(hover?.key, value)
  }, [hover, setNodeData])

  /**
   * 获取编辑表单
   */
  const getEditForm = useCallback(valueOnly => {
    if (hover) {
      const config = comp.getConfig(hover.tag)
      const value = deepCopy(hover.attr)

      if (!valueOnly) {
        let _from = typeof config.attrForm === 'function' ?
          config.attrForm({ hover, comp }) :
          config.attrForm
        if (_from instanceof Promise) {
          setFormValue(value)
          _from.then(setForm)
        } else {
          setFormValue(value)
          setForm(_from)
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

  const tabs = useMemo(() => {

    const styleNames = ['className', 'style']

    return Object.keys(form).reduce((prev, key) => {

      const item = form[key]

      if (item.__object?.tab) {
        prev.push({
          name: item.__object.tab.name || key, key,
          form: {
            [key]: item
          }
        })
      } else if (styleNames.includes(key)) {
        prev[1].form[key] = item
      } else {
        prev[0].form[key] = item
      }

      return prev
    }, [
      { name: '属性', key: 'attr', form: {} },
      { name: '样式', key: 'style', form: {} }
    ]).filter(v => Object.keys(v.form).length)
  }, [form])

  const [select, setSelect] = useState(tabs[0]?.key)

  const renderSelect = useMemo(() => {
    if (!tabs.length) {
      return select
    }
    if (!tabs.some(v => v.key === select)) {
      return tabs[0].key
    }
    return select
  }, [select, tabs])

  const renderForm = useMemo(() => {
    return tabs.find(v => v.key === renderSelect)?.form || {}
  }, [renderSelect, tabs])

  return <ZoomRoot {...props} className={classNames('Attr', className)}>
    <Tab list={tabs} value={renderSelect} onChange={setSelect} className='tab' />
    <ScrollView>
      <div className='Attr-form'>
        <Form defaultValues={formValue} key={formValue} onChange={change}>
          <Create form={renderForm} />
        </Form>
      </div>
    </ScrollView>
  </ZoomRoot>
}
