import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { noop } from '@/duxapp/utils'
import { designContext } from './utils/context'
import { useDesign } from './utils/design'
import './Design.scss'

const DesignBase = ({
  defaultValue = [],
  onChange = noop,
  children
}) => {

  const {
    nodes,
    hoverKey,
    hover,
    historyStatus,
    saveStatus,
    drop,
    setNodeData,
    moveNode,
    selectNode,
  } = useDesign(defaultValue, onChange)

  // 组件共享数据

  return <designContext.Provider
    value={{
      nodes,
      hoverKey,
      hover,
      historyStatus,
      saveStatus,
      drop,
      setNodeData,
      moveNode,
      selectNode,
    }}
  >
    {children}
  </designContext.Provider>
}

export const Design = props => {

  // 组件共享数据

  return <DndProvider backend={HTML5Backend}>
    <DesignBase {...props} />
  </DndProvider>
}
