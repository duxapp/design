import { useState, useRef, useEffect } from 'react'
import { Form } from './Form'
import { FormItem } from './Common'
import './Array.scss'

export const ObjectArrayForm = ({ value, config, onChange }) => {
  const keyList = Object.keys(config).filter(v => typeof config[v] === 'object')

  const ref = useRef()

  const [width, setWidth] = useState(0)

  useEffect(() => {
    setWidth(ref.current.offsetWidth)
  }, [])

  return <Form.Array value={value} onChange={onChange}>
    <div className='ObjectArrayForm' ref={ref} style={width ? { width } : {}}>
      {width > 0 && <table>
        {typeof config.__objectArray === 'string' && <tr>
          <th colspan={keyList.length + 1}>
            {config.__objectArray}
          </th>
        </tr>}
        <tr>
          {keyList.map(_field => <th key={_field}>
            {config[_field].name}
          </th>)}
          <th>
            <Form.ArrayAction
              action={list => {
                return [...list, {}]
              }}
            >
              <a>添加</a>
            </Form.ArrayAction>
          </th>
        </tr>
        {
          value?.map?.((v, i) => <Form.Item key={i} field={i}>
            <Form.Object>
              <tr>
                {keyList.map(_field => {
                  return <td key={_field}>
                    <FormItem field={_field} config={config[_field]} />
                  </td>
                })}
                <td>
                  <Form.ArrayAction
                    action={list => {
                      list.splice(i, 1)
                      return [...list]
                    }}
                  >
                    <a>删除</a>
                  </Form.ArrayAction>
                </td>
              </tr>
            </Form.Object>
          </Form.Item>)
        }
      </table>}
    </div>
  </Form.Array>
}
