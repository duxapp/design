import { Input, InputNumber, InputSize } from './Input'
import { Radio } from './Radio'
import { Switch } from './Switch'
import { Select } from './Select'
import { Checkbox } from './Checkbox'
import { Form } from './Form'
import './Create.scss'

const comps = {
  text: Input,
  textarea: Input,
  size: InputSize,
  number: InputNumber,
  radio: Radio,
  switch: Switch,
  select: Select,
  checkbox: Checkbox,
}

export const FormItem = ({
  config,
  field
}) => {
  const { type } = config
  const Item = comps[type]
  if (!Item) {
    console.log(`表单类型 ${type} 未定义`)
    return null
  }
  return <Form.Item field={field}>
    <Item {...config.props} />
  </Form.Item>
}
