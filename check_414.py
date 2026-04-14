import re

with open('c:/Users/asus/wnews/news-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到2026-04-14的数据块
start = content.find('"2026-04-14": {')
end = content.find('},\n  "2026', start + 1)
if end == -1:
    end = content.find('\n};', start)
block = content[start:end+2]

# 统计关键字段
fields = ['market_tone','all_news','s_level','a_level','wukong_judgment','wukong_enhanced','bajie_conclusion','tang_sanzang','white_dragon','sangsha_module']
for field in fields:
    count = block.count(field)
    status = "[OK] exist" if count > 0 else "[MISS]"
    print(f"{field}: {status}")

print(f"\n总长度: {len(block)} 字符")
print(f"晚报内容: {block[100:200]}")
