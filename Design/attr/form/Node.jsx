import { useState } from 'react'
import { deepCopy, useDeepObject } from '@/duxapp'
import classNames from 'classnames'
import { Column, Text, NodePreview, Modal, Row } from '../../common'
import { useDesignContext } from '../../utils'
import './Node.scss'

export const Node = ({
  include,
  max,
  value,
  onChange
}) => {
  const { DesignEditor } = useDesignContext()

  const [show, setShow] = useState(false)

  const [nodes, setNodes] = useState(() => Array.isArray(value) ? deepCopy(value) : [])

  const config = useDeepObject({
    component: {
      include,
      max
    }
  })

  if (!DesignEditor) {
    return <Column className='DesignNode'>
      <Text className='tip' color={2}>未设置Design参数</Text>
    </Column>
  }

  return <>
    <Column className={classNames('DesignNode', !nodes?.length && 'DesignNode--empty')} onClick={() => setShow(true)}>
      {
        nodes?.length ?
          <NodePreview nodes={nodes} mask /> :
          <Text className='add'>编辑节点</Text>
      }
    </Column>
    <Modal show={show} mask>
      <Column className='DesignNodePop'>
        <Row className='head'>
          <Text className='title'>节点编辑</Text>
          <Text className='cancel'
            onClick={() => {
              setShow(false)
              setNodes(Array.isArray(value) ? deepCopy(value) : [])
            }}
          >取消</Text>
          <Text className='submit'
            onClick={() => {
              setShow(false)
              onChange(nodes.length ? deepCopy(nodes) : undefined)
            }}
          >确定</Text>
        </Row>
        <DesignEditor config={config} defaultValue={nodes} onChange={setNodes} />
      </Column>
    </Modal>
  </>
}

Node.defaultProps = {
  value: []
}

Node.config = {
  name: '节点',
  verify: value => Array.isArray(value)
}
