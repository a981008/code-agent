# Code Agent CLI

一个基于 TypeScript 的 Agent 循环实现，支持 Anthropic LLM 流式输出和工具执行。

## 功能特性

- **流式对话**：基于 Anthropic Messages API 的流式输出
- **工具执行**：Agent 循环支持调用 Bash 等工具
- **对话历史**：自动维护用户/助手消息历史
- **彩色输出**：CLI 带颜色标注（agent/tool/error）
- **环境配置**：通过 `.env` 文件配置模型和 API
- **Subagent 委托**：复杂任务可委托给 subagent 处理，支持嵌套调用

## 配置

在项目根目录创建 `.env` 文件：

```bash
# Anthropic API Configuration
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic
ANTHROPIC_AUTH_TOKEN=your_auth_token
ANTHROPIC_MODEL=claude-sonnet-4-7-20250514
```

## 使用

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建
npm run build

# 运行
npm start
```

## 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `ANTHROPIC_BASE_URL` | Anthropic API 端点 | - |
| `ANTHROPIC_AUTH_TOKEN` | Anthropic API 密钥 | - |
| `ANTHROPIC_MODEL` | 模型名称 | `claude-sonnet-4-7-20250514` |

## 项目结构

```
src/
├── client/           # LLM 客户端
│   ├── anthropic.ts  # Anthropic 流式客户端
│   ├── factory.ts    # 客户端工厂
│   └── types.ts      # 客户端类型定义
├── context/          # 对话上下文
│   ├── history.ts    # 消息历史管理
│   └── types.ts      # 内容块类型定义
├── tools/           # 工具实现
│   ├── bash.ts       # Bash 工具
│   ├── file.ts       # 文件操作工具（读/写/编辑）
│   ├── manager.ts    # 工具管理器
│   ├── registry.ts   # 工具注册表
│   ├── subagent.ts   # Subagent 工具（任务委托）
│   ├── types.ts      # 工具类型定义
│   └── web.ts        # Web 工具（fetch/search）
├── agent.ts         # Agent 核心逻辑（循环、工具调用）
├── cli.ts           # CLI 交互（readline 问答）
├── console.ts       # 输出格式化（颜色标注）
└── main.ts          # 入口点
```

## 添加工具

在 `src/tools/registry.ts` 中注册新工具：

```typescript
registerTool(new NewTool());
```

工具需实现 `Tool` 接口：
- `name`：工具名称
- `description`：工具描述（供 LLM 理解）
- `input_schema`：JSON Schema 输入参数
- `execute(input)`：执行逻辑，返回字符串或 Promise<string>结果

## Subagent 委托

SubagentTool 允许将复杂任务委托给独立的 Agent 实例处理：

```typescript
// 使用 subagent 工具
subagent: {
  task: "分析 src/ 目录下所有文件的错误处理模式"
}
```

SubagentTool 的特点：
- 使用动态导入避免循环依赖
- 委托给独立的 Agent 实例处理任务
- 通过 system prompt 防止 subagent 递归调用自己
- 使用 Console.line() 输出分隔标记：`[subagent] Starting task` / `[subagent] Completed`

## 命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 开发模式运行（ts-node） |
| `npm run build` | 构建 TypeScript |
| `npm start` | 运行构建版本 |
| `npm run format` | 格式化代码 |
| `npm run format:check` | 检查格式化 |

## CLI 使用

```
🤖 Code Agent CLI
Model: claude-sonnet-4-7-20250514
───────────────────────────────────────────
Type 'q' or 'exit' to quit

user >> hello
agent >> Hello! How can I help you today?
```

输入 `q` 或 `exit` 退出。
