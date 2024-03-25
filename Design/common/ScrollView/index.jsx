import classNames from 'classnames'
import './index.scss'

export const ScrollView = ({
  className,
  children,
  ...props
}) => {
  return <div className={classNames('ScrollView--root', className)} {...props}>
    <div className='ScrollView'>
      {children}
    </div>
  </div>
}
