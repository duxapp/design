# design

一个简单易用，方便扩展和集成的移动端页面编辑器。  
* [安装](#install)
* [特点](#feature)
* [运行原理](#principle)
* [在线体验](#example)
* [快捷键支持](#hot-key)
* [使用](#use)
* [交流群](#group)

## <a name='install'></a>安装

```bash
yarn duxapp app add design
```
此模块需要在 [duxapp 框架](https://app.docs.dux.plus) 中运行

此模块只包含了编辑器的核心代码，如果你需要开箱即用，可以安装 `designExample` 模块

```bash
yarn duxapp app add designExample
```

然后运行下面的命令，即可查看到效果
```bash
yarn dev:h5 --app=designExample
```

## <a name='feature'></a>特点

- 你可以方便的编写一个组件在这个编辑器中运行，或者将你现有的组件经过简单修改运行在编辑器中。
- 编辑后的数据同时支持小程序、H5、React Native，需在Taro3的项目中使用。
- 组件样式遵循以React Native样式为基础的Flex布局，可以同时给设计师和开发人员使用。
- 导出为React组件后，可以继续进行二次开发。
- 提供模板导入组件，添加模板和模板管理功能需要您进行后续开发
- 默认提供导出代码组件，您需要手动添加支持，比如在节点右键菜单上

## <a name='principle'></a>运行原理

你编辑的后的数据以json的方式运行和存储，下面的示例将一个text组件嵌套在一个view组件的json。
```json
[
  {
    "child": [
      {
        "attr": {
          "style": {},
          "children": "文本内容"
        },
        "tag": "Text",
        "key": "2e0l1-19tg00",
        "child": []
      }
    ],
    "attr": {
      "style": {}
    },
    "tag": "Column",
    "key": "2e0l1VzIiw00"
  }
]
```
对应的JSX代码如下
```jsx
<Column>
  <Text>文本内容</Text>
</Column>
```

## <a name='example'></a>在线体验

[https://design.duxapp.cn/](https://design.duxapp.cn/)

- 体验地址中的模板相关功能需要自行实现

## <a name='hot-key'></a>快捷键支持

ctrl + z 撤销操作  
ctrl + shift + z 恢复操作  
ctrl + c 复制节点  
ctrl + v 粘贴节点  
delete 删除节点

## <a name='use'></a>使用

- 编辑器使用示例

```jsx
import Taro from '@tarojs/taro'
import { Column, Row } from '@/duxui'
import { Design, ComponentList, Editor, Layer, Attr, defineComponentConfigs } from '@/design/Design'
import { defineComponents } from '@/design'
import { getMedia } from '@/duxapp/utils/net/util'
import * as form from '@/duxuiDesign/components/form/config'
import * as layout from '@/duxuiDesign/components/layout/config'
import * as show from '@/duxuiDesign/components/show/config'
import '../../../theme.scss'
import '../../../app.scss'

import './index.scss'

defineComponents({
  ...layout.comps,
  ...form.comps,
  ...show.comps,
})

defineComponentConfigs({
  ...layout.config,
  ...form.config,
  ...show.config,
})

Taro.initPxTransform({
  designWidth: 375,
  deviceRatio: {
    375: 1.25
  }
})

export default function DuxDesign({ config, ...props }) {

  return <Design config={{ ...defaultConfig, ...config }} {...props}>
    <Row grow justify='between' className='design-page'>
      <ComponentList />
      <div className='center'>
        <div className='editor'>
          <div className='phone'>
            <Editor />
          </div>
        </div>
      </div>
      <Column className='attr-layer'>
        <Layer />
        <Attr />
      </Column>
    </Row>
  </Design>
}

const defaultConfig = {
  upload: async (type, option) => {
    const res = await getMedia(type, option)
    return res.map(item => item.path)
  },
  theme: {
    dark: false,
  },
  link: [

  ]
}

```
  
注意 编辑器仅支持编译成h5使用，请勿在小程序或者app端调用，以及所有从 `@/design/Design` 导出的函数和组件都一样。

- 渲染模式使用示例

```jsx
import { TopView, Render } from '@/design'

export default function PageName() {
  return <TopView>
    <Render nodes={[]} />
  </TopView>
}
```

## 将组件添加到编辑器使用

关于此部分的内容可查看 `designExample` 模块 

## <a name='group'></a>交流群

816711392
