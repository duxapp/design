import './Select.scss'

export const Select = ({
  value,
  onChange,
  options
}) => {
  return <select className='Select' value={value} onChange={v => onChange(v.target.value)}>
    <option value={undefined}>不选择</option>
    {options?.map(item => {
      return <option key={item.name} value={item.value}>{item.name}</option>
    })}
  </select>
}

Select.config = {
  name: '下拉'
}
