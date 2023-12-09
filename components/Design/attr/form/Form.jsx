import React, { useEffect, useMemo, useState, useCallback, useRef, createContext, useContext as useReactContext, forwardRef, useImperativeHandle } from 'react'

const noop = () => { }

const deepCopy = source => {
  if (!(source instanceof Object)) return source //如果不是对象的话直接返回
  const target = Array.isArray(source) ? [] : {} //数组兼容
  for (const k in source) {
    if (source.hasOwnProperty(k)) {
      if (typeof source[k] === 'object') {
        target[k] = deepCopy(source[k])
      } else {
        target[k] = source[k]
      }
    }
  }
  return target
}

const formContext = createContext({
  data: {},
  realData: {},
  setValue: (field, value) => undefined,
  setValues: data => undefined,
  submit: noop,
  reset: noop
})

const useContext = () => useReactContext(formContext)

const groupContext = createContext({
  reset: () => undefined,
  setField: field => undefined
})

const useGroupContext = () => useReactContext(groupContext)

export const Form = forwardRef(({
  children,
  // 是否快速响应 当输入的时候就获得结果
  quick = true,
  onChange,
  onSubmit,
  data,
  defaultData: propsDefaultData
}, ref) => {

  const defaultData = useMemo(() => {
    return data || propsDefaultData || {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [realData, setRealData] = useState(defaultData)

  const propsDataChange = useRef(false)

  useEffect(() => {
    if (typeof data === 'object') {
      propsDataChange.current = true
      setRealData(data)
    }
  }, [data])

  // 将值保存起来
  const realDataRef = useRef(realData)
  realDataRef.current = realData

  const [resultData, setResultData] = useState({ ...defaultData })

  // 将onChange存起来
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // 将onChange存起来
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit

  useEffect(() => {
    if (quick && !propsDataChange.current) {
      setResultData(old => {
        if (JSON.stringify(old) !== JSON.stringify(realData)) {
          onChangeRef.current?.(deepCopy(realData))
          return deepCopy(realData)
        }
        return old
      })
    }
  }, [quick, realData])

  const setValue = useCallback((key, value) => {
    propsDataChange.current = false
    setRealData(old => {
      old[key] = value
      return { ...old }
    })
  }, [])

  const setValues = useCallback(data => {
    propsDataChange.current = false
    setRealData(old => ({ ...old, ...data }))
  }, [])

  const submit = useCallback(() => {
    onSubmitRef.current?.(deepCopy(realDataRef.current))
    if (quick) {
      return
    }
    onChangeRef.current?.(deepCopy(realDataRef.current))
    setResultData(deepCopy(realDataRef.current))
  }, [quick])

  const reset = useCallback(() => {
    propsDataChange.current = false
    setRealData(deepCopy(defaultData))
    if (quick) {
      setResultData(deepCopy(defaultData))
      onChangeRef.current?.(deepCopy(defaultData))
    }
  }, [defaultData, quick])

  useImperativeHandle(ref, () => {
    return {
      resultData,
      defaultData,
      realData,
      setValue,
      setValues,
      submit,
      reset
    }
  }, [resultData, defaultData, realData, reset, setValue, setValues, submit])

  const result = { data: resultData, defaultData, realData, setValue, setValues, submit, reset }

  return <formContext.Provider value={result}>
    {
      typeof children === 'function'
        ? children(result)
        : children
    }
  </formContext.Provider>
})

const Item = ({
  children,
  trigger = 'onChange',
  triggerPropName = 'value',
  field,
  // 当有的表单一个需要编辑多个字段时，指定此方式
  fields
}) => {

  const form = useContext()
  const { setField } = useGroupContext()

  const value = form.realData[field]

  useEffect(() => {
    setField(field, value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const child = useMemo(() => {
    let _child = children
    if (typeof children === 'function') {
      _child = children({ value, ...form })
    }
    if (React.isValidElement(_child)) {
      _child = React.cloneElement(_child, {
        [trigger]: _value => {
          _child[trigger]?.(_value)
          if (fields) {
            form.setValues(_value)
          } else {
            form.setValue(field, _value)
          }
        },
        [triggerPropName]: _child[triggerPropName] || (fields ? form.realData : value)
      })
    }

    return _child
  }, [children, field, fields, form, trigger, triggerPropName, value])

  return child
}

/**
 * 组 组件，在此组件里面的表单可以单独重置
 * @param {*} param0
 * @returns
 */
const Group = ({
  children
}) => {

  const { data, defaultData, setValues } = useContext()
  const groupFields = useRef([])

  // 设置默认值 用来重置
  const setField = useCallback(field => {
    if (!groupFields.current.includes(field)) {
      groupFields.current.push(field)
    }
  }, [])

  /**
   * 组内的表单进行重置
   * type prev 重置到上次的值 default 重置到默认值
   */
  const reset = useCallback((type = 'default') => {
    setValues(Object.fromEntries(groupFields.current.map((field => [field, (type === 'prev' ? data : defaultData)[field]]))))
  }, [data, defaultData, setValues])

  return <groupContext.Provider value={{ setField, reset }}>
    {children}
  </groupContext.Provider>
}

const GroupReset = ({ type, children, ...props }) => {
  const { reset } = useGroupContext()

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: e => {
        children.onClick?.(e)
        reset(type)
      }
    })
  }

  return <div {...props} onClick={() => reset(type)}>
    {children}
  </div>
}

const Submit = ({ children, ...props }) => {
  const form = useContext()
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: e => {
        children.onClick?.(e)
        form.submit()
      }
    })
  }
  return <div {...props} onClick={form.submit}>
    {children}
  </div>
}

const Reset = ({ children, ...props }) => {
  const form = useContext()
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: e => {
        children.onClick?.(e)
        form.reset()
      }
    })
  }
  return <div {...props} onClick={form.reset}>
    {children}
  </div>
}

const ArrayForm = ({
  value,
  onChange,
  children
}) => {

  const form = useContext()

  const setValues = useCallback(val => {
    onChange?.(val)
  }, [onChange])

  const setValue = useCallback((index, val) => {
    const _value = Array.isArray(value) ? [...value] : []
    _value[index] = val
    onChange?.(_value)
  }, [onChange, value])

  const defaultData = useMemo(() => [], [])

  return <formContext.Provider value={{ ...form, realData: value || defaultData, setValues, setValue }}>
    <arrayContext.Provider value={{ values: value || defaultData, setValues, setValue }}>
      {children}
    </arrayContext.Provider>
  </formContext.Provider>
}

const arrayContext = createContext({})

const ArrayAction = ({
  action,
  children
}) => {

  const { values, setValues } = useReactContext(arrayContext)

  const click = useCallback(() => {
    if (typeof action === 'function') {
      setValues(action(values ? [...values] : []))
    }
  }, [action, setValues, values])

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: click
    })
  }
  console.error('ArrayAction组件只能传入一个具有点击事件的子组件')
  return null
}

const ObjectForm = ({
  value,
  onChange,
  children
}) => {

  const form = useContext()

  const setValues = useCallback(_data => {
    onChange?.({ ...value, ..._data })
  }, [onChange, value])

  const setValue = useCallback((field, val) => {
    const _value = typeof value === 'object' ? { ...value } : {}
    _value[field] = val
    onChange?.(_value)
  }, [onChange, value])

  const defaultData = useMemo(() => ({}), [])

  return <formContext.Provider value={{ ...form, realData: value || defaultData, setValues, setValue }}>
    {children}
  </formContext.Provider>
}

Form.useContext = useContext
Form.Item = Item
Form.Array = ArrayForm
Form.ArrayAction = ArrayAction
Form.Object = ObjectForm
Form.Submit = Submit
Form.Reset = Reset
Form.useGroupContext = useGroupContext
Form.Group = Group
Form.GroupReset = GroupReset
