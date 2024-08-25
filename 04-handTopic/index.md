---
title: 手写题
date: '2024-08-25'
spoiler: '会持续更新的手写题列表'
cta: 'react'
---

### 20240825

#### 1. 手写实现 instanceof

```js
/**
 * 实现自定义的 `instanceof` 操作符功能。
 *
 * 该函数检查对象 `left` 是否是构造函数 `right` 的实例。
 *
 * @param {Object} left - 要检查的对象。
 * @param {Function} right - 构造函数，通常是一个类或构造函数。
 * @returns {boolean} - 如果 `left` 是 `right` 的实例，返回 `true`；否则，返回 `false`。
 *
 * 示例：
 *
 * function Animal() {}
 * function Dog() {}
 * Dog.prototype = Object.create(Animal.prototype);
 *
 * const d = new Dog();
 * console.log(instanceOfFn(d, Dog)); // true
 * console.log(instanceOfFn(d, Animal)); // true
 * console.log(instanceOfFn(d, Object)); // true
 * console.log(instanceOfFn(d, Array)); // false
 * console.log(instanceOfFn({}, Object)); // true
 * console.log(instanceOfFn([], Array)); // true
 * console.log(instanceOfFn([], Object)); // true
 * console.log(instanceOfFn(null, Object)); // false
 * console.log(instanceOfFn(1, Object)); // false
 */
function instanceOfFn(left, right) {
  // 如果左侧的对象为 null 或者不是对象类型，返回 false
  if (left === null || typeof left !== 'object') return false;

  // 获取右侧构造函数的 prototype 对象
  let rightP = right.prototype;

  // 获取左侧对象的 prototype 对象
  let leftP = Object.getPrototypeOf(left);

  // 循环检查左侧对象的原型链
  while (leftP !== null) {
    if (leftP === rightP) {
      return true; // 找到匹配的原型链
    }
    leftP = Object.getPrototypeOf(leftP); // 向上查找原型链
  }

  // 未找到匹配的原型链，返回 false
  return false;
}
```
