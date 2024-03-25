import { Text } from '@tarojs/components'
import { useMemo } from 'react'
import { font, px } from '@/duxapp/utils'

export const Icon = ({ name, ...props }) => {

  if (!name) {
    return
  }

  const icons = Icon.icons[name[0]]

  if (!icons) {
    return console.log(`${name[0]}图标库不存在`)
  }

  if (!icons[name[1]]) {
    return console.log(`${name[0]}的${name[1]}图标不存在`)
  }

  return <IconText name={name} icons={icons} {...props} />
}

const IconText = ({ name, icons, color, size, style, className, ...props }) => {

  const _style = useMemo(() => {
    const sty = { ...style }
    if (color) {
      sty.color = color
    }
    if (size) {
      sty.fontSize = px(size)
    }
    return sty
  }, [color, size, style])

  const status = font.useFont(name[0])

  if (!status) {
    return null
  }

  return <Text
    className={`${name[0]}${className ? ' ' + className : ''}`}
    style={_style}
    {...props}
  >
    {String.fromCharCode(icons[name[1]])}
  </Text>
}

Icon.icons = {}

Icon.add = (name, json) => {
  Icon.icons[name] = json
}
