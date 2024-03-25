import { useCallback, useMemo, useState } from 'react'
import { Column, Modal, Row, ScrollView, Tab, Text } from '../../common'
import { InputBase } from './Input'
import { Icon as IconRender } from '../../../Component/Icon'
import './Icon.scss'
import { toast } from '../../utils/util'

export const Icon = ({
  value,
  onChange
}) => {

  const [show, setShow] = useState(false)

  const [select, setSelect] = useState(0)

  const [keyword, setKeyWord] = useState('')

  const icons = useMemo(() => {
    return Object.keys(IconRender.icons).map(name => {
      const icon = IconRender.icons[name]
      return {
        name,
        list: Object.keys(icon)
      }
    })
  }, [])

  const showIcons = icons[select]

  const showList = useMemo(() => {
    if(!keyword) {
      return showIcons.list
    }
    return showIcons.list.filter(v => v.includes(keyword))
  }, [keyword, showIcons.list])

  const change = useCallback(name => {
    setShow(false)
    onChange([showIcons.name, name])
  }, [onChange, showIcons.name])

  return <>
    <div className='DesignIcon'
      onClick={() => {
        if (!Object.keys(IconRender.icons).length) {
          return toast('未注册任何图标库')
        }
        setShow(true)
      }}
    >
      {
        value ?
          <IconRender name={value} className='icon' />
          : <Text className='add'>选择</Text>
      }
    </div>

    <Modal show={show} onClose={() => setShow(false)} className='DesignIconPop'>
      <Tab oneHidden list={icons.map((item, index) => ({ name: item.name, key: index }))} value={select} onChange={setSelect} />
      <InputBase placeholder='请输入图标名称词搜索' onChange={setKeyWord} throttle />
      <Column className='scroll'>
        <ScrollView>
          <Row wrap className='icons'>
            {
              showList.map(item => <Column className='item' key={item} onClick={() => change(item)}>
                <IconRender name={[showIcons.name, item]} className='icon' />
                <Text className='name' color={2} numberOfLines={2}>{item}</Text>
              </Column>)
            }
          </Row>
        </ScrollView>
      </Column>
    </Modal>
  </>

}


Icon.config = {
  name: '链接',
  verify: value => typeof value === 'string'
}
