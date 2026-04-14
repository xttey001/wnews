# -*- coding: utf-8 -*-
f = open('c:/Users/asus/wnews/news-data.js', 'r', encoding='utf-8')
c = f.read()
f.close()

i = c.find('"2026-04-14"')
if i >= 0:
    block = c[i:i+500]
    
    # Write to file instead of printing
    with open('c:/Users/asus/wnews/block_414.txt', 'w', encoding='utf-8') as out:
        out.write('=== 2026-04-14 block (first 500 chars) ===\n')
        out.write(block)
        out.write('\n\n=== Field check ===\n')
        
        pending = '\u5f85\u66f4\u65b0'
        count = block.count(pending)
        out.write(f'Pending count: {count}\n')
        
        for field in ['wukong_enhanced', 'tang_sanzang', 'bajie_conclusion', 'market_tone']:
            has = field in block
            out.write(f'{field}: {"YES" if has else "NO"}\n')
    
    print('Output written to block_414.txt')
else:
    print('2026-04-14 NOT FOUND!')
