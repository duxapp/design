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

## <a name='feature'></a>特点

- 发布到npm市场，可以很方便的将他集成到你的项目中。
- 你可以方便的编写一个组件在这个编辑器中运行，或者将你现有的组件经过简单修改运行在编辑器中。
- 编辑后的数据同时支持小程序、H5、React Native，需在Taro3的项目中使用。
- 组件样式遵循以React Native样式为基础的Flex布局，可以同时给设计师和开发人员使用。
- 导出为React组件后，可以继续进行二次开发。
- 模板市场给你提供了存储和使用模板的功能，你可以通过公开的模板快速创建页面，你也可以根据自己的需求创建模板。

## <a name='principle'></a>运行原理

你编辑的后的数据以json的方式运行和存储，下面的示例将一个text组件嵌套在一个view组件的json。
```json
[
  {
    "child": [
      {
        "style": {},
        "text": "文本内容",
        "nodeName": "text",
        "key": "2e0l1-19tg00",
        "child": []
      }
    ],
    "style": {},
    "nodeName": "view",
    "key": "2e0l1VzIiw00"
  }
]
```
对应的JSX代码如下，这些组件并不是原生的Taro组件，而是经过封装的，所以你看到下面的`Text`组件的文本并不是这样：`<Text>文本内容<Text>`，而是将文本内容赋值在其text属性上，其他组件的结构也大体如此。
```jsx
<View>
  <Text text='文本内容' />
</View>
```

## <a name='example'></a>在线体验

线上体验地址暂未发布

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
import { Design, ComponentList, Editor, Layer, Attr, defineComponentConfigs } from '@/design/components/Design'
import { defineComponents } from '@/design'
import * as form from '@/duxuiDesign/components/form'
import * as layout from '@/duxuiDesign/components/layout'
import * as show from '@/duxuiDesign/components/show'
import '../../../theme.scss'

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
    375: 2,
    640: 2.34 / 2,
    750: process.env.TARO_ENV === 'h5' ? 640 / 750 : 1,
    828: 1.81 / 2
  }
})

export default function DuxDesign(props) {

  return <Design {...props}>
    <Row grow justify='between' className='design-page'>
      <ComponentList />
      <Editor />
      <Column className='attr-layer'>
        <Layer />
        <Attr />
      </Column>
    </Row>
  </Design>
}
```
  
注意 编辑器仅支持编译成h5使用，请勿在小程序或者app端调用，以及所有从 `@/design/components/Design` 导出的函数和组件都一样。

- 渲染模式使用示例

```jsx
import { TopView, Create } from '@/design'

export default () => {
  return <TopView>
    <Create nodes={[]} />
  </TopView>
}
```

- 使用提示  
不论是编辑模式还是渲染模式都请将 `TopView` 组件放在最外层，否则会导致样式错乱，弹窗无法使用

## <a name='group'></a>交流群

816711392
