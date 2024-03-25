import { createContext, useContext } from 'react'

export const defaultDesignData = {
  nodes: []
}

export const designContext = createContext({
  nodes: [],
  select: ''
})

export const useDesignContext = () => useContext(designContext)
