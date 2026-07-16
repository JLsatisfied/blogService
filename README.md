# blogService

个人博客/作品集 CMS 后端服务，基于 NestJS + Prisma + MySQL 构建。

## 技术栈

| 技术 | 说明 |
|---|---|
| NestJS | Node.js 服务端框架 |
| Prisma | 数据库 ORM |
| MySQL | 关系型数据库 |
| JWT | 用户认证 |
| class-validator | 请求参数校验 |
| Nodemailer | 邮件发送（QQ SMTP） |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，修改以下配置：

```env
DATABASE_URL="mysql://root:password@localhost:3306/blog_service"
JWT_SECRET=your-random-secret
APP_PORT=5005
```

### 3. 初始化数据库并启动

```bash
npm run start:dev
```

该命令会自动将 Prisma schema 推送到 MySQL 并启动服务。

### 4. 运行

服务默认运行在 `http://localhost:5005`。

## 目录结构

```
src/
├── common/              # 公共模块
│   ├── decorators/      # @Public() 装饰器（标记公开接口）
│   ├── filters/         # 异常过滤器（统一错误响应格式）
│   ├── guards/          # JWT 认证守卫
│   ├── interceptors/    # 响应拦截器（统一 {code, data, msg} 格式）
│   └── dto/             # 通用分页 DTO
├── database/            # Prisma 数据库服务
├── modules/
│   ├── auth/            # 认证（登录、注册、忘记密码）
│   ├── users/           # 管理员用户管理
│   ├── pc-users/        # 前台 PC 用户管理
│   ├── articles/        # 文章 CRUD（创建、编辑、发布、置顶、分类）
│   ├── labels/          # 标签管理
│   ├── manuals/         # 手册/合集管理（多篇文章打包成册）
│   ├── projects/        # 作品集项目管理
│   ├── resume/          # 简历/经历管理
│   ├── messages/        # 留言/评论审核
│   ├── settings/        # 站点设置（头像、社交链接等）
│   ├── email/           # 邮件发送（密码重置等）
│   ├── public/          # 公开接口（无需认证，供博客前台调用）
│   └── ai/              # AI 写作助手
└── main.ts              # 应用入口
```

## 接口体系

### 管理端 `/admin/*`（需要 JWT 认证）

| 路由 | 方法 | 功能 |
|---|---|---|
| `/admin/login` | POST | 管理员登录 |
| `/admin/register` | POST | 管理员注册 |
| `/admin/addTexts` | POST | 创建或更新文章 |
| `/admin/searchTextList` | GET | 分页查询已发布文章 |
| `/admin/searchTextListDraft` | GET | 分页查询草稿列表 |
| `/admin/textRelease` | POST | 发布草稿 |
| `/admin/textClass` | PATCH | 修改文章分类（普通 ↔ 手册） |
| `/admin/textMax` / `/textMin` | POST | 置顶 / 取消置顶 |
| `/admin/deleteText` | POST | 删除文章 |
| `/admin/addlabel` | POST | 创建或更新标签 |
| `/admin/searchAllLabel` | GET | 获取全部标签 |
| `/admin/addManual` | POST | 创建或更新手册 |
| `/admin/searchManualLists` | GET | 查询手册关联的文章列表 |
| `/admin/addTextMan` | POST | 向手册添加文章 |
| `/admin/deleteManualname` | POST | 删除手册 |
| `/admin/addProject` | POST | 创建或更新项目 |
| `/admin/searchMsg` | GET | 待审核留言列表 |
| `/admin/setStateMsg` | POST | 审核留言（通过/拒绝） |
| `/admin/ai/stream` | POST | AI 流式请求（SSE） |
| `/admin/userInfo` | GET | 获取当前登录用户信息 |

### 公开端 `/pc/*`（无需认证）

| 路由 | 方法 | 功能 |
|---|---|---|
| `/pc/getTextLits` | GET | 文章列表 |
| `/pc/getText` | GET | 文章详情（自动增加阅读量） |
| `/pc/latelyGetText` | GET | 最新 10 篇文章 |
| `/pc/hotGetText` | GET | 热门 10 篇文章 |
| `/pc/getTableAll` | GET | 全部标签 |
| `/pc/getProjectList` | GET | 项目列表 |
| `/pc/getManual` | GET | 手册列表 |
| `/pc/getManualTxts` | GET | 手册详情（含关联文章） |
| `/pc/getExperience` | GET | 简历/经历列表 |
| `/pc/addMessage` | POST | 提交留言 |
| `/pc/searchMsgAdminsLeft` | GET | 站点侧栏信息 |
| `/pc/ai/stream` | POST | AI 流式请求（公开版） |

## AI 写作助手

内置 6 种 AI 模式，通过 SSE 流式返回结果：

| 模式 | 功能 | 使用场景 |
|---|---|---|
| `continue` | 续写 | 基于上文自动接续内容 |
| `polish` | 润色 | 改写优化选中文字 |
| `summarize` | 总结 | 生成结构化摘要 |
| `translate` | 翻译 | 支持中、英、日、韩、法、德 |
| `outline` | 大纲 | 根据主题生成文章大纲 |
| `chat` | 问答 | 用户自由提问，结合文章上下文回答 |

请求示例：

```json
POST /admin/ai/stream 或 /pc/ai/stream
{
  "mode": "summarize",
  "content": "文章全文...",
  "targetLang": "英文",
  "topic": "Vue 响应式原理",
  "question": "核心要点是什么？"
}
```

支持 OpenAI、DeepSeek、Claude 等所有兼容 OpenAI 接口的 AI 服务。在 `.env` 中配置：

```env
AI_API_BASE=https://api.deepseek.com/v1
AI_API_KEY=sk-your-api-key
AI_MODEL=deepseek-chat
```

## 统一响应格式

所有接口返回格式如下：

```json
{
  "code": 200,
  "msg": "success",
  "data": { ... },
  "total": 100
}
```

校验失败时 HTTP 状态码返回 200，通过 `code` 字段区分业务状态（如 `code: 400` 表示参数不合法），便于前端统一处理。

## 配套前端

| 项目 | 技术栈 | 说明 |
|---|---|---|
| [zetaAdmin](../zetaAdmin) | Vue 3 + Element Plus + wangEditor | 管理后台 |
| [myblog](../myblog) | React + Tailwind CSS | 博客前台 |

## 常用命令

```bash
npm run start:dev        # 开发模式（自动同步 schema + 热重载）
npm run build            # 编译 TypeScript
npm run start:prod       # 生产模式启动
npm run prisma:studio    # 打开 Prisma 数据库可视化界面
npm run prisma:generate  # 重新生成 Prisma Client 类型
```
