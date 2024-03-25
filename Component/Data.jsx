import { cloneElement, createContext, isValidElement, useContext, useMemo } from 'react'
import { recursionGetValue } from '@/duxapp/utils/object'
import classNames from 'classnames'

const context = createContext(null)

export const DataSource = ({ data, children }) => {

  const parent = useContext(context)

  data._parent = parent

  return <context.Provider value={data}>
    {children}
  </context.Provider>
}

export const DataBind = ({
  bind,
  children
}) => {

  const data = useContext(context)

  const bindData = useMemo(() => {
    if (!bind?.length || !data) {
      return {}
    } else {
      return Object.fromEntries(bind.filter(v => v.t).map(item => [item.t, recursionGetValue(item.s, data)]))
    }
  }, [bind, data])

  if (isValidElement(children)) {
    return cloneElement(children, {
      ...bindData,
      className: classNames(children.props.className, bindData.className),
      style: {
        ...children.props.style,
        ...bindData.style
      }
    })
  }
}

export const DataList = ({
  listField,
  keyField,
  children
}) => {
  const data = useContext(context)

  const list = useMemo(() => {
    const _list = recursionGetValue(listField, data)
    if (!_list?.length) {
      return [{}]
    }
    return _list
  }, [data, listField])

  if (isValidElement(children)) {
    return list.map((item, index) => {
      return <context.Provider value={{ _parent: data, ...item }} key={recursionGetValue(keyField, item) ?? index}>
        {cloneElement(children)}
      </context.Provider>
    })
  }

}
