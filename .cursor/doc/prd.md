# LoneIn · H5 Demo 产品需求文档 (PRD)

## 项目基本信息

### 技术栈
- 前端框架: H5 (移动端Web应用)
- 包管理器: pnpm
- 开发环境: Windows系统
- 开发工具: Cursor

### 目录结构
```
demo0827/
├── .cursor/
│   └── doc/
│       └── prd.md
└── src/
    ├── pages/
    │   ├── chat/          # 对话页面
    │   ├── discover/      # 发现页面
    │   └── me/            # 我的页面
    ├── components/        # 公共组件
    ├── utils/            # 工具函数
    ├── api/              # 接口层
    └── store/            # 状态管理
```

## 1. 产品定位

### 1.1 愿景
让孤独不再寂寞；把 **[情绪]→[作品]**，再把 **[作品]→[关系]**，实现"被看见 / 被续写 / 被共鸣"。

### 1.2 核心能力
AI 像循循善诱的伙伴，通过深度对话引导情绪输出，并在合适时机转化为 **诗歌/歌曲/图像/短片**（Demo 以**诗词卡片、图片**为主，音频/视频保留入口与占位）。

### 1.3 关系沉淀
作品构成"第二朋友圈 / 情绪档案"，可分享、投递「流光瓶」、在社区获得共鸣。

## 2. 信息架构

### 2.1 页面路由
- **/chat（对话）**: 情绪对话 → 合适时机触发 → 形态选择 → 生成作品 → 换一种表达
- **/discover（发现）**: 推荐 / 关注 / 共鸣墙 / 流光瓶（轻量版 Tab）
- **/me（我的）**: 作品流（时间序）+ 作品详情（共鸣/评论/分享/再生成/换形态）

### 2.2 目标闭环
H5 **最小闭环**：对话 → 生成 → 保存/分享 → 发现

## 3. 核心功能流程

### 3.1 阶段化引导（Agent 行为）
A. **开场与安全区**: 开放式提问"今天发生了什么/你在意什么"  
B. **具象化**: 从"感受词"走向"具体人事物与画面"  
C. **深描与意义**: 引导"这件事对你意味着什么/最想被理解的部分"  
D. **创作意向确认**: 命中触发条件时，轻量建议 1–2 个形态（尊重继续聊天）  
E. **生成与回看**: 产出作品卡 → 保存/分享/再生成/换形态  

### 3.2 触发时机
- **内容深度**: 出现人物/场景/因果/意象
- **情绪强度**: 孤独/思念/悲伤/喜悦等强烈词
- **对话轮次**: ≥ 6–8 轮
- **意向表达**: 用户提到"想留点纪念/想做一首歌/看成一张图"
- **语境信号**: 纪念日/夜深/独处等词
- **出现形式**: 对话流上方/输入框上方的「建议生成」**气泡**（不遮挡输入）

### 3.3 形态匹配（优先级）
- **诗词卡片**: 抽象情绪、短句、需快速定稿
- **图片（画作）**: 意象强、画面感足
- **音频**: 情绪起伏明显、想被"听见"
- **视频**: 叙事完整、多个强意象

### 3.4 换一种表达
- 作品卡提供 **「换形态」**: 沿用同一内容摘要与情绪标签，仅切换渲染方式
- **失败回退**: 统一回退为**诗词卡片**（最稳态产物），保证"被看见"的最低可用表达
- 生成后可 **分享 / 投递流光瓶 / 参与共鸣互动**，把作品沉淀为关系

## 4. 页面详细设计

### 4.1 /chat 对话页

#### 主要区块
- 对话流（用户/AI 消息气泡、时间戳）
- 输入区（文本；语音入口占位）
- 建议生成气泡（命中触发时显示：系统首选形态 + 展开更多）
- 作品卡（标题、情绪标签、说明；操作：保存到我的 / 分享 / 换形态）

#### 关键交互
- 触发气泡出现频率: **每 10 轮 ≤ 2 次**（可配置）
- 用户拒绝后，**再提示间隔 ≥ 3 轮**
- 生成过程显示「正在为你把这段心情化成作品…」，可取消/重试
- 成功后插入作品卡；失败 → 弹 Toast「已为你保留文字版诗卡」

#### 文案样例
- 提示: `要把这段心情留成一张诗卡/一幅画吗？`
- 成功: `已为你保留下来。`
- 失败回退: `生成超时，已替你保存为诗卡。`

#### 空态
- 首次进入: `和我聊聊，今天发生了什么？`

### 4.2 /discover 发现页（轻量多 Tab）

#### Tabs功能
- **推荐**: 同类（相似情绪/题材）、共时（同一时间段）、主页后扩展推荐基线
- **关注**: 所关注对象的最新作品流
- **共鸣墙**: 按话题/情绪标签聚合浏览，鼓励"意外相遇"
- **流光瓶**: 投递/拾取情绪作品，制造"同频邂逅"

#### 空态文案
- 推荐: `去和我聊聊，作品会在这里遇见同频的人。`
- 关注: `还没有关注的人，去发现页逛逛吧。`
- 共鸣墙: `挑一个你在意的话题试试。`
- 流光瓶: `扔出一只瓶子，看看谁会拾起。`

### 4.3 /me 我的页

#### 功能模块
- **作品流**: 按时间排序，展示诗/图（音频/视频为占位卡）+ 情绪标签 + 可见性
- **作品详情**: 共鸣/评论/分享/删除/再生成/换形态（同一语义内核）
- **资料**: 昵称/签名/头像与隐私设置（公开/私密）

## 5. 数据模型设计

### 5.1 核心数据对象
```typescript
// 用户
interface User {
    id: string;
    nickname: string;
    avatar: string;
    bio: string;
    created_at: string;
}

// 会话
interface Session {
    id: string;
    user_id: string;
    created_at: string;
    status: string;
}

// 消息
interface Message {
    id: string;
    session_id: string;
    role: 'user' | 'ai';
    content: string;
    created_at: string;
}

// 情绪评估
interface EmotionEval {
    id: string;
    session_id: string;
    depth_score: number;
    intensity: number;
    labels: string[];
    trigger_signals: string[];
}

// 作品
interface Work {
    id: string;
    user_id: string;
    session_id: string;
    source_message_id: string;
    modality: 'poem' | 'image' | 'audio' | 'video';
    title: string;
    desc: string;
    emotion_labels: string[];
    visibility: 'public' | 'private';
    created_at: string;
}

// 作品资源
interface WorkAsset {
    id: string;
    work_id: string;
    url: string;
    cover_url: string;
    duration?: number;
    meta: Record<string, any>;
}

// 互动
interface Interaction {
    id: string;
    work_id: string;
    user_id: string;
    type: 'resonate' | 'comment' | 'share';
    content?: string;
    created_at: string;
}

// 流光瓶
interface Bottle {
    id: string;
    work_id: string;
    topic_tags: string[];
    status: 'thrown' | 'picked';
    matched_user_id?: string;
    created_at: string;
}
```

## 6. API 接口设计

### 6.1 对话 & 生成
- **POST /chat/send**
  - Request: `{ session_id?, text?, audio_url? }`
  - Response: `{ message_id, session_id }`

- **GET /chat/:session_id/stream** (SSE/WS 可选)
  - Response: `{ message_id, reply_text, emotion_eval: {depth, intensity, labels[]} }`

- **POST /generate/trigger**
  - Request: `{ session_id, message_id, modality? }`
  - Response: `{ work_id, modality, status: 'pending' | 'ready' | 'failed' }`

- **POST /generate/regenerate**
  - Request: `{ work_id, target_modality }`
  - Response: `{ new_work_id, modality, status }`

### 6.2 发现
- **GET /discover/feed**
  - Query: `{ tab: 'recommend' | 'follow' | 'wall' | 'bottle', page }`
  - Response: `{ items: [{ work_id, user, modality, cover, emotion_labels, created_at }] }`

- **POST /bottle/throw**: `{ work_id, topic_tags[] }` → 200

- **POST /bottle/pick**: `{}` → `{ work_id | null }`

### 6.3 我的 & 互动
- **GET /me/works**: `{ page }` → `{ works[] }`
- **GET /works/:id** → work detail + assets + interactions
- **POST /works/:id/share** / **POST /works/:id/delete**
- **POST /interactions**: `{ work_id, type, content? }` → 200

## 7. 推荐策略

### 7.1 MVP 基线
- **同类推荐**: 相似情绪/题材的作品
- **共时推荐**: 同一时间段心境相近作品
- **主页后推荐**: 浏览某人主页后，延展相近作品

## 8. 验收标准

### 8.1 核心指标
- **闭环跑通率**: 首次对话→首个作品保存 ≥ 70%
- **触发建议 CTR**: ≥ 20%（灰度参数可调）
- **生成成功率**: 诗卡 ≥ 98%；图片 ≥ 90%
- **换形态使用率**: ≥ 15%
- **发现页点击率**: ≥ 30%
- **稳定性**: 失败回退必达诗卡；错误可重试

### 8.2 功能验收
- 建议不打扰、回退稳定、换形态流程通畅
- 对话流程自然，触发时机准确
- 作品生成稳定，失败回退机制完善
- 发现页推荐精准，互动体验良好

## 9. 文案库

### 9.1 核心交互文案
- 建议生成: `要把这段心情留成一张诗卡/一幅画吗？`
- 生成中: `正在为你把这段心情化成作品…`
- 成功: `已为你保留下来。`
- 失败回退: `生成超时，已替你保存为诗卡。`
- 流光瓶: `扔出一只瓶子，看看谁会拾起。`

## 10. 隐私与合规

### 10.1 Demo 级要求
- 用户可删除会话与作品
- 分享默认不含个人敏感信息
- 社区治理: 举报/屏蔽/关键词审核（轻量版本）

## 11. 版本规划

### 11.1 当前版本 (H5 Demo)
- 对话闭环 + 诗卡/图片生成
- 发现轻量 + 我的沉淀

### 11.2 后续版本
- 音频/视频生成
- 推荐强化
- 流光瓶匹配策略升级
- 更多社交互动

---

*本文档将随项目开发进度持续更新* 