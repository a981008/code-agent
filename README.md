# Code Agent CLI

一个基于 TypeScript 的 AI Agent 实现，支持 Anthropic LLM 流式输出、工具执行和技能系统。

## 功能特性

- **流式对话**：基于 Anthropic Messages API 的流式输出
- **工具执行**：Agent 循环支持调用多种工具（Bash、文件操作、Web 等）
- **对话历史**：自动维护用户/助手消息历史
- **彩色输出**：CLI 带颜色标注（agent/tool/error）
- **环境配置**：通过 `.env` 文件配置模型和 API
- **Subagent 委托**：复杂任务可委托给独立 Agent 实例处理
- **技能系统**：支持加载和管理可复用的技能（Skills）

## 项目结构

```
src/
├── agent.ts          # Agent 核心逻辑（循环、工具调用）
├── cli.ts            # CLI 交互（readline 问答）
├── console.ts        # 输出格式化（颜色标注）
├── main.ts           # 入口点
├── client/           # LLM 客户端
│   ├── anthropic.ts  # Anthropic 流式客户端
│   ├── factory.ts    # 客户端工厂
│   └── types.ts      # 客户端类型定义
├── context/          # 对话上下文
│   ├── history.ts    # 消息历史管理
│   └── types.ts      # 内容块类型定义
├── skill/            # 技能系统
│   ├── loader.ts     # 技能加载器
│   └── types.ts      # 技能类型定义
└── tool/             # 工具实现
    ├── bash.ts       # Bash 工具
    ├── file.ts       # 文件操作工具（读/写/编辑）
    ├── manager.ts    # 工具管理器
    ├── registry.ts   # 工具注册表
    ├── skill.ts      # 技能工具
    ├── subagent.ts   # Subagent 工具（任务委托）
    ├── types.ts      # 工具类型定义
    └── web.ts        # Web 工具（fetch/search）

.skills/               # 技能目录（可选）
```

## 安装配置

```bash
# 安装依赖
npm install

# 创建环境配置文件
cat > .env << 'EOF'
# Anthropic API Configuration
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic
ANTHROPIC_AUTH_TOKEN=your_auth_token
ANTHROPIC_MODEL=claude-sonnet-4-7-20250514
EOF
```

## 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `ANTHROPIC_BASE_URL` | Anthropic API 端点 | - |
| `ANTHROPIC_AUTH_TOKEN` | Anthropic API 密钥 | - |
| `ANTHROPIC_MODEL` | 模型名称 | `claude-sonnet-4-7-20250514` |

## 使用

```bash
# 运行 CLI
npm start

# 开发模式
npm run dev

# 构建
npm run build

# 格式化代码
npm run format

# 检查格式化
npm run format:check
```

## 内置工具

| 工具 | 描述 |
|------|------|
| `bash` | 执行 Shell 命令 |
| `read` | 读取文件内容（支持 offset 和 limit） |
| `write` | 写入文件内容 |
| `edit` | 精确替换文件内容 |
| `web_fetch` | 获取 URL 内容 |
| `web_search` | 网页搜索 |
| `subagent` | 委托子 Agent 处理任务 |
| `skill` | 加载和管理技能 |

## 技能系统

Code Agent 支持技能（Skills）机制，用于复用提示词和工具配置。

### 技能目录

技能可存放在两个位置：
- **全局技能**：`~/.claude/skills/`
- **项目技能**：`./.skills/`

### 技能文件格式 (SKILL.md)

```markdown
---
name: example-skill
description: An example skill description
allowed-tools:
  - bash
  - read
argument-hint: <arg>
user-invocable: true
version: 1.0.0
---

# Skill Prompt

This is the skill's prompt content...
```

### 技能元数据

| 字段 | 描述 |
|------|------|
| `name` | 技能名称 |
| `description` | 技能描述 |
| `allowed-tools` | 允许使用的工具列表 |
| `argument-hint` | 参数提示 |
| `user-invocable` | 是否可由用户调用 |
| `version` | 版本号 |

## Subagent 委托

Subagent 机制允许将复杂任务委托给独立的 Agent 实例处理，适用于需要深入分析、多步骤处理的场景。

### 如何触发 Subagent

Agent 会在遇到以下场景时自动使用 subagent：

1. **复杂的多步骤任务**
   ```
   user >> 帮我重构 src/tool 目录下的所有工具类，统一错误处理方式
   ```

2. **深入的代码分析**
   ```
   user >> 分析整个项目的依赖关系，找出潜在的循环依赖
   ```

3. **需要探索性工作**
   ```
   user >> 调研一下如何实现流式输出的进度条显示
   ```

### 手动使用示例

你也可以明确要求使用 subagent：

```
user >> 请使用 subagent 分析 src/ 目录下所有文件的错误处理模式
```

### 工具调用格式

```typescript
{
  tool: "subagent",
  input: {
    task: "分析 src/ 目录下所有文件的错误处理模式"
  }
}
```

### 特性

- ✅ 使用独立 Agent 实例，拥有独立的对话上下文
- ✅ 防止递归调用（subagent 不能再调用 subagent）
- ✅ 彩色输出标记 `[subagent] Starting task` / `[subagent] Completed`
- ✅ 完整的工具访问权限（除了 subagent 自身）

## CLI 使用示例

```
🤖 Code Agent CLI
Model: claude-sonnet-4-7-20250514
───────────────────────────────────────────
Type 'q' or 'exit' to quit

user >> 分析当前目录结构
agent >> 正在分析目录结构...
tool_call >> bash: {"command":"find . -type f -name \"*.ts\" | head -20"}
tool_result >> ./src/agent.ts
./src/cli.ts
./src/main.ts
...

agent >> 当前项目包含以下 TypeScript 文件：
- ./src/agent.ts
- ./src/cli.ts
- ./src/main.ts
...（共 20+ 个文件）

user >> q
Goodbye!
```

## 扩展开发

### 添加新工具

在 `src/tool/` 中实现新工具：

```typescript
import { Tool } from './types';

export class NewTool extends Tool {
  name = 'new_tool';
  description = 'Description of the new tool';
  
  input_schema = {
    type: 'object' as const,
    properties: {
      param: { type: 'string' as const },
    },
    required: ['param'],
  };

  execute(input: Record<string, unknown>): string {
    const param = String(input.param || '');
    // 实现工具逻辑
    return 'result';
  }
}
```

在 `src/tool/registry.ts` 中注册：

```typescript
import { NewTool } from './new_tool';

registerTool(new NewTool());
```

### 添加新技能

在 `.skills/` 目录下创建技能：

```bash
mkdir -p .skills/my-skill
cat > .skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: My custom skill
allowed-tools:
  - bash
  - read
user-invocable: true
---

Your skill prompt here...
EOF
```

## 依赖

- `@anthropic-ai/sdk` - Anthropic API 客户端
- `dotenv` - 环境变量配置
- `marked` - Markdown 解析
- `openai` - OpenAI 客户端

## 开发依赖

- `typescript` - TypeScript 编译器
- `tsx` - TypeScript 执行器
- `prettier` - 代码格式化
- `vitest` - 单元测试