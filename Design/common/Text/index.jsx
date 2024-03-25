import classNames from 'classnames'
import { createContext, useContext, forwardRef } from 'react'
import './index.scss'

const context = createContext({ child: false })

export const Text = forwardRef(({
  bold,
  underline,
  numberOfLines,
  align,
  grow,
  shrink,
  self,
  className,
  style,
  color = 1,
  ...props
}, ref) => {

  const { child } = useContext(context)

  return <context.Provider value={{ child: true }}>
    <span
      ref={ref}
      className={classNames(
        !child && 'DesignText',
        bold ?? bold ? 'DesignText-bold' : 'DesignText-nobold',
        props.delete && 'DesignText-delete',
        underline && 'DesignText-underline',
        grow && 'w-0 flex-grow',
        shrink && 'flex-shrink',
        self && 'self-' + self,
        align && 'text-' + align,
        typeof color === 'number' && color < 5 && ('DesignText-c' + color),
        // 省略行数量
        process.env.TARO_ENV === 'rn' ? '' : numberOfLines === 1 ? 'DesignText-ellipsis' : numberOfLines > 1 ? 'DesignText-ellipsis--more' : '',
        className
      )}
      style={{
        ...style,
        ...(process.env.TARO_ENV !== 'rn' && numberOfLines > 1 ? {
          '-webkit-line-clamp': '' + numberOfLines
        } : {})
      }}
      {...(numberOfLines ? { numberOfLines: Number(numberOfLines) } : {})}
      {...props}
    />
  </context.Provider>
})
