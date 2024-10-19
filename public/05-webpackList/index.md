---
title: webpack的一些知识点
date: '2024-10-19'
spoiler: '读双越课总结'
cta: 'webpack'
---

### 初始化 webpack

1. 新建一个文件夹
2. npm init -y
3. npm install webpack webpack-cli -D

### 配置多入口

1. 找到对应的 entry 设置多个入口文件 {page1:'./src/1.js',page2:'./src/2.js'}
2. 在 output 中设置 filename: '[name].[contenthash].js', // 根据入口名称生成文件名
3. HtmlWebpackPlugin 设置多个打包产物（template，filename，chunks）

```js
plugins: [
  new HtmlWebpackPlugin({
    template: './src/index.html',
    filename: 'index.html',
    chunks: ['page1', 'page2'],
  }),
],
```

### 抽离 css 变量

1. 安装 miniCssExtractPlugin
2. 在 loader 里面 最后一步 使用 miniCssExtractPlugin.loader
3. 在 plugins 里面 使用

```js
new MiniCssExtractPlugin({ filename: 'css/main.[contenthash:8].css' });
```

4. 压缩 css

```js
optimization: {
  minimizer: [new TerserPlugin(), new OptimizeCssAssetsPlugin()],
}
```

### 提取共享依赖

```js
// 1. 在配置中增加
optimization: {
  splitChunks: {
    chunks: 'all';
    cacheGroups: {
      vendor: {
        name: 'vendor';
        priority: 1;
        test: /node_modules/;
        size: 0;
        minChunks: 1;
      }
      common: {
        name: 'common';
        priority: 0;
        size: 0;
        minChunks: 2;
      }
    }
  }
}
```

### 懒加载（默认支持）

1. import('./module.js')

### module chunk bundle

1. module 模块，webpack 中所有可以被引用的文件
2. chunk 多模块的组合（在 entry ，splitChunk，import）
3. bundle 最终的输出文件

### 优化构建速度

#### 优化 loader

1. 在 babel-loader 的 use 里面开启缓存 ，use:['babel-loader?cacheDirectory']
2. 用 include 或者 exclude 来圈选范围

#### ignorePlugin 和 noParse

1. ignorePlugin

```js
const webpack = require('webpack');

module.exports = {
  plugins: [
    // 忽略 moment 的所有本地化文件
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/, // 匹配需要忽略的模块
      contextRegExp: /moment$/, // 限定在 moment 库中
    }),
  ],
};
```

2. noParse

```js
module.exports = {
  module: {
    rules: [
      // 其他规则...
    ],
    noParse: /jquery|lodash/, // 跳过对 jQuery 和 Lodash 的解析
  },
};
```

3. 一个是直接不引入，一个跳过解析

#### happypack 和 parallelUglifyPlugin

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'happypack/loader?id=js',
      },
      {
        test: /\.css$/,
        use: 'happypack/loader?id=css',
      },
    ],
  },
  plugins: [
    new HappyPack({
      id: 'js',
      loaders: ['babel-loader'],
    }),
    new HappyPack({
      id: 'css',
      loaders: ['style-loader', 'css-loader'],
    }),
  ],
};
```

```js
//npm install webpack-parallel-uglify-plugin --save-dev
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = {
  // 其他配置...
  plugins: [
    new ParallelUglifyPlugin({
      uglifyJS: {
        output: {
          beautify: false, // 不需要格式化
          comments: false, // 移除注释
        },
        compress: {
          warnings: false, // 压缩时不输出警告
          drop_console: true, // 删除所有的 `console` 语句
        },
      },
    }),
  ],
};
```

总结： 开启多进程打包和压缩，最好在大项目里使用，才会有效果

#### DllPlugin

1.

#### 自动刷新

1. 有个 watch 和 watchOptions 的配置
2. 但是用 webpack-dev-server 回自己自动刷新

### 优化打包产物

1. 小图片用 base64 存
2. bundle 加 hash
3. 懒加载
4. 提取公共代码
5. IgnorePlugin
6. CDN 加速

#### scope Hosting （ModuleConcatenationPlugin）

ModuleConcatenationPlugin 是 Webpack 中的一个优化插件，它用于启用模块连接（Scope Hoisting），可以减少最终打包文件的大小并提高运行时性能。这个插件通过将多个模块合并为一个闭包，减少了模块之间的函数调用开销。

### babel

1. 通过 preset 来先用上一堆插件
2. babel-polyfill 用来解决版本兼容问题（core-js+regenerator）
3. babel-runtime 避免 polyfill 污染全局变量

### 面试题目

#### 为什么要打包构建

1. 体积更小
2. 编译高级语言语法
3. 兼容性和错误提示
4. 统一高效的开发环境
5. 统一的构建流程和产出标准
6. 集成公司的构建规范（提测，上线）

#### 如何产出一个 lib

在 output 增加一个 library
