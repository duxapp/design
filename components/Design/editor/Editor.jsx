import { useRef } from 'react'
import classNames from 'classnames'
import { Render } from './Render'
import { ZoomRoot } from '../common'
import { useDesignContext } from '../utils'
import './Editor.scss'

const DefaultEditor = ({ className, ...props }) => {
  const { nodes, drop } = useDesignContext()

  const ref = useRef(null)

  drop(ref)

  return <ZoomRoot
    className={classNames('Editor', className)}
    {...props}
  >
    <div ref={ref}>
      <Render nodes={nodes} />
    </div>
  </ZoomRoot>
}

export const Editor = ({
  mode,
  ...props
}) => {
  if (mode === 'absolute') {
    return
  }
  return <DefaultEditor {...props} />
}
