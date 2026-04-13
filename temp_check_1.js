// 临时脚本: 提取所有ETF/股票代码
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\asus\\wnews\\news-data.js', 'utf-8');
const pattern = /[\u4e00-\u9fa5A-Za-z]+\(\d{6}\)/g;
let matches = [...content.matchAll(pattern)];

// 统计
const stats = {};
for (const m of matches) {
    const full = m[0];
    const codeMatch = full.match(/\((\d{6})\)/);
    if (codeMatch) {
        const code = codeMatch[1];
        const name = full.replace(`(${code})`, '');
        if (!stats[code]) stats[code] = { names: new Set(), count: 0 };
        stats[code].names.add(full);
        stats[code].count++;
    }
}

// 输出结果
console.log('=' .repeat(80));
console.log(`共发现 ${matches.length} 处代码引用, ${Object.keys(stats).length} 个唯一代码`);
console.log('=' .repeat(80));

for (const code of Object.keys(stats).sort()) {
    const info = stats[code];
    console.log(`${code}: 出现${info.count}次 | 名称: ${[...info.names].join(', ')}`);
}
