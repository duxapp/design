import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import dark from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus'
import light from 'react-syntax-highlighter/dist/esm/styles/prism/one-light'
import { useDesignContext } from '../utils'

import './common.scss'

SyntaxHighlighter.registerLanguage('jsx', jsx)

export const Code = ({ language, code }) => {

  const { config } = useDesignContext()

  const isDark = config.theme?.dark

  return <SyntaxHighlighter className='ExportCode' language={language} style={isDark ? dark : light}>
    {code}
  </SyntaxHighlighter>
}
