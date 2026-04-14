# -*- coding: utf-8 -*-
import json, os

JS = r'c:\Users\asus\wnews\news-data.js'
PENDING = '\u5f85\u66f4\u65b0'

with open(JS, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the 2026-04-14 block
marker = '"2026-04-14"'
idx = content.find(marker)
if idx < 0:
    print('ERROR: 2026-04-14 not found')
    exit(1)

# Find the pending update string in this block
end = content.find('},\n  "2026', idx + 1)
block = content[idx:end+2]

if PENDING in block:
    # Get tang_sanzang data from the same block for the correct text
    tang_idx = content.find('"tang_sanzang"', idx)
    if tang_idx > 0 and tang_idx < end:
        # Extract position and action
        pos_start = content.find('\u4ed3\u4f4d', tang_idx)
        act_start = content.find('\u6700\u7ec8\u884c\u52a8', tang_idx)
        
    # Simple replacement: replace the pending string with actual evening tone
    old_text = f'[2026-04-14\u665a\u62a5]{PENDING}'
    new_text = f'[2026-04-14\u665a\u62a5] \u8f7b\u4ed3\u89c2\u671b | \u80dc\u7387~62% | 40-50%'
    
    new_content = content.replace(old_text, new_text, 1)
    
    with open(JS, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    # Verify
    with open(JS, 'r', encoding='utf-8') as f:
        verify = f.read()
    v_idx = verify.find('"2026-04-14"')
    v_block = verify[v_idx:v_idx+500]
    
    if PENDING not in v_block:
        print(f'FIXED! Replaced: {old_text} -> {new_text[:50]}')
    else:
        print('WARNING: still has pending!')
else:
    print('Already fixed (no pending found)')
