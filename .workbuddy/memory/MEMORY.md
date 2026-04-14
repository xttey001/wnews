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
1. **搜索数据源缺陷（2026-04-14确认）**: search_today_v2.py用新浪全球滚动新闻API，返回以美股/地缘为主，**A股行情新闻搜不到**。19条里0条A股收盘行情。需要增加东方财富/同花顺等A股专用数据源
2. 周末S/A级新闻为空 → search_today.py 数据源限制
3. 前端index.html使用中文key(tang_sanzang.仓位)，后端需转换

## 自动化教训（2026-04-14总结）
1. **修复了必须commit+push**: review.html的market_tone兼容修复之前做了但没push，线上一直报错
2. **market_tone从字符串改为对象格式后**，所有前端页面(index/review)都需要做类型兼容检查
3. **wukong_judgment字段不完整**: pipeline输出的wj只有market_view没有market_sentiment，前端需双重兜底
