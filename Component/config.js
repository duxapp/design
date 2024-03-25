import * as comps from './index'

import './icon.scss'

export const DataBind = {
  name: '数据绑定',
  tag: 'DataBind',
  icon: ['design', 'data-bind'],
  cate: '数据',
  attr: () => {
    return {

    }
  },
  attrForm: ({ hover, comp }) => {
    const childTag = hover.child?.[0]?.tag

    if (!childTag) {
      return {}
    }

    const childConfig = comp.getConfig(childTag).attrForm()

    const disabled = ['style', 'className']

    const options = Object.keys(childConfig).map(value => {
      if (disabled.includes(value)) {
        return
      }
      return {
        name: childConfig[value].name || value,
        value
      }
    }).filter(v => v)

    return {
      bind: {
        __objectArray: {
          name: '绑定关系'
        },
        s: {
          name: '来源字段',
          type: 'text'
        },
        t: {
          name: '目标属性',
          type: 'select',
          props: {
            options
          }
        }
      }
    }
  },
  child: {
    max: 1
  },
  import: '@/design'
}

export const DataList = {
  name: '数据列表',
  tag: 'DataList',
  icon: ['design', 'data-list'],
  cate: '数据',
  attr: () => {
    return {

    }
  },
  attrForm: () => {
    return {
      listField: {
        name: '列表数据字段名',
        type: 'text'
      },
      keyField: {
        name: '列表主键字段名',
        type: 'text'
      }
    }
  },
  child: {
    max: 1
  },
  import: '@/design'
}

export const Icon = {
  name: '图标',
  tag: 'Icon',
  icon: ['design', 'icon'],
  cate: '展示',
  attr: () => {
    return {

    }
  },
  attrForm: () => {
    return {
      name: {
        name: '图标',
        type: 'icon'
      },
      size: {
        name: '尺寸',
        type: 'size'
      },
      color: {
        name: '颜色',
        type: 'color'
      }
    }
  },
  import: '@/design'
}

export { comps }

export const config = {
  DataBind,
  DataList,
  Icon
}
