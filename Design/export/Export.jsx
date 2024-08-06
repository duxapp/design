import { useMemo } from 'react'
import { Code } from './Code'
import { nodeToJsx } from './util'
import { Row, Text } from '../common'
import { useDesignContext } from '../utils'
import './common.scss'

export const Export = ({ nodes }) => {

  const { config } = useDesignContext()

  const dark = config.theme?.dark

  const jsx = useMemo(() => {
    return nodeToJsx(nodes, true).jsx
  }, [nodes])

  return <div className='ExportPage' style={{ backgroundColor: dark ? 'rgb(30, 30, 30)' : 'rgb(250, 250, 250)' }}>
    <Row className='head' items='center' justify='center'>
      <Text className='title'>导出</Text>
    </Row>
    <div className='scroll-main'>
      <Code code={jsx} language='jsx' />
    </div>
  </div>
}
