import { isValidElement, useCallback, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import './Input.scss'
import { Text } from '../../common'

export const InputBase = ({
  value,
  onChange,
  className,
  prefix,
  suffix,
  placeholder,
  throttle,
  type,
  ...props
}) => {

  const [focus, setFocus] = useState(false)

  const [val, setVal] = useState(value)

  const timer = useRef(null)

  useMemo(() => {
    !throttle && value !== val && setVal(value)
  }, [value, val, throttle])

  const change = useCallback(e => {
    const _val = e.target.value
    setVal(_val)
    if (throttle) {
      if (timer.current) {
        clearTimeout(timer.current)
      }
      timer.current = setTimeout(() => {
        onChange?.(!_val ? undefined : _val)
      }, 300)
    } else {
      onChange?.(!_val ? undefined : _val)
    }
  }, [onChange, throttle])

  return <div {...props} className={classNames('DesignInput', focus && 'DesignInput--focus', className)}>
    {isValidElement(prefix) ? prefix : prefix ? <Text color={2} className='prefix'>{prefix}</Text> : null}
    <input
      className='input'
      value={val}
      placeholder={placeholder}
      onInput={change}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      type={type}
    />
    {isValidElement(suffix) ? suffix : suffix ? <Text color={2} className='suffix'>{suffix}</Text> : null}
  </div>
}

export const Input = ({
  value,
  onChange,
  ...props
}) => {
  return <InputBase value={value} onChange={onChange} {...props} />
}

Input.config = {
  name: '文本',
  verify: value => typeof value === 'string'
}

export const InputNumber = ({
  value,
  onChange,
  unit,
  ...props
}) => {

  const [val, setVal] = useState(typeof value === 'number'
    ? value
    : unit && typeof value === 'string' && value.endsWith(unit)
      ? value.substring(0, value.length - unit.length)
      : ''
  )

  const change = useCallback(v => {
    setVal(v)
    if (!v) {
      onChange(undefined)
    } else {
      onChange(unit ? (+v) + unit : +v)
    }
  }, [onChange, unit])

  return <InputBase value={val} onChange={change} {...props} />
}

InputNumber.config = {
  name: '数字',
  verify: value => typeof value === 'number'
}

export const InputSize = ({
  value,
  onChange,
  percentage,
  ...props
}) => {

  const unit = useMemo(() => {
    if (typeof value === 'undefined' || typeof value === 'number') {
      return 'px'
    }
    if (typeof value === 'string' && value.endsWith('%')) {
      return '%'
    }
    return 'px'
  }, [value])

  const [val, setVal] = useState(typeof value === 'number' ? value : unit === '%' ? value.substring(0, value.length - 1) : '')

  const change = useCallback(_val => {
    setVal(_val)
    if (!_val) {
      onChange(undefined)
    } else if (unit === 'px') {
      onChange(+_val)
    } else {
      onChange(_val + '%')
    }
  }, [onChange, unit])

  const suffix = !percentage ? 'px' : <select
    className='InputSizeUnit'
    value={unit}
    onChange={e => {
      if (e.target.value === '%') {
        setVal(100)
        onChange('100%')
      }
    }}
  >
    <option value='px'>px</option>
    <option value='%'>%</option>
  </select>

  return <InputBase value={val} onChange={change} {...props} suffix={suffix} />
}

InputSize.config = {
  name: '尺寸',
  verify: value => typeof value === 'number'
}

export const Textarea = ({
  value,
  onChange
}) => {
  const [focus, setFocus] = useState(false)

  return <textarea
    className={classNames('DesignTextarea', focus && 'DesignTextarea--focus')}
    value={value}
    onChange={e => onChange(e.target.value)}
    onFocus={() => setFocus(true)}
    onBlur={() => setFocus(false)}
  />
}

Textarea.config = {
  name: '多行文本',
  verify: value => typeof value === 'string'
}
