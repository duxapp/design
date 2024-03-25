import classNames from 'classnames'
import { Column, Row } from '../Flex'
import { Text } from '../Text'
import './index.scss'

export const Tab = ({
  list,
  value,
  onChange,
  className,
  oneHidden,
  ...props
}) => {

  if (!list.length) {
    return
  }

  if (list.length === 1 && oneHidden) {
    return
  }

  return <Row className={classNames('DesignTab', className)} {...props}>
    {
      list.map(tab => {
        const isSelect = value === tab.key
        return <Column className={classNames('item', isSelect && 'select')} key={tab.key} onClick={() => !isSelect && onChange(tab.key)}>
          <Text className='name'>{tab.name}</Text>
          <Column className='line' />
        </Column>
      })
    }
  </Row>
}
