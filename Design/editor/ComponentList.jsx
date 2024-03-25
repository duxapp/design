import { useCallback, useMemo, useState } from 'react'
import { useDrag } from 'react-dnd'
import classNames from 'classnames'
import { useDesignContext } from '../utils/context'
import comp from '../utils/comp'
import EditTypes from '../utils/editTypes'
import { InputBase } from '../attr/form'
import { ZoomRoot, ScrollView, Column, Text, Row } from '../common'
import './ComponentList.scss'

export const ComponentList = () => {

  const { config } = useDesignContext()

  const [keyword, setKeyword] = useState('')

  const cates = useMemo(() => {
    return Object.entries(comp.getComps().reduce((prev, current) => {
      if (current.cate) {
        if (!prev[current.cate]) {
          prev[current.cate] = []
        }
        prev[current.cate].push(current)
      }
      return prev
    }, {})).map(([name, list]) => ({ name, list }))
  }, [])

  const showCate = useMemo(() => {
    if (!keyword && !config.component?.include?.length) {
      return cates
    }
    return cates.map(cate => {
      return {
        name: cate.name,
        list: cate.list.filter(item => {
          if (keyword && !item.name.includes(keyword)) {
            return false
          }
          if (config.component?.include?.length && !config.component.include.includes(item.tag)) {
            return false
          }
          return true
        })
      }
    }).filter(cate => cate.list.length)
  }, [keyword, cates, config.component?.include])

  return <ZoomRoot className='ComponentList' self='stretch'>
    <ScrollView className='scroll-view'>
      <InputBase className='search' value={keyword} placeholder='搜索组件' onChange={setKeyword} />
      {
        showCate.map(cate => <Column key={cate.name} className='cate'>
          <Text className='cate-name'>{cate.name}</Text>
          <Row wrap className='cate-list'>
            {
              cate.list.map(item => <Module key={item.tag} item={item} />)
            }
          </Row>
        </Column>)
      }
    </ScrollView>
  </ZoomRoot>
}

const Module = ({ item }) => {
  const { selectNode, moveNode } = useDesignContext()

  const [, drag] = useDrag({
    type: EditTypes.FORM_ADD,
    item: () => {
      selectNode()
      return { tag: item.tag }
    }
  })

  const add = useCallback(() => {
    moveNode(item.tag)
  }, [item.tag, moveNode])

  return <div ref={drag} className='item' onClick={add}>
    <Icon icon={item.icon} />
    <Text className='text' color={2}>{item.name}</Text>
  </div>
}

const Icon = ({ icon }) => {

  if (icon instanceof Array) {
    return <span className={classNames('icon-text', icon[0], `${icon[0]}-${icon[1]}`)} />
  }

  return <img src={icon} className='icon' />
}

