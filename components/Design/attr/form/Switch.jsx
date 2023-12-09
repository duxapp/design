import { Column } from '../../common'
import './Switch.scss'

export const Switch = ({
  value,
  onChange
}) => {
  return <Column className='Switch' items='center' justify='center' onClick={() => onChange(!value)}>
    {value && <div></div>}
  </Column>
}
