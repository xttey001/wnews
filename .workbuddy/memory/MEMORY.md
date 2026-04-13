# wnews 长期记忆

## 项目架构
- wnews (v4) 和 news-website (v3) 完全隔离，并行运营
- 数据源: `~/.qclaw/workspace/news-evolution/` (独立于 news-server)
- 输出: https://xttey001.github.io/wnews/
- 五维进化: 悟空(分析)→沙僧(情绪)→白龙马(主力)→八戒(贝叶斯)→唐僧(仲裁)

## ETF标准名称映射 (2026-04-12 全面验证)
**高频错误代码（AI幻觉区）:**
| 代码 | 正确名称 | AI常见错误 |
|------|---------|-----------|
| 159542 | 工程机械ETF | ~~电网ETF~~ |
| 159871 | 有色ETF | ~~电池ETF~~ |
| 588260 | 科创信息ETF | ~~科创芯片设计ETF~~ |
| 589260 | 科创芯设ETF | ~~科创信息ETF国泰~~ |

**关键正确名称:**
| 代码 | 名称 | 备注 |
|------|------|------|
| 159320 | 电网ETF（广发恒生A股电网设备） | 真·电网ETF |
| 159755 | 电池ETF | 真·电池ETF |

完整映射表见 `.workbuddy/skills/wnews-analysis/SKILL.md`（含全市场1386只参考）

## 自动化配置
- 晚报ID: `wnews-20`, 每天20:00, 仅在 news-evolution 执行
- 早报/复盘待配置

## 已知问题
1. 周末S/A级新闻为空 → search_today.py 数据源限制
2. 前端index.html使用中文key(tang_sanzang.仓位)，后端需转换
