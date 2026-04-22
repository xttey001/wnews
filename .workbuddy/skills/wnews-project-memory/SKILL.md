---
name: wnews-project-memory
description: |
  悟空财经分析(wnews)项目长期记忆。每次对话开始时浏览此文件，快速了解项目工作流程、架构、已知问题和待办事项。
  触发词：wnews、悟空财经、项目记忆、项目概览
version: "1.0.0"
last_updated: "2026-04-22"
---

# 悟空财经分析 (wnews) - 项目长期记忆

> **每次对话开始时，请先浏览本文件，了解项目当前状态和工作流程。**

---

## 一、项目基本信息

| 项目 | 信息 |
|------|------|
| **项目名** | 悟空财经分析 (wnews) |
| **线上地址** | https://xttey001.github.io/wnews/ |
| **仓库地址** | `git@github.com:xttey001/wnews.git` |
| **技术栈** | 纯前端 HTML+CSS+JS（无框架），后端 Python（外部目录） |
| **部署** | GitHub Pages + GitHub Actions 自动部署 |
| **数据源** | `news-data.js`（JSON格式，约1.3MB，覆盖21个交易日） |

---

## 二、五维进化分析体系

```
原始新闻 → 悟空(深度分析) → 沙僧(散户情绪) + 白龙马(主力行为) → 八戒(贝叶斯融合) → 唐僧(最终仲裁)
```

| 角色 | 代号 | 职责 | 颜色主题 |
|------|------|------|---------|
| 悟空 | 深度分析 | S/A级新闻深度解读，市场情绪+操作策略 | 蓝色系 |
| 沙僧 | 散户情绪 | 7天累积+时间衰减，追高/恐慌概率 | 橙色系 |
| 白龙马 | 主力行为 | K线+量价+交叉验证，吸筹/出货/洗盘 | 紫色系 |
| 八戒 | 贝叶斯融合 | 融合沙僧+白龙马，胜率+行动+ETF组合 | 绿色系 |
| 唐僧 | 最终仲裁 | 跨层矛盾仲裁+全局风控，仓位建议 | 金色系 |

---

## 三、项目文件结构

```
wnews/
├── index.html              # 财经新闻主页（1663行）
├── review.html             # 复盘报告中心（950行）
├── news-data.js            # 核心数据文件（28447行，约1.3MB）
├── README.md               # 项目说明
├── docs/
│   ├── wnews-dashboard-SKILL.md   # 完整项目文档（架构/数据格式/设计规范）
│   └── wnews-review-SKILL.md      # 五维进化系统详细设计文档
├── .github/workflows/
│   ├── deploy.yml          # GitHub Pages 部署工作流（主力）
│   └── static.yml          # 静态内容部署（冗余，建议删除）
├── .workbuddy/
│   ├── memory/MEMORY.md    # 项目长期记忆（ETF映射/已知问题）
│   └── skills/wnews-analysis/SKILL.md  # ETF标准名称映射表(1386只)
└── .codebuddy/
    └── automations/wnews-20/memory.md  # 晚报自动化记录
```

---

## 四、数据流水线（工作流程）

### 日常更新流程
```
1. search_today.py          → 新闻搜索（10-20条）
2. daily_update_v4.py       → 五维进化分析（11步流程）
   ├── 悟空增强(分析经验注入)
   ├── 沙僧增强(情绪经验注入)
   ├── 白龙马增强(主力经验注入)
   ├── 八戒校准(概率先验校准)
   └── 唐僧仲裁(跨层协调)
3. generate_full_newsdata.py → 生成 news-data.js
4. git push → GitHub Pages 自动部署
5. 微信/飞书/网站三路推送
```

### 定时任务
| 任务 | 时间 | 说明 |
|------|------|------|
| 财经早报 | 09:00 | 每日更新 |
| 财经晚报 | 20:00/22:00 | 自动化ID: wnews-20 |
| 每周复盘 | 周五 18:00 | 自动对比预判 vs 实际走势 |
| 每月复盘 | 月末 18:00 | 合并月度数据 |

### 后端脚本位置（外部目录）
| 文件 | 位置 |
|------|------|
| 数据源目录 | `~/.qclaw/workspace/news-evolution/` |
| 进化版主脚本 | `news-evolution/daily_update_v4.py` |
| 经验知识库 | `news-evolution/data/review-experience.json` |
| 待验证队列 | `news-evolution/data/pending_validations.json` |

---

## 五、数据格式（news-data.js）

每日期刊 JSON 格式：
```javascript
{
  "date": "2026-04-10",
  "market_tone": "今日基调",           // 字符串或对象（需兼容）
  "wukong_judgment": { ... },          // 悟空深度分析
  "wukong_enhanced": { ... },          // 悟空增强版（v4新增）
  "bajie_conclusion": { ... },         // 八戒融合结论（含沙僧/白龙马信号）
  "sangsha_module": { ... },           // 沙僧散户情绪
  "white_dragon": { ... },             // 白龙马主力行为
  "tang_sanzang": { ... },             // 唐僧仲裁决策（中文key格式）
  "evolution_v4": { ... },             // 五维进化元数据
  "s_level": [ ... ],                  // S级新闻（主线级，影响1-4周）
  "a_level": [ ... ],                  // A级新闻（轮动级，影响1-3天）
  "douyin": [ ... ],                   // 抖音/平台相关
  "all_news": [ ... ]                  // 全量新闻
}
```

### news-data.js 写入前检查清单
```bash
node --check news-data.js
```

### 禁止使用的字符（JSON字符串值中）
| 字符 | 替代方案 |
|------|---------|
| `"` `"` | 使用 `「` `」` 或 `\"` |
| `'` `'` | 使用 `『` `』` 或 `\'` |

---

## 六、已知问题（持续更新）

### 已修复
| # | 问题 | 修复方案 | 日期 |
|---|------|---------|------|
| 1 | S/A级新闻只显示summary不显示key_point | `text = item.key_point \|\| item.summary \|\| '无摘要'` | 04-11 |
| 2 | 唐僧仲裁模块未渲染 | 新增唐僧模块渲染代码+金色主题CSS | 04-11 |
| 3 | review.html语法错误导致加载卡死 | 修复sort()比较函数少闭合括号 | 04-14 |
| 4 | 逐日准确率表格排版问题 | 删除关键事件列+新增实际走势列 | 04-14 |
| 5 | 4.11新闻来源混淆 | 创建wnews独立自动化任务，隔离两套系统 | 04-11 |
| 6 | 唐僧模块样式不突出 | 改为金色主题+加粗边框+光晕效果 | 04-11 |
| 7 | README.md Git合并冲突未解决 | 清理合并冲突标记 | 04-22 |
| 8 | GitHub Actions重复配置 | 删除冗余的static.yml | 04-22 |

### 未修复
| # | 问题 | 严重程度 | 说明 |
|---|------|---------|------|
| 1 | **搜索数据源缺陷** | 高 | search_today_v2.py用新浪全球滚动新闻API，以美股/地缘为主，**A股行情新闻搜不到**。需增加东方财富/同花顺等A股专用数据源 |
| 2 | **准确率数据为估算值** | 中 | 复盘页面部分准确率基于随机估算`Math.round(60+Math.random()*35)`，未接入真实验证数据 |
| 3 | **前端字段兼容性** | 中 | `wukong_judgment`字段不完整（有时只有`market_view`没有`market_sentiment`），需双重兜底 |
| 4 | **周末数据稀疏** | 低 | 周末/节假日S/A级新闻为空，因数据源限制 |
| 5 | **market_tone格式不统一** | 低 | 有时是字符串，有时是对象`{早报/晚报}`，前端需做类型兼容 |

---

## 七、前端设计规范速查

### 全局样式
| 元素 | 规范值 |
|------|--------|
| 背景 | 深色渐变 `#0d1117 → #161b22`（GitHub Dark） |
| 主强调色 | 金黄色 `#d29922` |
| 成功/正确 | 绿色 `#3fb950` |
| 错误/风险 | 红色 `#f85149` |
| 中性/信息 | 蓝色 `#58a6ff` |
| 紫色 | `#a78bfa`（唐僧模块辅助色） |
| 卡片背景 | `rgba(255,255,255,0.04)` |
| 最大宽度 | `960px` 居中 |
| 字体栈 | `-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif` |

### 模块渲染顺序与配色
1. 悟空判断（蓝色）→ 2. 八戒融合（绿色）→ 3. 沙僧情绪（橙色）→ 4. 白龙马主力（紫色）→ 5. 唐僧仲裁（金色，最高优先级）

### 各模块CSS规范（2026-04-22确认版）

#### 🐷 八戒融合结论（绿色背景）
```css
.bajie-conclusion {
    background: linear-gradient(135deg, rgba(63,185,80,0.15), rgba(63,185,80,0.08));
    border: 1px solid rgba(63,185,80,0.4);
}
```

#### 🙏 唐僧仲裁模块（金色主题）
```css
/* 整体容器 */
.tang-sanzang-section {
    background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(218,165,32,0.08));
    border: 2px solid rgba(255,215,0,0.5);
    box-shadow: 0 0 20px rgba(218,165,32,0.2);
}
/* 仓位标签 - 紫色 */
.ts-position {
    color: #a78bfa;
    background: rgba(167,139,250,0.15);
}
/* 仲裁矛盾 - 白色字体 */
.ts-conflict-item {
    color: #ffffff;
    border-left: 2px solid rgba(255,255,255,0.3);
}
/* 仓位公式 - 紫色 */
.ts-formula {
    background: rgba(167,139,250,0.1);
    color: #a78bfa;
}
/* 唐僧结论标题 */
.ts-title { color: #B8860B; }
```

### 导航栏规范
- 财经首页按钮：`📅 新闻时间线`
- 复盘报告按钮：`📊 复盘报告`（不要加天数前缀）

---

## 八、ETF高频错误代码（AI幻觉区）

| 代码 | 正确名称 | AI常见错误 |
|------|---------|-----------|
| 159542 | 工程机械ETF | ~~电网ETF~~ |
| 159871 | 有色ETF | ~~电池ETF~~ |
| 588260 | 科创信息ETF | ~~科创芯片设计ETF~~ |
| 589260 | 科创芯设ETF | ~~科创信息ETF国泰~~ |

完整映射表见 `.workbuddy/skills/wnews-analysis/SKILL.md`（含全市场1386只参考）

---

## 九、待实现功能

- [ ] 接入实际验证数据，替换占位准确率
- [ ] 每周/每月定时自动生成独立的 `review-data.js`
- [ ] 支持导出 PDF/图片分享
- [ ] 添加历史趋势图（准确率折线图、胜率分布图）
- [ ] 经验有效性追踪（命中率统计）
- [ ] 低效经验自动降权或淘汰
- [ ] 新模式自动发现（聚类分析）
- [ ] A/B 测试框架
- [ ] 增加A股专用数据源（东方财富/同花顺）

---

## 十、Git 操作

```bash
cd /workspace/wnews
git add -A
git commit -m "描述"
git push origin main
```

推送到 main 分支后，GitHub Actions 自动部署到 GitHub Pages。
