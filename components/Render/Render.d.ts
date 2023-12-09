import { ComponentType, LegacyRef } from 'react'
import { design } from '../Design/components/edit'

interface CreateProps {
  /** 节点列表 */
  nodes: design.Node[]
  /** ref引用 */
  ref?: LegacyRef<any>
}

/**
 * 用于渲染节点的组件
 */
export const Render: ComponentType<CreateProps>
