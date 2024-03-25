import { useCallback } from 'react'
import { Column, Text } from '../../common'
import { useDesignContext } from '../../utils'
import './Media.scss'

export const UploadImage = ({
  value,
  onChange
}) => {
  const { config } = useDesignContext()

  const up = useCallback(async () => {
    if (typeof config.upload !== 'function') {
      return console.log('请从配置文件传入上传函数:upload')
    }
    const [url] = await config.upload('image', {
      count: 1
    })
    onChange(url)
  }, [config, onChange])

  return <Column className='DesignUploadImage' onClick={up}>
    {
      value ?
        <img className='img' src={value} /> :
        <Text className='add'>+</Text>
    }
  </Column>
}

UploadImage.config = {
  name: '图片',
  verify: value => typeof value === 'string' && value.startsWith('http')
}

export const UploadVideo = ({
  value,
  onChange
}) => {
  const { config } = useDesignContext()

  const up = useCallback(async () => {
    if (typeof config.upload !== 'function') {
      return console.log('请从配置文件传入上传函数:upload')
    }
    const [url] = await config.upload('video', {
      count: 1
    })
    onChange(url)
  }, [config, onChange])

  return <Column className='DesignUploadImage' onClick={up}>
    {
      value ?
        <video className='img' src={value} /> :
        <Text className='add'>+</Text>
    }
  </Column>
}

UploadVideo.config = {
  name: '视频',
  verify: value => typeof value === 'string' && value.startsWith('http')
}
