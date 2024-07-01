---
title: react-dnd 拖拽
date: '2024-07-01'
spoiler: '拖拽组件教程'
cta: 'react'
---

### 先引入组件并套上外壳

```tsx
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

<DndProvider backend={HTML5Backend}>
  <App />
</DndProvider>;
```

这个 DndProvider 是一个上下文容器，这个 backend 是选择移动，PC 不同 DOM 的监听模式，他还有以下几种选择：

```js
react-dnd-html5-backend：用于控制 html5 事件的 backend。
react-dnd-touch-backend：用于控制移动端 touch 事件的 backend。
react-dnd-test-backend：用户可参考自定义的 backend。
```

### 把组件变成可拖拽

原生获得可拖拽能力很容易如： draggable=true，但是难的是如何监听各种事件。
在 react-dnd 里 通过 useDrag 来获得可拖拽的能力，具体使用：

```tsx
import { useDrag } from 'react-dnd';

const CustDrag: FC<CustDragProps> = ({ data }) => {
  const [{ opacity }, dragRef] = useDrag({
    type: 'Field',
    item: { ...data },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });

  return (
    <div ref={dragRef} style={{ opacity, cursor: 'move' }}>
      {data?.label}
    </div>
  );
};
```

让我们看看有哪些参数

```tsx
const [collectedProps, dragRef] = useDrag({ type, item, canDrag, collect });
```

通过 useDrag 生成的第二个参数 dragRef 指向某一个 div。此 div 将会被赋予 draggable=true 的属性，同时被拖动时所发生的所有事件都会被监听。
想要获取监听后的信息，只需要在 collect 参数里配置好即可在 collectedProps 获取到实时数据。
比如说上述的代码中，通过 monitor.isDragging() 监听到拖动的状态，并且定义一个 opacity 的属性来代表样式的透明度。
接下来看参数传递。

type: 自定义一个名称。拖动的 type 和放置的 type 保持一致。
item:参数传递。拖动时的数据能够传递到放置区。
collect: 收集监听整个拖动事件的状态数据，比如是否正在进行拖动、拖动偏移量等数据。可以通过源代码获取完整的数据。
end: 拖动结束时执行的方法。
canDrag: 指定当前是否允许拖动。若希望始终允许被拖动，则可以忽略此方法。

### 创造一个可放置的地方

```tsx
// 伪代码，省略部分重复代码
import { useDrop } from 'react-dnd';

const CustDrop: FC<CustDropProps> = ({ onChange }) => {
  const [value, setValue] = useState<any[]>([]);
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'Field',
    drop: (item) => {
      const targetValue = [...value];
      targetValue.push(item);
      setValue(targetValue);
      onChange(targetValue);
    },
    collect: (monitor) => ({
      // 是否放置在目标上
      isOver: monitor.isOver(),
      // 是否开始拖拽
      canDrop: monitor.canDrop(),
    }),
  });

  // 展示拖动时的界面效果
  const showCanDrop = () => {
    if (canDrop && !isOver && !value.length) return <div>请拖拽到此处</div>;
  };

  const delItem = (ind: number) => {
    const newValue = [...value];
    newValue.splice(ind, 1);
    setValue(newValue);
    onChange(newValue);
  };

  // 展示值
  const showValue = () => {
    return value.map((item, index: number) => {
      return (
        <div key={item?.value}>
          {item?.label} <span onClick={() => delItem(index)}>删除</span>
        </div>
      );
    });
  };

  return (
    <div
      ref={drop}
      style={{
        border: '1px solid #000',
        marginTop: '10px',
        minHeight: '200px',
        background: '#fff',
      }}
    >
      {showCanDrop()}
      {showValue()}
    </div>
  );
};
```

核心的代码是 useDrop 的使用。

accept 接收对应的对应的拖动标识。
drop 接受拖动传递过来的数据。
collect 收集拖动事件在放置区的数据。比如：是否有成功的拖动到放置区上、是否已经开始拖动，距离放置区的坐标等。并且将监听的数据传递到 useDrop 第一个参数来。

通过抛出的 isOver、canDrop 来判断用户是否正在拖拽中。

### 又可以拖又可以放

实现一个可拖拽列表，脑补一下，每个列表项既可以拖动，也可以放置。
我们面临的第一个问题，怎么实现多个 ref 绑定在一个 DOM 上：

```tsx
import { useDrop, useDrag } from 'react-dnd';

const DropItem: FC<DropItemProps> = ({ data, index, moveRow, delItem }) => {
  const subFormItemRef = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'SubFormItem',
    item: {
      index,
      type: 'SubFormItem',
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'SubFormItem',
    drop: (item: any) => {
      moveRow(item.index, index);
    },
  });

  drop(drag(subFormItemRef));

  return (
    <div style={{ display: 'flex' }}>
      <div
        ref={subFormItemRef}
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
      >
        {data?.label}
      </div>
      <span style={{ paddingLeft: '20px' }} onClick={() => delItem(index)}>
        删除
      </span>
    </div>
  );
};
```
