import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'
import './index.scss'
import { popEvent } from '../../utils/util'

export const Modal = ({
  show,
  mask,
  children,
  onClose,
  className,
  ...props
}) => {

  const [_show, setShow] = useState(show)

  const div = useMemo(() => {
    const el = document.createElement('div')
    el.classList.add('DesignModal')
    document.body.appendChild(el)

    return el
  }, [])

  useEffect(() => {
    return () => {
      document.body.removeChild(div)
    }
  }, [div])

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (show) {
      div.classList.add('show')
      setShow(true)
      popEvent.trigger('open')
    } else {
      if (div.classList.contains('show')) {
        div.classList.add('close')
        div.classList.remove('show')
        setTimeout(() => {
          setShow(false)
          popEvent.trigger('close')
          div.classList.remove('close')
        }, 200)
      }
    }
  }, [div, show])

  return createPortal(
    <>
      <div className='mask'
        onClick={() => {
          if (!mask) {
            onCloseRef.current?.()
          }
        }}
      />
      <div className={classNames('content', className)} {...props}>
        {_show && children}
      </div>
    </>,
    div
  )
}
