import { useEffect, useMemo, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import classNames from 'classnames'
import { getKey } from '@/design/utils'
import { Form } from './Form'
import { FormItem, comps } from './Common'
import { Column, Row, Text } from '../../common'
import './Create.scss'

export const Create = ({
  form
}) => {

  const { values } = Form.useFormContext()

  if (typeof form !== 'object') {
    return null
  }

  const _form = Object.entries(form)

  return _form.map(([field, config]) => {
    if (typeof config !== 'object') {
      return null
    }
    const show = config.__object?.show
      || config.__objectArray?.show
      || config.__array?.show
      || config.show

    if (typeof show === 'function' && !show({ values, field, config })) {
      return null
    }

    // 分组显示
    if (config.__group) {
      return <GroupRender values={values} key={field} config={config} />
    } else if (config.__object) {
      return <Form.Item key={field} field={field}>
        <Form.Object>
          <ObjectForm config={config} />
        </Form.Object>
      </Form.Item>
    } else if (config.__objectArray) {
      return <Form.Item key={field} field={field}>
        <ObjectArrayForm config={config} />
      </Form.Item>
    } else if (config.__array) {
      return <Form.Item key={field} field={field}>
        <ArrayForm config={config} />
      </Form.Item>
    }
    return <FormItemRender key={field} field={field} config={config} data={values} />
  })
}

const GroupRender = ({ values, config }) => {

  const form = useMemo(() => Object.fromEntries(Object.keys(config).filter(v => v !== '__group').map(v => [v, config[v]])), [config])

  const [expand, setExpand] = useState(() => {
    return Object.keys(form).some(key => typeof values[key] !== 'undefined')
  })

  return <>
    <Row items='center' justify='between' className='GroupRender'
      onClick={() => {
        setExpand(!expand)
      }}
    >
      <Text className='name'>{config.__group?.name || '分组'}</Text>
      <div
        className={classNames('expand', expand && 'expand--show')}
      />
    </Row>
    {expand && <Column className='CreateItem ObjectForm'>
      <Create form={form} />
    </Column>}
  </>
}

const ObjectForm = ({ config }) => {

  const form = useMemo(() => Object.fromEntries(Object.keys(config).filter(v => v !== '__object').map(v => [v, config[v]])), [config])

  const setting = config.__object

  if (setting.name) {
    return <>
      <Text className='ObjectForm--name'>{setting.name}</Text>
      <Column className='CreateItem ObjectForm'>
        <Create form={form} />
      </Column>
    </>
  }

  return <Create form={form} />
}

const ObjectArrayForm = ({ value, config, onChange }) => {

  const form = useMemo(() => Object.fromEntries(Object.keys(config).filter(v => v !== '__objectArray').map(v => [v, config[v]])), [config])

  const dargType = useDargType()

  const [keys] = useState(() => {
    return value?.map(getKey) || []
  })

  return <Column className='CreateItem ObjectArray'>
    <Form.Array value={value} onChange={onChange}>
      <Row items='center'>
        <Text className='name'>{config.__objectArray?.name || '未定义'}</Text>
        {(!config.__objectArray.min || value.length > config.__objectArray.min) && <Form.ArrayAction
          action={list => {
            keys.push(getKey())
            return [...list, {}]
          }}
        >
          <Text className='ObjectArray-add'>+</Text>
        </Form.ArrayAction>}
      </Row>
      {
        value?.map?.((v, i) => <Form.Item key={keys[i]} field={i}>
          <Form.Object>
            <Form.ArrayAction type='sort'>
              <SortDrop type={dargType} index={i} className='ObjectArray-item'
                onSort={(dragIndex, hoverIndex) => {
                  keys.splice(hoverIndex, 0, ...keys.splice(dragIndex, 1))
                }}
              >
                <Create form={form} />
                <Row className='ObjectArray-action'>
                  <SortDrag type={dargType} index={i} />
                  {(!config.__objectArray.min || value.length > config.__objectArray.min) && <Form.ArrayAction
                    action={list => {
                      list.splice(i, 1)
                      return [...list]
                    }}
                  >
                    <Text className='ObjectArray-del'>-</Text>
                  </Form.ArrayAction>}
                </Row>
              </SortDrop>
            </Form.ArrayAction>
          </Form.Object>
        </Form.Item>)
      }
    </Form.Array>
  </Column>
}

const ArrayForm = ({ value = [], config, onChange }) => {
  const { type } = config

  const dargType = useDargType()

  const [keys] = useState(() => {
    return value?.map(getKey) || []
  })

  return <Column className='CreateItem ObjectArray'>
    <Form.Array value={value} onChange={onChange}>
      <Row items='center'>
        <Text className='name'>{config.__array?.name || '未定义'}</Text>
        {(!config.__array.max || value.length < config.__array.max) && <Form.ArrayAction
          action={list => {
            // 最小添加行数
            const min = Math.max((config.__array.min || 1) - list.length, 1)
            for (let i = 0; i < min; i++) {
              keys.push(getKey())
              const childDefault = type.__proto__?.__proto__ !== null ? void 0 : type.__array || type.__objectArray ? [] : {}
              list.push(childDefault)
            }
            return [...list]
          }}
        >
          <Text className='ObjectArray-add'>+</Text>
        </Form.ArrayAction>}
      </Row>
      {
        value?.map?.((v, i) => <Form.ArrayAction key={keys[i]} type='sort'>
          <SortDrop type={dargType} index={i} className='ObjectArray-item'
            onSort={(dragIndex, hoverIndex) => {
              keys.splice(hoverIndex, 0, ...keys.splice(dragIndex, 1))
            }}
          >
            {type.__proto__?.__proto__ === null ?
              <Form.Item field={i}>
                <ObjectArrayForm value={v} config={type} />
              </Form.Item> :
              <FormItem field={i} config={config} />
            }
            <Row className='ObjectArray-action'>
              <SortDrag type={dargType} index={i} />
              {(!config.__array.min || value.length > config.__array.min) && <Form.ArrayAction
                action={list => {
                  list.splice(i, 1)
                  keys.splice(i, 1)
                  return [...list]
                }}
              >
                <Text className='ObjectArray-del'>-</Text>
              </Form.ArrayAction>}
            </Row>
          </SortDrop>
        </Form.ArrayAction>)
      }
    </Form.Array>

  </Column>
}

const SortDrag = ({ type, index, ...props }) => {

  const ref = useRef(null)
  const [{ isDragging }, drag] = useDrag({
    type,
    item: () => {
      return { index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(ref)

  useEffect(() => {
    if (isDragging) {
      const parent = ref.current.parentNode.parentNode
      parent.style.opacity = 0.1
      return () => {
        parent.style.opacity = 1
      }
    }
  }, [isDragging])

  return <div {...props} className='drag' ref={ref}>
    <div className='drag-line' />
    <div className='drag-line' />
    <div className='drag-line' />
  </div>
}

const SortDrop = ({ type, onSort, index, ...props }) => {

  const ref = useRef(null)

  const [{ handlerId }, drop] = useDrop({
    accept: type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      onSort(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  drop(ref)

  return <div ref={ref} {...props} data-handler-id={handlerId} />
}

const useDargType = (() => {
  let key = 0
  return () => {
    const val = useMemo(() => ++key, [])

    return `form-array-srot-${val}`
  }
})();

const FormItemRender = ({ field, config, data }) => {

  const currentValue = data[field]

  const [select, setSelect] = useState(() => {
    if (typeof currentValue === 'undefined') {
      return 0
    }
    if (!Array.isArray(config.type) || config.type.length < 2) {
      return
    }
    const index = config.type.findIndex((type, typeIndex) => {
      const Item = getItem(type)
      if (!Item) {
        return false
      }
      return Item.config?.verify?.(currentValue, {
        ...config,
        type,
        props: config.props?.[typeIndex]
      })
    })
    if (~index) {
      return index
    }
    return 0
  })

  const [_config, types] = useMemo(() => {
    if (config.type instanceof Array) {
      return [
        {
          ...config,
          type: config.type[select],
          props: config.props?.[select] || {}
        },
        config.type.map((type, index) => {
          const Item = getItem(type)
          if (!Item) {
            return
          }
          return {
            name: Item.config?.name || type,
            value: index
          }
        }).filter(v => v)
      ]
    }
    return [config, []]
  }, [config, select])

  const Item = getItem(_config.type)

  return <Column key={field} className='CreateItem'>
    {!Item?.config?.customTitle && <Row justify='between' items='center'>
      <Text className='name'>{config?.name || '未定义'}</Text>
      {types.length > 1 && <Radio options={types} value={select} onChange={setSelect} />}
    </Row>}
    {!!config?.desc && <Text className='desc' color={2}>{config?.desc}</Text>}
    <FormItem field={field} config={_config} />
  </Column>
}

const Radio = ({
  value,
  onChange,
  options
}) => {
  return <Row wrap className='TypeRadio'>
    {
      options?.map((item, index) => {
        const select = value === item.value
        return <div items='center' key={item.value} onClick={() => !select && onChange(item.value)}
          className={classNames(
            'TypeRadioItem',
            select && 'TypeRadioItem--select',
            !index && 'TypeRadioItem--start',
            index === options.length - 1 && 'TypeRadioItem--end'
          )}
        >
          {item.name}
        </div>
      })
    }
  </Row>
}

const getItem = type => typeof type === 'string' ? comps[type] : type
