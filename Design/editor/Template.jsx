import { useDrag } from 'react-dnd'
import { useCallback } from 'react'
import EditTypes from '../utils/editTypes'
import { useDesignContext } from '../utils/context'
import { NodePosition } from '../utils/edit'
import { NodePreview } from '../common/NodePreview'

export const TemplateItem = ({
  nodes
}) => {

  const [, drag] = useDrag({
    type: EditTypes.TEMPLATE_ADD,
    item: () => {
      return {
        template: nodes
      }
    }
  })

  const { moveNode, nodes: pageNodes } = useDesignContext()

  const add = useCallback(() => {
    moveNode(nodes, new NodePosition('__root__', pageNodes.length))
  }, [moveNode, nodes, pageNodes.length])

  return <NodePreview nodes={nodes} mask ref={drag} onClick={add} />
}
