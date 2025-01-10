---
title: 如何编写一个前端监控 SDK
date: '2024-03-20'
spoiler: '从零开始构建一个前端监控 SDK，包括性能监控、错误捕获、用户行为追踪等核心功能'
cta: 'monitoring'
---

# 前端监控 SDK 的实现

前端监控对于现代 Web 应用来说至关重要。本文将指导您如何从零开始构建一个前端监控 SDK。

## 1. 性能监控实现

首先实现性能监控模块，用于收集页面性能指标：

```js
class PerformanceMonitor {
  collectPerformanceMetrics() {
    const performance = window.performance;
    const timing = performance.timing;

    return {
      // DNS 解析时间
      dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
      // TCP 连接时间
      tcpTime: timing.connectEnd - timing.connectStart,
      // 首字节时间
      ttfb: timing.responseStart - timing.navigationStart,
      // DOM 加载时间
      domLoadTime: timing.domContentLoadedEventEnd - timing.navigationStart,
      // 页面完全加载时间
      loadTime: timing.loadEventEnd - timing.navigationStart,
    };
  }

  // 收集关键性能指标
  collectWebVitals() {
    // FCP (First Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.reportMetric('FCP', entry.startTime);
      });
    }).observe({ entryTypes: ['paint'] });

    // LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.reportMetric('LCP', entry.startTime);
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }
}
```

## 2. 错误监控实现

错误监控模块用于捕获和上报各类错误：

```js
class ErrorMonitor {
  constructor() {
    this.setupErrorListener();
    this.setupPromiseErrorListener();
    this.setupResourceErrorListener();
  }

  private setupErrorListener() {
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });
  }

  private setupPromiseErrorListener() {
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
    });
  }

  private setupResourceErrorListener() {
    window.addEventListener('error', (event) => {
      if (event.target && (event.target instanceof HTMLImageElement ||
          event.target instanceof HTMLScriptElement ||
          event.target instanceof HTMLLinkElement)) {
        this.handleError({
          type: 'resource',
          message: `Resource load failed: ${event.target.src || event.target.href}`,
          tagName: event.target.tagName
        });
      }
    }, true);
  }
}
```

## 3. 用户行为追踪

实现用户行为追踪模块：

```js
class BehaviorMonitor {
  constructor() {
    this.setupClickTracking();
    this.setupRouteTracking();
    this.setupConsoleTracking();
  }

  private setupClickTracking() {
    window.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.trackClick({
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        path: this.getElementPath(target),
        timestamp: Date.now()
      });
    });
  }

  private setupRouteTracking() {
    // 监听路由变化
    if (typeof window !== 'undefined') {
      const originalPushState = history.pushState;
      history.pushState = function() {
        originalPushState.apply(this, arguments);
        this.trackPageView(window.location.pathname);
      };

      window.addEventListener('popstate', () => {
        this.trackPageView(window.location.pathname);
      });
    }
  }

  private setupConsoleTracking() {
    const methods = ['log', 'info', 'warn', 'error'];
    methods.forEach(method => {
      const original = console[method];
      console[method] = (...args) => {
        this.trackConsole(method, args);
        original.apply(console, args);
      };
    });
  }
}
```

## 4. 数据上报实现

实现数据上报模块，包含数据缓冲和重试机制：

```js
class Reporter {
  private buffer: any[] = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly maxBufferSize = 10;
  private readonly flushInterval = 5000; // 5秒
  private readonly maxRetries = 3;

  constructor(private reportUrl: string) {
    this.setupAutoFlush();
    this.setupBeforeUnload();
  }

  public add(data: any) {
    this.buffer.push({
      ...data,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    });

    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private async flush(retryCount = 0) {
    if (this.buffer.length === 0) return;

    const data = [...this.buffer];
    this.buffer = [];

    try {
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.reportUrl, blob);
      } else {
        await fetch(this.reportUrl, {
          method: 'POST',
          body: blob,
          keepalive: true
        });
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        setTimeout(() => {
          this.flush(retryCount + 1);
        }, 1000 * Math.pow(2, retryCount));
      } else {
        this.buffer = [...data, ...this.buffer];
        this.saveToStorage();
      }
    }
  }

  private setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }
}
```

## 5. SDK 初始化和配置

最后是 SDK 的入口文件：

```js
interface SDKConfig {
  appId: string;
  reportUrl: string;
  enablePerformance?: boolean;
  enableError?: boolean;
  enableBehavior?: boolean;
  sampleRate?: number;
  ignoreUrls?: string[];
}

class MonitoringSDK {
  private static instance: MonitoringSDK;
  private config: SDKConfig;
  private reporter: Reporter;

  private constructor(config: SDKConfig) {
    this.config = {
      sampleRate: 1,
      ...config
    };
    this.reporter = new Reporter(config.reportUrl);
    this.init();
  }

  public static getInstance(config?: SDKConfig): MonitoringSDK {
    if (!MonitoringSDK.instance && config) {
      MonitoringSDK.instance = new MonitoringSDK(config);
    }
    return MonitoringSDK.instance;
  }

  private init() {
    if (this.shouldSample()) {
      if (this.config.enablePerformance) {
        new PerformanceMonitor();
      }

      if (this.config.enableError) {
        new ErrorMonitor();
      }

      if (this.config.enableBehavior) {
        new BehaviorMonitor();
      }
    }
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate!;
  }
}
```

## 使用示例

```js
// 初始化 SDK
const sdk = MonitoringSDK.getInstance({
  appId: 'your-app-id',
  reportUrl: 'https://your-backend-api.com/collect',
  enablePerformance: true,
  enableError: true,
  enableBehavior: true,
  sampleRate: 0.1, // 采样率 10%
  ignoreUrls: ['/health', '/api/log'], // 忽略特定 URL
});
```

## 最佳实践

1. **性能优化**

   - 使用 requestIdleCallback 在浏览器空闲时处理数据
   - 实现数据缓冲和批量上报
   - 采用采样策略，避免收集过多数据

2. **可靠性保证**

   - 使用 sendBeacon 确保页面卸载时数据不丢失
   - 实现错误重试机制
   - 添加数据持久化（可选）

3. **数据安全**
   - 实现数据脱敏，避免收集敏感信息
   - 添加签名验证
   - 控制上报数据大小

## 总结

一个完善的前端监控 SDK 需要考虑：

1. 性能影响：SDK 本身不能对应用性能造成明显影响
2. 可配置性：提供灵活的配置选项
3. 可靠性：确保数据收集和上报的可靠性
4. 扩展性：便于添加新的监控维度

通过合理的架构设计和实现，我们可以构建一个既实用又高效的前端监控 SDK。
