import classNames from 'classnames'
import { forwardRef } from 'react'
import './index.scss'

export const ZoomRoot = forwardRef(({
  fontSize = 16,
  style,
  className,
  children,
  ...props
}, ref) => {
  return (
    <div className={classNames('ZoomRoot', className)} {...props} ref={ref} style={{ ...style, fontSize }}>
      {children}
    </div>
  )
})
