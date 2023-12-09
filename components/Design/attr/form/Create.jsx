import { ObjectArrayForm } from './Array'
import { Form } from './Form'
import { FormItem } from './Common'
import './Create.scss'
import { Row } from '../../common'

export const Create = ({
  form
}) => {

  if (typeof form !== 'object') {
    return null
  }

  const _form = Object.entries(form)

  return _form.map(([field, config]) => {
    if (typeof config !== 'object') {
      return null
    }
    if (config.__object) {
      return <Form.Item key={field} field={field}>
        <Form.Object>
          <Create form={config} />
        </Form.Object>
      </Form.Item>
    } else if (config.__objectArray) {
      return <Form.Item key={field} field={field}>
        {({ value }) => <ObjectArrayForm value={value} config={config} />}
      </Form.Item>
    }
    return <Row key={field} items='center' className='CreateItem'>
      <div className='name'>{config?.name || '未定义'}</div>
      <FormItem field={field} config={config} />
    </Row>
  })
}
