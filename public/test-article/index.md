---
title: 这是一篇测试文章
date: '2024-06-26'
spoiler: '我的语言的限制就是我的世界的限制。'
cta: 'react'
---

这是一篇测试中文能否正常显示的文章：

```js
export function AlertModule() {
  return (
    <button
      className="bg-cyan-500 text-white p-2 border border-white rounded-md hover:cursor-pointer"
      onClick={() => alert('哦吼？ 你点击了？')}
    >
      这是一个外部引入的按钮
    </button>
  );
}
```

下面这个是外部引入的组件 ：

<p>
  <AlertModule />
</p>
