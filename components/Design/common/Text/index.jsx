import classNames from 'classnames'
import { createContext, useContext } from 'react'
import './index.scss'

const context = createContext({ child: false })

export const Text = ({
  bold,
  underline,
  numberOfLines,
  align,
  grow,
  shrink,
  self,
  className,
  style,
  ...props
}) => {

  const { child } = useContext(context)

  return <context.Provider value={{ child: true }}>
    <span
      className={classNames(
        !child && 'Text',
        bold ?? bold ? 'Text-bold' : 'Text-nobold',
        props.delete && 'Text-delete',
        underline && 'Text-underline',
        grow && 'w-0 flex-grow',
        shrink && 'flex-shrink',
        self && 'self-' + self,
        align && 'text-' + align,
        // 省略行数量
        process.env.TARO_ENV === 'rn' ? '' : numberOfLines === 1 ? 'Text-ellipsis' : numberOfLines > 1 ? 'Text-ellipsis--more' : '',
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
}
