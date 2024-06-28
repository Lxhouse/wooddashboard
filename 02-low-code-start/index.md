---
title: 低代码开发初始
date: '2024-06-28'
spoiler: '记录一些关于低代码开发过程中的内容'
cta: 'react'
---

### 开发方法记录

#### 根据类型多组件渲染

```tsx
const components: IComponent[] = [
  {
    id: '2',
    name: 'Space',
    props: {
      className: 'ml-10',
      size: 'large',
    },
    children: [
      {
        id: '3',
        name: 'Button',
        props: {
          type: 'primary',
          children: '按钮1',
        },
      },
      {
        id: '4',
        name: 'Button',
        props: {
          type: 'primary',
          children: '按钮2',
        },
      },
    ],
  },
];
const ComponentMap: Record<string, React.ElementType> = {
  Button,
  Space,
};
const renderComponents = (components: IComponent[]): React.ReactNode => {
  return components.map((component) => {
    const ComponentType = ComponentMap[component.name];
    if (!ComponentType) return null;
    return React.createElement(
      ComponentType,
      component.props,
      component.props.children || renderComponents(component.children || [])
    );
  });
};
```
