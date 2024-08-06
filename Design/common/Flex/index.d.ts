import { StandardProps } from '@tarojs/components/types/common'
import { ReactNode } from 'react'

interface RowProps extends StandardProps {
  /** 是否换行 */
  wrap?: boolean
  /** 横向排列时主轴对齐方式 */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around'
  /** 纵向排列时交叉轴对齐方式 */
  items?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  /** 是否允许扩张 */
  grow?: boolean
  /** 是否允许收缩 */
  shrink?: boolean
  /** 自身对齐方式 */
  self?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  /** 子元素 */
  children?: ReactNode
}

interface ColumnProps extends StandardProps {
  /** 纵向排列时主轴对齐方式 */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around'
  /** 横向排列时交叉轴对齐方式 */
  items?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  /** 是否允许扩张 */
  grow?: boolean
  /** 是否允许收缩 */
  shrink?: boolean
  /** 自身对齐方式 */
  self?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  /** 子元素 */
  children?: ReactNode
}

export const Row: React.FC<RowProps>
export const Column: React.FC<ColumnProps>
