import { Column, Row } from '../../common'
import './Checkbox.scss'

export const Checkbox = ({
  value,
  onChange,
  options
}) => {

  return <Row items='center' wrap>
    {
      options?.map(item => {
        const select = value?.includes?.(item.value)
        return <Row key={item.value}
          items='center'
          onClick={() => {
            if (!select) {
              value.push(item.value)
            } else {
              value.splice(value.indexOf(item.value), 1)
            }
            onChange([...value])
          }}
          className='CheckboxItem'
        >
          <Column className='select' items='center' justify='center'>
            {select && <div />}
          </Column>
          <div className='checkbox-name'>
            {item.name}
          </div>
        </Row>
      })
    }
  </Row>
}

Checkbox.defaultValue = {
  value: []
}

Checkbox.config = {
  name: '多选',
  verify: (value, config) => {
    if (!Array.isArray(value)) {
      return false
    }
    return config.props.options.some(v => value.includes(v.value))
  }
}
