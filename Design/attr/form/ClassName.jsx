import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'
import { Column, Row, ScrollView, Text } from '../../common'
import './ClassName.scss'

export const ClassName = ({
  value,
  onChange
}) => {

  const [show, setShow] = useState(false)

  const selects = useMemo(() => {
    if (!value) {
      return []
    }
    return value.split(' ')
  }, [value])

  const click = useCallback((index, item) => {
    let list = selects
    if (~index) {
      list.splice(index, 1)
    } else {
      // 去除重复的样式
      const repeatStart = repeatCLassName.find(start => item.startsWith(start))
      if (repeatStart) {
        list = list.filter(name => !name.startsWith(repeatStart))
      }
      list.push(item)
    }
    onChange(list.join(' '))
  }, [onChange, selects])

  return <>
    <Column className={classNames('DesignClassName', show && 'DesignClassName--focus')}>
      <textarea className='input' onFocus={() => setShow(true)} onBlur={() => setShow(false)} value={value} onChange={e => onChange(e.target.value)} />
      {show && <div className='pop' onMouseDown={e => e.preventDefault()}>
        <ScrollView>
          {
            classList.map(group => {
              return <Column key={group.name} className='group'>
                <Text className='groupName'>{group.name}</Text>
                <Row wrap className='list'>
                  {
                    group.list.map(item => {
                      const index = selects.indexOf(item)
                      return <Text
                        className={classNames('item', ~index && 'select')}
                        key={item}
                        onClick={() => click(index, item)}
                      >{item}</Text>
                    })
                  }
                </Row>
              </Column>
            })
          }
        </ScrollView>
      </div>}
    </Column>
  </>
}

ClassName.config = {
  name: '类名',
  verify: value => typeof value === 'string'
}

const classList = [
  {
    name: '外边距',
    list: ['m-1', 'm-2', 'm-3', 'mh-1', 'mh-2', 'mh-3', 'mv-1', 'mv-2', 'mv-3', 'mt-1', 'mt-2', 'mt-3']
  },
  {
    name: '内边距',
    list: ['p-1', 'p-2', 'p-3', 'ph-1', 'ph-2', 'ph-3', 'pv-1', 'pv-2', 'pv-3']
  },
  {
    name: '子元素间距',
    list: ['gap-1', 'gap-2', 'gap-3', 'gap-4']
  },
  {
    name: '圆角',
    list: ['r-1', 'r-2', 'r-3', 'r-max', 'rt-1', 'rt-2', 'rt-3', 'rb-1', 'rb-2', 'rb-3']
  },
  {
    name: '裁剪',
    list: ['overflow-hidden']
  },
  {
    name: '背景颜色',
    list: ['bg-white', 'bg-primary', 'bg-secondary', 'bg-page']
  },
  {
    name: '父元素布局',
    list: [
      'flex-row', 'flex-wrap',
      'items-start', 'items-end', 'items-center', 'items-baseline',
      'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly'
    ]
  },
  {
    name: '子元素布局',
    list: ['flex-grow', 'flex-shrink', 'self-start', 'self-end', 'self-center', 'self-stretch', 'self-baseline']
  },
  {
    name: '尺寸',
    list: ['w-full', 'h-full', 'w-0', 'h-0']
  },
  {
    name: '定位',
    list: ['absolute', 'inset-0', 'top-0', 'right-0', 'bottom-0', 'left-0', 'z-0', 'z-1']
  }
]

const repeatCLassName = [
  'm-',
  'mh-',
  'mv-',
  'mt-',
  'p-',
  'ph-',
  'pv-',
  'gap-',
  'r-',
  'rt-',
  'rb-',
  'bg-',
  'items-',
  'justify-',
  'self-',
  'z-',
  'bg-',
  'w-',
  'h-'
]
