import './Select.scss'

export const Select = ({
  value,
  onChange,
  options
}) => {
  return <select className='Select' value={value} onChange={v => onChange(v.target.value)}>
    {options?.map(item => {
      return <option key={item.name} value={item.value}>{item.name}</option>
    })}
  </select>
}
