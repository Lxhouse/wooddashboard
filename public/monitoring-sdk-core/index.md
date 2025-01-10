---
title: 监控 SDK 内核实现原理
date: '2024-03-21'
spoiler: '深入探讨前端监控 SDK 的内核实现原理，包括事件总线、插件系统、数据处理管道等核心概念'
cta: 'monitoring'
---

# 监控 SDK 内核实现原理

本文将深入探讨前端监控 SDK 的内核实现原理，重点关注核心架构设计。

## 1. 事件总线实现

事件总线是 SDK 的核心，负责事件的发布和订阅：

```ts
type EventHandler = (...args: any[]) => void;

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  // 订阅事件
  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  // 取消订阅
  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  // 发布事件
  emit(event: string, ...args: any[]): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // 只订阅一次
  once(event: string, handler: EventHandler): void {
    const onceHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }
}
```

## 2. 插件系统实现

插件系统允许 SDK 以模块化方式扩展功能：

```ts
interface Plugin {
  name: string;
  init?: (sdk: SDK) => void;
  destroy?: () => void;
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  // 注册插件
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }

    this.plugins.set(plugin.name, plugin);
    if (plugin.init) {
      plugin.init(this.sdk);
    }
  }

  // 卸载插件
  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      if (plugin.destroy) {
        plugin.destroy();
      }
      this.plugins.delete(pluginName);
    }
  }

  // 获取插件实例
  getPlugin(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName);
  }
}
```

## 3. 数据处理管道

实现数据处理管道，用于数据的转换和过滤：

```ts
interface PipelineStep {
  name: string;
  process: (data: any) => Promise<any>;
}

class Pipeline {
  private steps: PipelineStep[] = [];

  // 添加处理步骤
  addStep(step: PipelineStep): void {
    this.steps.push(step);
  }

  // 移除处理步骤
  removeStep(stepName: string): void {
    this.steps = this.steps.filter((step) => step.name !== stepName);
  }

  // 执行管道处理
  async process(data: any): Promise<any> {
    let result = data;

    for (const step of this.steps) {
      try {
        result = await step.process(result);
        if (result === null) {
          return null; // 终止管道
        }
      } catch (error) {
        console.error(`Error in pipeline step ${step.name}:`, error);
        throw error;
      }
    }

    return result;
  }
}
```

## 4. 配置管理系统

实现灵活的配置管理：

```ts
interface Config {
  appId: string;
  reportUrl: string;
  plugins?: string[];
  sampling?: {
    rate: number;
    rules?: Array<{
      pattern: string;
      rate: number;
    }>;
  };
  transport?: {
    batch: boolean;
    size: number;
    interval: number;
  };
}

class ConfigManager {
  private config: Config;
  private defaults: Partial<Config> = {
    sampling: {
      rate: 1,
    },
    transport: {
      batch: true,
      size: 10,
      interval: 5000,
    },
  };

  constructor(userConfig: Partial<Config>) {
    this.config = this.mergeConfig(this.defaults, userConfig);
    this.validateConfig();
  }

  private mergeConfig(
    defaults: Partial<Config>,
    userConfig: Partial<Config>
  ): Config {
    return {
      ...defaults,
      ...userConfig,
      sampling: {
        ...defaults.sampling,
        ...userConfig.sampling,
      },
      transport: {
        ...defaults.transport,
        ...userConfig.transport,
      },
    } as Config;
  }

  private validateConfig(): void {
    if (!this.config.appId) {
      throw new Error('appId is required');
    }
    if (!this.config.reportUrl) {
      throw new Error('reportUrl is required');
    }
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }
}
```

## 5. SDK 核心类

将所有组件整合到核心类中：

```ts
class SDK {
  private eventBus: EventBus;
  private pluginManager: PluginManager;
  private pipeline: Pipeline;
  private configManager: ConfigManager;
  private static instance: SDK;

  private constructor(config: Partial<Config>) {
    this.eventBus = new EventBus();
    this.configManager = new ConfigManager(config);
    this.pluginManager = new PluginManager(this);
    this.pipeline = new Pipeline();

    this.init();
  }

  static getInstance(config?: Partial<Config>): SDK {
    if (!SDK.instance && config) {
      SDK.instance = new SDK(config);
    }
    return SDK.instance;
  }

  private init(): void {
    // 初始化内置插件
    this.initializeBuiltinPlugins();

    // 初始化数据处理管道
    this.initializePipeline();

    // 设置全局错误捕获
    this.setupGlobalErrorHandling();
  }

  private initializeBuiltinPlugins(): void {
    // 注册内置插件
    const builtinPlugins = [
      new PerformancePlugin(),
      new ErrorPlugin(),
      new NetworkPlugin(),
    ];

    builtinPlugins.forEach((plugin) => {
      this.pluginManager.register(plugin);
    });
  }

  private initializePipeline(): void {
    // 添加默认的数据处理步骤
    this.pipeline.addStep({
      name: 'sampling',
      process: async (data) => {
        const samplingRate = this.configManager.get('sampling')!.rate;
        return Math.random() < samplingRate ? data : null;
      },
    });

    this.pipeline.addStep({
      name: 'enrichment',
      process: async (data) => ({
        ...data,
        timestamp: Date.now(),
        appId: this.configManager.get('appId'),
      }),
    });
  }

  private setupGlobalErrorHandling(): void {
    window.onerror = (message, source, lineno, colno, error) => {
      this.trackError({
        type: 'js',
        message,
        source,
        lineno,
        colno,
        error: error?.stack,
      });
    };

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        error: event.reason?.stack,
      });
    });
  }

  // 公共 API
  track(event: string, data: any): void {
    this.pipeline.process(data).then((processedData) => {
      if (processedData) {
        this.eventBus.emit(event, processedData);
      }
    });
  }

  trackError(error: any): void {
    this.track('error', error);
  }

  use(plugin: Plugin): void {
    this.pluginManager.register(plugin);
  }
}
```

## 使用示例

```ts
// 初始化 SDK
const sdk = SDK.getInstance({
  appId: 'your-app-id',
  reportUrl: 'https://api.example.com/collect',
  sampling: {
    rate: 0.1, // 采样率 10%
    rules: [
      { pattern: '/api/critical/*', rate: 1 }, // 关键接口 100% 采集
    ],
  },
  transport: {
    batch: true,
    size: 10,
    interval: 5000,
  },
});

// 自定义插件示例
const customPlugin: Plugin = {
  name: 'custom-plugin',
  init: (sdk) => {
    sdk.track('plugin-initialized', { name: 'custom-plugin' });
  },
  destroy: () => {
    console.log('Plugin destroyed');
  },
};

sdk.use(customPlugin);
```

## 总结

监控 SDK 的内核实现需要考虑以下关键点：

1. **模块化设计**：使用事件总线和插件系统实现功能解耦
2. **可扩展性**：通过插件系统支持功能扩展
3. **数据处理**：使用管道模式处理数据转换和过滤
4. **配置灵活**：支持丰富的配置选项和默认值
5. **错误处理**：完善的错误捕获和处理机制
6. **性能优化**：采样控制、批量上报等优化策略

通过这种架构设计，我们可以构建一个既灵活又可靠的监控 SDK 内核。
