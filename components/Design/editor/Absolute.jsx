import { useRef } from 'react'
import { useDrag } from 'react-dnd'
import classNames from 'classnames'
import { ZoomRoot } from '../common'
import EditTypes from '../utils/editTypes'
import { useDesignContext } from '../utils'
import { componentList, styled } from '../../Render'
import { NodePosition } from '../utils/edit'
import './Absolute.scss'

const RenderItem = ({ props, index }) => {

  const { hidden, nodeName, child, style, key, children, ...otherItem } = props

  const { nodes, hover, moveNode, selectNode } = useDesignContext()

  const { style: styleRes, className } = styled.styleTransform(style, true)

  const [{ isDragging }, drag] = useDrag({
    type: EditTypes.FORM_MOVE,
    item: () => {
      selectNode()
      return {
        type: EditTypes.FORM_MOVE,
        // ref,
        position: new NodePosition('root', index),
        key: otherItem.key,
        nodeName: nodeName
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  })

  if (hidden) {
    return null
  }

  const Item = componentList[nodeName]

  if (!Item) {
    console.log(nodeName + ' 组件未定义')
    return null
  }

  return <div ref={drag}>
    <Item {...otherItem} style={styleRes} className={className} />
  </div>
}

export const AdboluteEditor = ({ className, ...props }) => {
  const { nodes, drop } = useDesignContext()

  const ref = useRef(null)

  drop(ref)

  return <ZoomRoot
    className={classNames('AbsoluteEditor', className)}
    {...props}
    ref={ref}
  >
    {
      nodes.map((item, index) => <RenderItem key={item.key} props={item} index={index} />)
    }
  </ZoomRoot>
}
