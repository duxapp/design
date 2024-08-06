import { StandardProps } from '@tarojs/components/types/common'
import { ReactNode } from 'react'

interface TextProps extends StandardProps {
  /** 是否加粗 */
  bold?: boolean
  /** 是否有下划线 */
  underline?: boolean
  /** 显示的行数，超出部分将被截断 */
  numberOfLines?: number
  /** 文本对齐方式 */
  align?: 'left' | 'center' | 'right' | 'justify'
  /** 容器在主轴方向上的伸缩能力 */
  grow?: boolean
  /** 容器在主轴方向上的收缩能力 */
  shrink?: boolean
  /** 单个元素在交叉轴方向上的对齐方式 */
  self?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  /** 子元素 子元素只能是 文本、Text组件、图标组件 */
  children?: ReactNode
}

export const Text: React.FC<TextProps>
