import { SketchPicker } from 'react-color'
import { useCallback, useEffect, useState, memo } from 'react'
import { isColorString } from '@/duxapp/utils/color'
import { stopPropagation } from '@/duxapp/utils/util'
import { Row } from '../../common'
import { InputBase } from './Input'
import './Color.scss'

export const Color = memo(({
  value,
  onChange
}) => {

  const [inputValue, setInputValue] = useState(isColorString(value) ? value : '')

  const [show, setShow] = useState(false)

  useEffect(() => {
    if (show) {
      const calback = () => {
        setShow(false)
      }
      document.addEventListener('click', calback)
      return () => {
        document.removeEventListener('click', calback)
      }
    }
  }, [show])

  const change = useCallback(val => {
    setInputValue(val)
    if (!val) {
      onChange(undefined)
    } else if (isColorString(val)) {
      onChange(val)
    }
  }, [onChange])

  return <>
    <Row className='DesignColor' items='center'>
      <div className='show' onClick={() => !show && setShow(true)} style={{ backgroundColor: value }}></div>
      <InputBase className='color' value={inputValue} onChange={change} />
      {show && <div className='pop' onClick={stopPropagation}>
        <SketchPicker disableAlpha={false} color={value}
          onChange={e => change(`rgba(${e.rgb.r},${e.rgb.g},${e.rgb.b},${e.rgb.a})`)}
        />
      </div>}
    </Row>
  </>
})

Color.config = {
  name: '颜色',
  verify: value => isColorString(value)
}
