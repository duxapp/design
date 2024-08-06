import { Input, InputNumber, InputSize, Textarea } from './Input'
import { Radio } from './Radio'
import { Switch } from './Switch'
import { Select } from './Select'
import { Checkbox } from './Checkbox'
import { Color } from './Color'
import { Form } from './Form'
import { ClassName } from './ClassName'
import { FourStyle } from './FourStyle'
import { UploadImage, UploadVideo } from './Media'
import { Link } from './Link'
import { Icon } from './Icon'
import { Node } from './Node'
import './Create.scss'

export const comps = {
  text: Input,
  textarea: Textarea,
  size: InputSize,
  number: InputNumber,
  radio: Radio,
  switch: Switch,
  select: Select,
  checkbox: Checkbox,
  color: Color,
  className: ClassName,
  fourStyle: FourStyle,
  image: UploadImage,
  video: UploadVideo,
  link: Link,
  icon: Icon,
  node: Node
}

export const FormItem = ({
  config,
  field
}) => {

  const type = config?.type

  const Item = typeof type === 'string' ? comps[type] : type

  if (!Item) {
    console.log(`表单类型 ${type} 未定义`)
    return null
  }

  return <Form.Item field={field}>
    <Item _config={config} {...config.props} />
  </Form.Item>
}

