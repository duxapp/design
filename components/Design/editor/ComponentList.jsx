import { useCallback, useMemo, useState } from 'react'
import { useDrag } from 'react-dnd'
import { useDesignContext } from '../utils/context'
import comp from '../utils/comp'
import EditTypes from '../utils/editTypes'
import { NodePosition } from '../utils/edit'
import { Row, ZoomRoot } from '../common'
import './ComponentList.scss'

const Module = ({ item }) => {
  const { selectNode, moveNode, nodes } = useDesignContext()

  const [, drag] = useDrag({
    type: EditTypes.FORM_ADD,
    item: () => {
      selectNode()
      return { nodeName: item.nodeName }
    }
  })

  const add = useCallback(() => {
    moveNode(item.nodeName, new NodePosition('__root__', nodes.length))
  }, [item.nodeName, moveNode, nodes.length])

  return <div ref={drag} className='item' onClick={add}>
    <span className='text'>{item.name}</span>
  </div>
}

export const ComponentList = () => {

  const cates = useMemo(() => comp.getCates(), [])
  const [cateName, setCateName] = useState(cates[0])

  const module = useMemo(() => {
    return comp.getComps().filter(item => item.cate === cateName)
  }, [cateName])

  return <ZoomRoot className='ComponentList' self='stretch'>
    <div className='level-1'>
      {
        cates.map(cate => <div
          className={`cate${cate === cateName ? ' hover' : ''}`}
          key={cate}
          onClick={() => setCateName(cate)}
        >
          <span className='cate-name'>{cate}</span>
        </div>)
      }
    </div>
    {!!cateName && <div className='level-2'>
      <Row className='child-cate' wrap>
        {
          module.map(child => <Module key={child.nodeName} item={child} />)
        }
      </Row>
    </div>}
  </ZoomRoot>
}
