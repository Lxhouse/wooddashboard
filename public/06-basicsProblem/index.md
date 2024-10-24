---
title: 基础的手写题
date: '2024-10-24'
spoiler: '基础的JS手写题必须会'
cta: 'JS'
---

#### 实现 instanceof

instanceof 是 JavaScript 中用于判断一个对象是否是某个构造函数的实例的操作符

```js
function _instanceof(left, right) {
  // 检查 left 是否是非空对象
  if (typeof left !== 'object' || left === null) {
    return false;
  }

  // 检查 right 是否是函数
  if (typeof right !== 'function') {
    throw new Error('right-hand must be a Function');
  }

  // 获取 left 的原型链
  let lp = Object.getPrototypeOf(left);

  // 获取 right 的原型对象
  const rp = right.prototype;

  // 遍历原型链
  while (lp) {
    if (lp === rp) {
      return true;
    }
    lp = Object.getPrototypeOf(lp);
  }

  return false;
}

// 测试
function Person() {}
const person = new Person();

console.log(_instanceof(person, Person)); // true
console.log(_instanceof(person, Object)); // true
console.log(_instanceof(person, Array)); // false
```

#### 实现 new

new 操作符在 JavaScript 中用于创建一个构造函数的实例

```js
function _new(constructor, ...args) {
  // 1. 创建一个以 constructor.prototype 为原型的新对象
  const obj = Object.create(constructor.prototype);

  // 2. 调用构造函数，并将 this 绑定到新创建的对象上
  const result = constructor.apply(obj, args);

  // 3. 如果构造函数返回一个对象类型，则返回该对象；否则返回新创建的对象
  return typeof result === 'object' && result !== null ? result : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const person = _new(Person, 'Alice', 30);

console.log(person); // Person { name: 'Alice', age: 30 }
console.log(person instanceof Person); // true
```

#### 实现 call

将函数临时添加到指定的上下文对象上执行，并在执行后删除该临时属性，从而改变函数的 this 指向。

```js
Function.prototype._call = function (context, ...args) {
  // 如果 context 是 null 或 undefined，使用 globalThis（全局对象）
  const _context = context || globalThis;

  // 生成一个唯一的 Symbol 作为临时属性的 key，避免覆盖已有属性
  const key = Symbol('key');

  // 将当前函数（this）赋给 _context[key] 临时属性
  _context[key] = this;

  // 调用函数并传递参数
  const result = _context[key](...args);

  // 删除临时属性
  delete _context[key];

  // 返回函数执行结果
  return result;
};

// 测试
const person = {
  name: 'Alice',
};

function greet(greeting) {
  console.log(`${greeting}, my name is ${this.name}`);
}

greet._call(person, 'Hello'); // Hello, my name is Alice
```

#### 实现 apply

将函数临时添加到指定上下文对象上，通过展开数组传递参数执行函数，并在执行后删除该临时属

```js
Function.prototype._apply = function (context, args = []) {
  const _context = context || globalThis;

  // 使用正确的 Symbol 语法
  const key = Symbol('key');

  // 将当前函数（this）赋给 _context 的临时属性
  _context[key] = this;

  // 展开参数数组并调用函数
  const result = _context[key](...args);

  // 删除临时属性
  delete _context[key];

  // 返回结果
  return result;
};
const person = {
  name: 'Alice',
};

function greet(greeting, punctuation) {
  console.log(`${greeting}, my name is ${this.name}${punctuation}`);
}

greet._apply(person, ['Hello', '!']); // Hello, my name is Alice!
```

#### 实现 bind

通过返回一个闭包函数，在普通调用时绑定指定的 this 和参数，而在构造函数调用时忽略绑定的 this，并使用 new 创建新实例。

```js
Function.prototype._bind = function (context, ...args) {
  const _this = this; // 保存原函数
  const _context = context || globalThis; // 如果没有 context，使用全局对象

  return function FN(...innerArgs) {
    // 如果通过 `new` 调用，`this` 是新创建的实例，忽略 context
    if (this instanceof FN) {
      return new _this(...args, ...innerArgs); // 使用 new 调用构造函数
    } else {
      return _this.apply(_context, [...args, ...innerArgs]); // 直接调用函数并绑定 context
    }
  };
};
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const boundPerson = Person._bind(null, 'Alice');
const alice = new boundPerson(30);

console.log(alice.name); // Alice
console.log(alice.age); // 30
```

#### 实现 debounce

实现防抖函数的思路是使用定时器来延迟执行目标函数，每次调用时清除之前的定时器，确保只有在最后一次调用后经过指定时间，目标函数才会执行。

```js
function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    const _this = this;

    // 取消之前的定时器
    if (timer) clearTimeout(timer);

    // 设置新的定时器
    timer = setTimeout(() => {
      fn.apply(_this, args);
    }, wait);
  };
}
```

#### 实现 throttle

```js
function throttle(fn, wait) {
  let timer = null;

  return function (...args) {
    const _this = this;

    // 如果定时器已存在，则直接返回
    if (timer) return;

    // 设置新的定时器
    timer = setTimeout(() => {
      fn.apply(_this, args); // 执行目标函数
      timer = null; // 清除定时器
    }, wait);
  };
}
```

#### 实现 async

实现 \_async 函数的思路是通过包装生成器函数，利用生成器的 next 和 throw 方法控制异步执行流程，并通过 Promise 处理异步结果和异常

```js
function _async(generator) {
  return function (...args) {
    const gen = generator.apply(this, args); // 创建生成器实例
    return new Promise((resolve, reject) => {
      function step(key, args) {
        let gResult;

        try {
          gResult = gen[key](args); // 调用生成器的 next/throw 方法
        } catch (error) {
          return reject(error); // 捕获生成器内的同步异常
        }

        const { value, done } = gResult; // 解构结果

        if (done) {
          return resolve(value); // 生成器完成，解析 Promise
        }

        // 处理异步值，确保 value 是 Promise
        Promise.resolve(value)
          .then(
            (v) => step('next', v),
            (e) => step('throw', e)
          )
          .catch(reject); // 捕获并拒绝任何 Promise 中的异常
      }

      step('next'); // 开始执行生成器
    });
  };
}
// 示例生成器函数
function* exampleGenerator() {
  const result1 = yield new Promise((resolve) =>
    setTimeout(() => resolve(1), 1000)
  );
  const result2 = yield new Promise((resolve) =>
    setTimeout(() => resolve(result1 + 2), 1000)
  );
  return result2 + 3;
}

// 使用 _async 将生成器函数转换为异步函数
const asyncExample = _async(exampleGenerator);

// 测试异步函数
asyncExample()
  .then(console.log) // 2 秒后输出 6
  .catch(console.error);
```

#### 浅拷贝

```js
function shallowCopy(value) {
  if (typeof value !== 'object' || value === null) {
    return value; // 返回原始值
  } else {
    const obj = Object.create(Object.getPrototypeOf(value)); // 创建新对象并继承原型
    const names = Object.getOwnPropertyNames(value); // 获取所有属性名
    const symbols = Object.getOwnPropertySymbols(value); // 获取所有 Symbol 属性

    for (let key of names) {
      obj[key] = value[key]; // 复制普通属性
    }

    for (let sym of symbols) {
      obj[sym] = value[sym]; // 复制 Symbol 属性
    }

    return obj; // 返回新对象
  }
}
```

#### 深拷贝

```js
// 基础版
const deepClone = (target, cache = new WeakMap()) => {
  if (target === null || typeof target !== 'object') {
    return target;
  }
  if (cache.has(target)) {
    return cache.get(target);
  }
  const copy = Array.isArray(target) ? [] : {};
  cache.set(target, copy);

  Object.keys(target).forEach(
    (key) => (copy[key] = deepClone(target[key], cache))
  );

  return copy;
};
// 进阶版 多类型判断

const deepCloneUp = (target, cache = new WeakMap()) => {
  // 如果 target 是 null 或者不是对象，直接返回 target
  if (target === null || typeof target !== 'object') {
    return target;
  }

  // 处理循环引用
  if (cache.has(target)) {
    return cache.get(target);
  }

  // 处理特殊对象
  if (target instanceof Date) {
    return new Date(target.getTime());
  }
  if (target instanceof RegExp) {
    return new RegExp(target.source, target.flags);
  }
  if (target instanceof Map) {
    const mapCopy = new Map();
    cache.set(target, mapCopy);
    target.forEach((value, key) => {
      mapCopy.set(deepClone(key, cache), deepClone(value, cache));
    });
    return mapCopy;
  }
  if (target instanceof Set) {
    const setCopy = new Set();
    cache.set(target, setCopy);
    target.forEach((value) => {
      setCopy.add(deepClone(value, cache));
    });
    return setCopy;
  }

  // 处理普通对象
  const copy = Array.isArray(target)
    ? []
    : Object.create(Object.getPrototypeOf(target));
  cache.set(target, copy);

  // 复制属性，包括不可枚举属性和符号属性
  Reflect.ownKeys(target).forEach((key) => {
    copy[key] = deepClone(target[key], cache);
  });

  return copy;
};
```

#### 发布订阅者模式

```js
class Emitter {
  // 存储事件及其对应的回调函数
  #handler = {};

  // 订阅事件
  $on(event, callBack) {
    // 如果事件尚未注册，初始化为一个空数组
    if (!this.#handler[event]) {
      this.#handler[event] = [];
    }
    // 将回调函数添加到事件的回调列表中
    this.#handler[event].push(callBack);
  }

  // 发布事件
  $emit(event, ...args) {
    // 获取事件对应的回调函数列表
    const funcs = this.#handler[event];
    // 如果存在回调函数列表，则依次调用每个回调
    if (Array.isArray(funcs)) {
      funcs.forEach((f) => f(...args));
    }
  }

  // 取消订阅事件
  $off(event, callBack) {
    // 如果事件不存在，直接返回
    if (!this.#handler[event]) return;

    // 如果未传递回调函数，删除整个事件
    if (!callBack) {
      delete this.#handler[event];
    } else {
      // 否则，过滤掉指定的回调函数
      this.#handler[event] = this.#handler[event].filter((e) => e !== callBack);
    }
  }

  // 订阅一次性事件
  $once(event, callBack) {
    // 创建一个包装函数，调用后自动取消订阅
    const onceEvent = (...args) => {
      callBack(...args); // 执行原回调
      this.$off(event, onceEvent); // 取消订阅
    };
    // 订阅该包装函数
    this.$on(event, onceEvent);
  }
}
```

#### 可迭代对象

```js
function range(start, end) {
  return {
    [Symbol.iterator]: function () {
      let current = start; // 当前值初始化为起始值

      return {
        next: () => {
          if (current < end) {
            return { value: current++, done: false }; // 返回当前值并递增
          } else {
            return { done: true }; // 迭代结束
          }
        },
      };
    },
  };
}

// 使用自定义的可迭代对象
for (const num of range(1, 5)) {
  console.log(num); // 输出: 1, 2, 3, 4
}
```
