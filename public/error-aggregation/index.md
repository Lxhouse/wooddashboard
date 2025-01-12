---
title: '前端监控中的异常信息聚合与过滤策略'
date: '2024-03-21'
spoiler: '探讨如何在前端监控系统中实现高效的异常信息聚合与过滤，包括聚合策略、过滤机制和最佳实践'
cta: 'monitoring'
---

# 前端监控中的异常信息聚合与过滤策略

在前端监控系统中，异常信息的聚合与过滤是提升监控质量的关键。本文将分享在 IBus-Monitor 监控平台中实施的异常处理方案。

## 聚合策略

### 1. 基于异常类型和消息聚合

```ts
class ErrorAggregator {
  private errors: Record<string, ErrorInfo> = {};

  aggregate(error: ErrorInfo) {
    const key = `${error.type}:${error.message}`;

    if (!this.errors[key]) {
      this.errors[key] = { ...error, count: 1 };
    } else {
      this.errors[key].count += 1;
    }
  }

  getAggregatedErrors() {
    return Object.values(this.errors);
  }
}
```

### 2. 基于堆栈信息聚合

```ts
class StackAggregator {
  private errors: Record<string, ErrorInfo> = {};

  aggregate(error: ErrorInfo) {
    const key = this.generateStackKey(error.stack);

    if (!this.errors[key]) {
      this.errors[key] = { ...error, count: 1 };
    } else {
      this.errors[key].count += 1;
    }
  }

  private generateStackKey(stack: string) {
    // 清理和标准化堆栈信息
    return stack.replace(/:\d+:\d+/g, '');
  }
}
```

### 3. 时间窗口聚合

```ts
class TimeWindowAggregator {
  private errors: Record<string, ErrorInfo> = {};
  private readonly timeWindow = 60000; // 60s

  aggregate(error: ErrorInfo) {
    const key = `${error.type}:${error.message}`;
    const now = Date.now();

    if (
      this.errors[key] &&
      now - this.errors[key].timestamp <= this.timeWindow
    ) {
      this.errors[key].count += 1;
    } else {
      this.errors[key] = { ...error, count: 1, timestamp: now };
    }
  }
}
```

## 过滤策略

### 1. 已知错误过滤

```ts
class KnownErrorFilter {
  private readonly knownErrors = [
    'NetworkError',
    '404 Not Found',
    'Script error.',
  ];

  shouldReport(error: ErrorInfo): boolean {
    return !this.knownErrors.some(
      (known) => error.message.includes(known) || error.type.includes(known)
    );
  }
}
```

### 2. 错误阈值过滤

```ts
class ThresholdFilter {
  private readonly threshold = 5;
  private errorCounts: Record<string, number> = {};

  shouldReport(error: ErrorInfo): boolean {
    const key = `${error.type}:${error.message}`;
    this.errorCounts[key] = (this.errorCounts[key] || 0) + 1;

    return this.errorCounts[key] >= this.threshold;
  }
}
```

### 3. 用户自定义过滤

```ts
interface FilterConfig {
  userRoles?: string[];
  environments?: string[];
  browserVersions?: string[];
}

class CustomFilter {
  constructor(private config: FilterConfig) {}

  shouldReport(error: ErrorInfo, context: ErrorContext): boolean {
    if (
      this.config.userRoles &&
      !this.config.userRoles.includes(context.userRole)
    ) {
      return false;
    }

    if (
      this.config.environments &&
      !this.config.environments.includes(context.env)
    ) {
      return false;
    }

    return true;
  }
}
```

## 综合实现

将聚合和过滤策略结合使用：

```ts
class ErrorProcessor {
  private aggregator: ErrorAggregator;
  private filters: ErrorFilter[];

  constructor() {
    this.aggregator = new ErrorAggregator();
    this.filters = [
      new KnownErrorFilter(),
      new ThresholdFilter(),
      new CustomFilter({
        userRoles: ['admin', 'developer'],
        environments: ['production'],
      }),
    ];
  }

  process(error: ErrorInfo, context: ErrorContext) {
    // 1. 应用过滤器
    const shouldReport = this.filters.every((filter) =>
      filter.shouldReport(error, context)
    );

    if (!shouldReport) {
      return;
    }

    // 2. 聚合错误
    this.aggregator.aggregate(error);

    // 3. 检查是否需要上报
    const aggregated = this.aggregator.getAggregatedErrors();
    if (this.shouldUpload(aggregated)) {
      this.upload(aggregated);
    }
  }

  private shouldUpload(errors: ErrorInfo[]): boolean {
    // 实现上报策略
    return true;
  }

  private upload(errors: ErrorInfo[]) {
    // 实现上报逻辑
  }
}
```

## 最佳实践

1. **聚合策略**

   - 根据错误类型和消息进行基础聚合
   - 使用堆栈信息进行精确聚合
   - 实现时间窗口聚合减少上报频率

2. **过滤机制**

   - 过滤已知的无害错误
   - 设置合理的错误阈值
   - 支持灵活的自定义过滤规则

3. **性能优化**
   - 使用高效的数据结构存储错误信息
   - 实现定期清理过期数据
   - 批量处理和上报错误

## 总结

合理的异常信息聚合与过滤可以：

- 减少数据冗余
- 提高监控质量
- 降低服务器压力
- 提升错误分析效率

通过这些策略的组合使用，我们可以构建一个更加高效和可靠的前端监控系统。
