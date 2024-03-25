import { useEffect, useMemo, useState, useCallback, useRef, createContext, forwardRef, useImperativeHandle, useContext, isValidElement, cloneElement, Fragment } from 'react'

import { deepCopy } from '@/duxapp/utils/object'
import { noop } from '@/duxapp/utils/util'

export const formContext = createContext({
  data: {},
  values: {},
  setValue: (field, value) => undefined,
  setValues: data => undefined,
  submit: noop,
  reset: noop
})

export const useFormContext = () => useContext(formContext)

export const Form = forwardRef(({
  disabled,
  children,
  onChange,
  onSubmit,
  defaultValues: propsDefaultValues
}, ref) => {

  const _defaultValues = useMemo(() => {
    if (typeof propsDefaultValues === 'function') {
      return {}
    }
    return { ...propsDefaultValues || {} }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [defaultValues, setDefaultValues] = useState(_defaultValues)

  const [values, setvalues] = useState(_defaultValues)

  // 同步或者异步获取默认值
  useEffect(() => {
    if (typeof propsDefaultValues === 'function') {
      const val = propsDefaultValues()
      if (val instanceof Promise) {
        val.then(res => {
          setDefaultValues(res)
          setvalues(res)
        })
      } else {
        setDefaultValues(val)
        setvalues(val)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 将值保存起来
  const valuesRef = useRef(values)
  valuesRef.current = values

  const [resultData, setResultData] = useState({ ...defaultValues })

  // 将onChange存起来
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // 将onSubmit存起来
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit

  useEffect(() => {
    if (defaultValues === values) {
      return
    }
    onChangeRef.current?.(deepCopy(values))
  }, [values, defaultValues])

  const setValue = useCallback((key, value) => {
    setvalues(old => {
      old[key] = value
      return { ...old }
    })
  }, [])

  const setValues = useCallback(data => {
    setvalues(old => ({ ...old, ...data }))
  }, [])


  const submit = useCallback(async () => {
    onSubmitRef.current?.(deepCopy(valuesRef.current))

    // onChangeRef.current?.(deepCopy(valuesRef.current))
    setResultData(deepCopy(valuesRef.current))
  }, [])

  const reset = useCallback(() => {
    setvalues(deepCopy(defaultValues))

    setResultData(deepCopy(defaultValues))
    // onChangeRef.current?.(deepCopy(defaultValues))
  }, [defaultValues])

  useImperativeHandle(ref, () => {
    return {
      data: resultData,
      defaultValues,
      values,
      setValue,
      setValues,
      submit,
      reset
    }
  }, [resultData, defaultValues, values, reset, setValue, setValues, submit])

  const result = {
    data: resultData, defaultValues, values,
    setValue, setValues, submit, reset,
    disabled
  }

  return <formContext.Provider value={result}>
    {
      typeof children === 'function'
        ? children(result)
        : children
    }
  </formContext.Provider>
})

const FormItem = ({
  disabled,
  children,
  trigger,
  triggerPropName,
  field,
  // 当有的表单一个需要编辑多个字段时，指定此方式
  fields
}) => {

  const form = useFormContext()

  const fieldOld = useRef(null)

  useMemo(() => {
    form.onGetField?.(field, fieldOld.current)
    fieldOld.current = field
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field])

  const value = form.values[field]

  const child = useMemo(() => {
    let _child = children
    if (typeof children === 'function') {
      _child = children({
        value,
        ...form,
        // data: form.data,
        // values: form.values,
        // setValue: form.setValue,
        // setValues: form.setValues,
        // submit: form.submit,
        // reset: form.reset
      })
    }
    if (isValidElement(_child)) {
      _child = cloneElement(_child, {
        [trigger]: _value => {
          _child[trigger]?.(_value)
          if (fields) {
            form.setValues(_value)
          } else {
            form.setValue(field, _value)
          }
        },
        field: _child.props.field || field,
        [triggerPropName]: _child[triggerPropName] ?? (fields ? form.values : value),
        disabled: disabled ?? form.disabled
      })
    }

    return _child
  }, [children, value, form, trigger, triggerPropName, fields, disabled, field])

  return child
}

FormItem.defaultProps = {
  trigger: 'onChange',
  triggerPropName: 'value',
  containerProps: {}
}

const arrayContext = createContext({})

const ArrayForm = ({
  value,
  onChange,
  renderTop,
  renderBottom,
  renderItem: RenderItem,
  itemContainer: ItemContainer = Fragment,
  children
}) => {

  const form = useFormContext()

  const setValues = useCallback(val => {
    onChange?.(val)
  }, [onChange])

  // 将value保存到ref 在RN上调用setValue时，不会调用到最新的函数，暂时不知道是什么问题
  const valueRef = useRef(value)
  valueRef.current = value

  const setValue = useCallback((index, val) => {
    const _value = Array.isArray(valueRef.current) ? [...valueRef.current] : []
    _value[index] = val
    onChange?.(_value)
  }, [onChange])

  const defaultData = useMemo(() => [], [])

  return <formContext.Provider
    value={{
      ...form,
      values: value || defaultData, setValues, setValue,
      parent: form
    }}
  >
    <arrayContext.Provider value={{ values: value || defaultData, setValues, setValue }}>
      {renderTop}
      <ItemContainer>
        {
          RenderItem ?
            value?.map((item, index) => <RenderItem key={index} value={item} index={index} values={value} />) :
            children
        }
      </ItemContainer>
      {renderBottom}
    </arrayContext.Provider>
  </formContext.Provider>
}

const ArrayAction = ({
  type,
  action,
  children
}) => {

  const { values, setValues } = useContext(arrayContext)

  const click = useCallback(() => {
    if (typeof action === 'function') {
      setValues(action(values ? [...values] : []))
    }
  }, [action, setValues, values])

  const sort = useCallback((dragIndex, hoverIndex) => {
    children.props.onSort?.(dragIndex, hoverIndex)
    values.splice(hoverIndex, 0, ...values.splice(dragIndex, 1))
    setValues([...values])
  }, [children.props, setValues, values])

  if (isValidElement(children)) {
    if (type == 'sort') {
      return cloneElement(children, {
        onSort: sort
      })
    } else {
      return cloneElement(children, {
        onClick: click
      })
    }
  }
  console.error('ArrayAction组件只能传入一个具有点击事件的子组件')
  return null
}

const ObjectForm = ({
  value,
  onChange,
  children
}) => {

  const form = useFormContext()

  const setValues = useCallback(_data => {
    onChange?.({ ...value, ..._data })
  }, [onChange, value])

  // 将value保存到ref 在RN上调用setValue时，不会调用到最新的函数，暂时不知道是什么问题
  const valueRef = useRef(value)
  valueRef.current = value

  const setValue = useCallback((field, val) => {
    const _value = typeof valueRef.current === 'object' ? { ...valueRef.current } : {}
    _value[field] = val
    onChange?.(_value)
  }, [onChange])

  const defaultData = useMemo(() => ({}), [])

  // console.log(value || defaultData)


  return <formContext.Provider
    value={{
      ...form, values: value || defaultData,
      setValues, setValue,
      parent: form
    }}
  >
    {children}
  </formContext.Provider>
}

const Submit = ({ children, ...props }) => {
  const form = useFormContext()
  if (isValidElement(children)) {
    return cloneElement(children, {
      onClick: e => {
        children.props.onClick?.(e)
        form.submit()
      }
    })
  }
}

Form.Item = FormItem
Form.Submit = Submit
Form.Object = ObjectForm
Form.Array = ArrayForm
Form.ArrayAction = ArrayAction
Form.useFormContext = useFormContext
