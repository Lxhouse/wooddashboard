---
title: '从一次线上事故说起：如何打造前端错误追踪与工单自动化'
date: '2024-03-21'
spoiler: '分享如何通过 Git Blame、钉钉通知和工单系统联动，构建一套完整的前端错误追踪与处理流程'
cta: 'monitoring'
---

# 从一次线上事故说起：如何打造前端错误追踪与工单自动化

还记得那是一个平常的周四下午，正当我准备喝杯咖啡时，监控系统突然报警：线上环境出现大量 JS 错误。作为监控平台负责人，我深知问题的严重性。但更让我困扰的是：

1. 这个错误是谁引入的？
2. 如何快速通知到相关开发人员？
3. 怎样确保问题被及时跟进和修复？

这促使我开始思考：能否打造一个自动化的错误追踪和处理流程？

## 实现思路

### 1. 错误源码定位

首先，我们需要从错误堆栈中提取有效信息：

```ts
class SourceMapper {
  private sourceMapCache = new Map<string, RawSourceMap>();

  async getOriginalPosition(error: ErrorInfo) {
    const { line, column, filename } = this.parseStack(error.stack);

    // 获取 sourceMap
    const sourceMap = await this.getSourceMap(filename);
    if (!sourceMap) return null;

    // 通过 source-map 库定位原始位置
    const consumer = await new SourceMapConsumer(sourceMap);
    const original = consumer.originalPositionFor({
      line,
      column,
    });

    return {
      file: original.source,
      line: original.line,
      column: original.column,
    };
  }

  private parseStack(stack: string) {
    // 解析错误堆栈，提取文件名、行号和列号
    const matches = stack.match(/at\s+.+:(\d+):(\d+)/);
    if (!matches) return null;

    return {
      line: parseInt(matches[1], 10),
      column: parseInt(matches[2], 10),
      filename: matches[0].split(':')[0].split('/').pop(),
    };
  }
}
```

### 2. Git Blame 集成

有了源码位置，接下来通过 Git Blame 找到最后修改该行代码的开发者：

```ts
class GitBlameService {
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  async getLastCommitInfo(file: string, line: number) {
    try {
      // 执行 git blame 命令
      const blame = await this.execGitBlame(file, line);

      // 解析 blame 信息
      const { commit, author, date, email } = this.parseBlameOutput(blame);

      return {
        commit,
        author,
        date,
        email,
      };
    } catch (error) {
      console.error('Git blame failed:', error);
      return null;
    }
  }

  private async execGitBlame(file: string, line: number) {
    const { exec } = require('child_process');
    const cmd = `git blame -L ${line},${line} ${file}`;

    return new Promise((resolve, reject) => {
      exec(cmd, { cwd: this.repoPath }, (error: any, stdout: string) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
  }
}
```

### 3. 钉钉通知集成

找到责任人后，通过钉钉机器人发送通知：

```ts
class DingTalkNotifier {
  private webhook: string;
  private secret: string;

  constructor(webhook: string, secret: string) {
    this.webhook = webhook;
    this.secret = secret;
  }

  async notify(error: ErrorInfo, blameInfo: BlameInfo) {
    const message = this.formatMessage(error, blameInfo);
    const timestamp = Date.now();
    const sign = this.generateSign(timestamp);

    await fetch(`${this.webhook}&timestamp=${timestamp}&sign=${sign}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msgtype: 'markdown',
        markdown: {
          title: '线上错误通知',
          text: message,
        },
        at: {
          atMobiles: [blameInfo.phone],
          isAtAll: false,
        },
      }),
    });
  }

  private formatMessage(error: ErrorInfo, blameInfo: BlameInfo) {
    return `
### 线上错误通知
- **错误类型**: ${error.type}
- **错误信息**: ${error.message}
- **发生时间**: ${new Date().toLocaleString()}
- **影响版本**: ${error.version}
- **责任人**: ${blameInfo.author}
- **最后修改**: ${blameInfo.date}
- **错误详情**: [查看详情](${this.generateErrorLink(error)})
    `;
  }
}
```

### 4. 工单系统集成

最后，自动在内部 BUG 平台创建工单：

```ts
class TicketService {
  private apiEndpoint: string;
  private apiToken: string;

  async createTicket(error: ErrorInfo, blameInfo: BlameInfo) {
    const ticket = {
      title: `[线上错误] ${error.message}`,
      type: 'bug',
      priority: this.calculatePriority(error),
      assignee: blameInfo.email,
      description: this.generateDescription(error, blameInfo),
      labels: ['frontend', 'auto-created'],
    };

    const response = await fetch(`${this.apiEndpoint}/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticket),
    });

    return response.json();
  }

  private calculatePriority(error: ErrorInfo) {
    // 根据错误频率、影响用户数等计算优先级
    if (error.count > 100) return 'high';
    if (error.count > 10) return 'medium';
    return 'low';
  }
}
```

### 5. 流程编排

将上述功能整合到一起：

```ts
class ErrorTrackingOrchestrator {
  private sourceMapper: SourceMapper;
  private gitBlame: GitBlameService;
  private dingTalk: DingTalkNotifier;
  private ticket: TicketService;

  async process(error: ErrorInfo) {
    try {
      // 1. 定位源码位置
      const position = await this.sourceMapper.getOriginalPosition(error);
      if (!position) return;

      // 2. 获取 Git Blame 信息
      const blameInfo = await this.gitBlame.getLastCommitInfo(
        position.file,
        position.line
      );
      if (!blameInfo) return;

      // 3. 发送钉钉通知
      await this.dingTalk.notify(error, blameInfo);

      // 4. 创建工单
      const ticket = await this.ticket.createTicket(error, blameInfo);

      // 5. 更新错误信息
      await this.updateErrorStatus(error, ticket.id);
    } catch (error) {
      console.error('Error tracking failed:', error);
    }
  }
}
```

## 实施效果

部署这套系统后，我们获得了显著的改进：

1. **响应时间**: 从发现错误到通知到责任人的时间从平均 30 分钟缩短到 5 分钟
2. **修复效率**: 问题修复时间减少了 40%
3. **责任明确**: 不再需要手动排查责任人
4. **流程规范**: 所有线上错误都有完整的处理记录

## 经验总结

1. **源码映射很重要**

   - 准确的 sourceMap 是一切的基础
   - 需要确保生产环境的 sourceMap 安全存储

2. **Git Blame 不是完美的**

   - 需要考虑代码合并、重构等场景
   - 可以结合提交记录做更智能的归因

3. **通知要有策略**

   - 避免信息轰炸
   - 根据错误严重程度调整通知频率
   - 支持错误消息的聚合

4. **工单系统集成**
   - 自动创建工单节省大量人工操作
   - 需要合理设置工单优先级
   - 保持工单状态与错误修复进度的同步

## 未来规划

1. 引入机器学习模型，提高责任人识别准确率
2. 支持更多的通讯工具（企业微信、Slack 等）
3. 增加错误影响评估功能
4. 提供错误修复建议

通过这套系统，我们不仅提高了问题处理效率，更重要的是建立了一个完整的错误追踪和处理流程。它让我们能够更专注于预防错误，而不是被动地处理问题。

毕竟，最好的错误处理就是预防错误的发生。而这个系统，正是帮助我们达到这个目标的重要工具。
