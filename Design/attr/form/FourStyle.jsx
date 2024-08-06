import { useState } from 'react'
import { InputSize } from './Input'
import { Color } from './Color'
import { Form } from './Form'
import { Row, Text } from '../../common'
import './FourStyle.scss'

export const comps = {
  size: InputSize,
  color: Color,
}

export const FourStyle = ({
  value,
  onChange,
  field,
  fields,
  type,
  _config
}) => {

  const Item = typeof type === 'string' ? comps[type] : type

  const { values, setValue, setValues } = Form.useFormContext()

  const [expand, setExpand] = useState(() => {
    if (typeof values[field] !== 'undefined') {
      return false
    }
    if (fields.some(item => typeof values[item.field] !== 'undefined')) {
      return true
    }
    return false
  })

  if (!Item) {
    console.log(`表单类型 ${type} 未定义`)
    return null
  }

  return <>
    <Row justify='between' items='center' className='FourStyle-title'>
      <Text className='name'>{_config?.name || '未定义'}</Text>
      <Text
        className='expand'
        onClick={() => {
          if (expand) {
            const isUpdate = fields.map(item => {
              if (typeof values[item.field] !== 'undefined') {
                values[item.field] = undefined
                return true
              }
            }).some(v => v)
            isUpdate && setValues(values)
          } else {
            if (typeof value !== 'undefined') {
              setValue(field, undefined)
            }
          }
          setExpand(!expand)
        }}
      >{expand ? '-' : '+'}</Text>
    </Row>
    {
      expand ?
        <Row wrap className='FourStyle-items'>
          {
            fields.map(item => <Row className='item' items='center' key={item.field}>
              <Text className='name'>{item.name}</Text>
              <Form.Item field={item.field}>
                <Item />
              </Form.Item>
            </Row>)
          }
        </Row> :
        <Item value={value} onChange={onChange} />
    }
  </>
}

FourStyle.config = {
  name: '多样式',
  customTitle: true
}
