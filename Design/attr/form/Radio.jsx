import classNames from 'classnames'
import { Row } from '../../common'
import './Radio.scss'

export const Radio = ({
  value,
  onChange,
  options,
  cancel
}) => {
  return <Row wrap className='DesignRadio'>
    {
      options?.map((item, index) => {
        const select = value === item.value
        return <div items='center' key={item.value}
          onClick={() => {
            if (cancel === false && select) {
              return
            }
            onChange(select ? undefined : item.value)
          }}
          className={classNames(
            'DesignRadioItem',
            select && 'DesignRadioItem--select',
            !index && 'DesignRadioItem--start',
            index === options.length - 1 && 'DesignRadioItem--end'
          )}
        >
          {item.name}
        </div>
      })
    }
  </Row>
}

Radio.config = {
  name: '单选',
  verify: (value, config) => {
    return config.props.options.some(v => v.value === value)
  }
}
