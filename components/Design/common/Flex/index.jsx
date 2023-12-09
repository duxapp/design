import classNames from 'classnames'
import { forwardRef } from 'react'
import './index.scss'

export const Row = forwardRef(({
  wrap,
  justify,
  items,
  grow,
  shrink,
  self,
  className,
  style,
  ...props
}, ref) => {
  return <div
    className={classNames(
      'flex flex-row',
      wrap && 'flex-wrap',
      justify && 'justify-' + justify,
      items && 'items-' + items,
      grow && 'flex-grow',
      shrink && 'flex-shrink',
      self && 'self-' + self,
      className
    )}
    style={style}
    {...props}
    ref={ref}
  />
})

export const Column = forwardRef(({
  justify,
  items,
  grow,
  shrink,
  self,
  className,
  style,
  ...props
}, ref) => {
  return <div
    className={classNames(
      'flex',
      justify && 'justify-' + justify,
      items && 'items-' + items,
      grow && 'flex-grow',
      shrink && 'flex-shrink',
      self && 'self-' + self,
      className
    )}
    style={style}
    {...props}
    ref={ref}
  />
})
