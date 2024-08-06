import { useEffect, useRef, useState, forwardRef } from 'react'
import { px } from '@/duxapp/utils/util'
import { Render } from '../../../Render/Render'
import './index.scss'

export const NodePreview = forwardRef(({ nodes, mask, ...props }, propsRef) => {

  const [size, setSize] = useState([0, 0])

  const ref = useRef(null)

  const isScroll = nodes.some(v => v.tag === 'ScrollView' || v.tag === 'ScrollViewManage')

  useEffect(() => {
    const s = ref.current.parentNode.offsetWidth / ref.current.offsetWidth
    setSize([s, ref.current.offsetHeight])
  }, [nodes])

  return <div className='DesignNodePreview' {...props} ref={propsRef} style={{ height: size[1] * size[0] }}>
    <div className='content' ref={ref}
      style={{
        ...size[0] ? { transform: `scale3d(${size[0]}, ${size[0]}, 1)` } : {},
        ...isScroll ? { minHeight: px(1200) } : {}
      }}
    >
      <Render nodes={nodes} />
    </div>
    {mask && <div className='mask' />}
  </div>
})
