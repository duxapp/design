import { Row, Column } from '../../common'
import './Radio.scss'

export const Radio = ({
  value,
  onChange,
  options
}) => {
  return <Row wrap items='center' className='RadioItem'>
    {
      options?.map(item => {
        const select = value === item.value
        return <Row items='center' key={item.value} onClick={() => !select && onChange(item.value)} className='RadioItem'>
          <Column className='select' items='center' justify='center'>
            {select && <div />}
          </Column>
          <div className='radio-name'>
            {item.name}
          </div>
        </Row>
      })
    }
  </Row>
}
