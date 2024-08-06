import { Fragment, useCallback, useState } from 'react'
import classNames from 'classnames'
import { contextState } from '@/duxapp/utils'
import { Column, Modal, Row, Tab, Text } from '../../common'
import { useDesignContext } from '../../utils'
import { InputBase } from './Input'
import './Link.scss'

export const Link = ({
  value,
  onChange
}) => {
  const { config } = useDesignContext()

  const [show, setShow] = useState(false)

  const [select, setSelect] = useState(0)

  const [focus, setFocus] = useState(false)

  const change = useCallback(url => {
    setShow(false)
    onChange(url)
  }, [onChange])

  if (!config.link) {
    return <Text>请传入组件连接配置</Text>
  }

  const LinkItem = config.link[select]

  const Item = comps[LinkItem.type]

  return <Row className={classNames('DesignLink', focus && 'DesignLink--focus')} items='center'>
    <div className='value'>
      <input className='input' value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
    </div>
    <Text className='select' onClick={() => setShow(true)}>选择</Text>

    <Modal show={show} onClose={() => setShow(false)} className='DesignLinkPop'>
      <Tab oneHidden list={config.link.map((item, index) => ({ name: item.name, key: index }))} value={select} onChange={setSelect} />
      {Item ? <Item {...LinkItem} onChange={change} /> : <Text>类型{LinkItem.type}不支持</Text>}
    </Modal>
  </Row>

}

const LinkGroup = ({ gropu, onChange }) => {
  return gropu.map(item => {
    return <Fragment key={item.name}>
      <Text className='group-name' color={1}>{item.name}</Text>
      <Row wrap className='group-list'>
        {
          item.list.map(link => <Column
            className='item'
            onClick={() => onChange(link.url)} key={link.name}
          >{link.name}</Column>)
        }
      </Row>
    </Fragment>
  })
}

const LinkList = ({ List, listProps, onChange, url }) => {

  const [keyword, setKeyWord] = useState('')

  return <Column className='LinkList'>
    <InputBase placeholder='请输入关键词搜索' onChange={setKeyWord} throttle />
    <contextState.Provider value={{ renderItem: listProps.renderItem, onChange, url }}>
      <List
        {...listProps}
        data={{ ...listProps.data, keyword }}
        renderItem={LinkListItem}
      />
    </contextState.Provider>
  </Column>
}

const LinkListItem = ({ item, index }) => {

  const [{ renderItem, onChange, url }] = contextState.useState()
  return <Row className='item' onClick={() => onChange(url(item))}>
    {renderItem({ item, index })}
  </Row>
}

const comps = {
  group: LinkGroup,
  list: LinkList
}

Link.config = {
  name: '链接',
  verify: value => typeof value === 'string'
}
