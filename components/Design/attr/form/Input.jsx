import './Input.scss'

const InputBase = ({
  value,
  onChange
}) => {
  return <div className='Input'>
    <input className='input' value={value} onInput={e => onChange(e.target.value)} />
  </div>
}

export const Input = ({
  value,
  onChange
}) => {
  return <InputBase value={value} onChange={onChange} />
}

export const InputNumber = ({
  value,
  onChange
}) => {
  return <InputBase value={value} onChange={e => onChange(+e)} />
}

export const InputSize = ({
  value,
  onChange
}) => {
  return <InputBase value={value} onChange={e => onChange(+e)} />
}
