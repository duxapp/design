import { Switch as TaroSwitch } from '@tarojs/components'
import './Switch.scss'
import { useDesignContext } from '../../utils'

export const Switch = ({
  value,
  onChange,
  data
}) => {

  const { config } = useDesignContext()

  return <TaroSwitch
    className='DesignSwitch'
    color={config?.theme?.primaryColor}
    checked={data ? value === data.true : !!value}
    onChange={e => onChange(data ? (e.detail.value ? data.true : data.false) : e.detail.value)}
  />

}

Switch.config = {
  name: '开关',
  verify: (value, { props }) => {
    if (~props.data) {
      return typeof value === 'boolean'
    }
    return props.data.true === value || props.data.false === value
  }
}
