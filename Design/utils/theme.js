import { useDeepObject } from '@/duxapp/utils/hooks/common'
import { useMemo, useRef } from 'react'

export const useTheme = theme => {

  const themes = useDeepObject({
    dark: false,
    primaryColor: '#0052d9',
    secondaryColor: '#FDD000',
    ...theme
  })

  const oldStyle = useRef(null)

  useMemo(() => {
    if (!theme) {
      return
    }
    if (oldStyle.current) {
      document.head.removeChild(oldStyle.current)
    }
    const vars = `:root {
  --design-primary-color: ${themes.primaryColor};
  --design-secondary-color: ${themes.secondaryColor};
  --design-page-color: ${themes.dark ? '#242424' : '#fff'};
  --design-text-color1: ${themes.dark ? '#FFF' : '#373D52'};
  --design-text-color2: ${themes.dark ? '#A1A6B6' : '#73778E'};
  --design-text-color3: ${themes.dark ? '#73778E' : '#A1A6B6'};
  --design-text-color4: ${themes.dark ? '#373D52' : '#FFF'};
  --design-border-color: ${themes.dark ? '#e8e8e8' : '#e8e8e8'};
  --design-line-color: ${themes.dark ? '#323232' : '#f2f2f2'};
}`
    const style = document.createElement('style')
    style.innerHTML = vars
    document.head.appendChild(style)
  }, [theme, themes.dark, themes.primaryColor, themes.secondaryColor])
}
