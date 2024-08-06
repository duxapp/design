import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { noop } from '@/duxapp/utils'
import { useMemo } from 'react'
import { designContext, useDesignContext } from './utils/context'
import { useDesign } from './utils/design'
import { useTheme } from './utils/theme'
import './Design.scss'

const DesignBase = ({
  defaultValue = [],
  onChange = noop,
  children,
  config,
  Design: DesignEditor
}) => {

  const { config: parentConfig } = useDesignContext()

  useTheme(parentConfig ? null : config?.theme)

  const configData = useMemo(() => {
    const configRes = {
      ...parentConfig,
      ...config,
    }
    const parentInclude = parentConfig?.component?.include || []
    const include = (config?.component?.include || []).filter(key => {
      if (!parentInclude.length) {
        return true
      }
      return parentInclude.includes(key)
    })
    return {
      ...configRes,
      component: {
        ...configRes.component,
        include
      }
    }
  }, [config, parentConfig])

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
  } = useDesign(defaultValue, onChange, configData)

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
      config: configData,
      DesignEditor
    }}
  >
    {children}
  </designContext.Provider>
}

DesignBase.defaultProps = {
  config: {}
}

export const Design = props => {

  return <DndProvider backend={HTML5Backend}>
    <DesignBase {...props} />
  </DndProvider>
}
