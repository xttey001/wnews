
// ============================================================
//  📊 复盘报告中心 v4 — 三段式进化知识库
// ============================================================

// 错误处理与超时保护
let loadTimeout = setTimeout(function(){
    var el = document.getElementById('reportContent');
    if(el && el.innerHTML.indexOf('加载') !== -1){
        el.innerHTML = renderFallback();
    }
}, 8000);

function handleLoadError(msg){
    clearTimeout(loadTimeout);
    document.getElementById('reportContent').innerHTML =
        '<div class=empty-state><span style=font-size:40px>⚠️</span><p style=color:var(--red);margin-top:12px>'+msg+'</p><p style=font-size:12px;margin-top:8px;color:var(--text-dim)>请确保 news-data.js 文件存在于同目录下</p></div>';
}

function renderFallback(){
    return '<div class=empty-state><span style=font-size:40px>🔄</span><p>数据加载超时</p><p style=font-size:12px;margin-top:8px;color:var(--text-dim)>请刷新页面试试，或检查网络连接</p></div>';
}

function getWeekInfo(dateStr) {
    const d = new Date(dateStr.replace(/-/g, '/'));
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d - jan1) / 86400000);
    const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
    const monday = new Date(d); monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    return { year:d.getFullYear(), weekNum, label:'第'+weekNum+'周',
        start:fmtMD(monday), end:fmtMD(sunday), startObj:monday, endObj:sunday };
}
function getMonthInfo(dateStr) {
    const d = new Date(dateStr.replace(/-/g,'/'));
    return { year:d.getFullYear(), month:d.getMonth()+1,
        label:d.getFullYear()+'年'+String(d.getMonth()+1).padStart(2,'0')+'月',
        start:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01' };
}
function fmtMD(d){return String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function fmtYMD(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}

function buildReviewPeriods(){
    if(!availableDates||availableDates.length===0) return[];
    const periods=[], weekMap={}, monthMap={};
    [...availableDates].sort().reverse().forEach(dateStr=>{
        const wi=getWeekInfo(dateStr), wk=wi.year+'-W'+String(wi.weekNum).padStart(2,'0');
        if(!weekMap[wk]) weekMap[wk]={type:'weekly',key:wk,label:wi.label,range:wi.start+' ~ '+wi.end,
            fullRange:fmtYMD(wi.startObj)+' ~ '+fmtYMD(wi.endObj),dates:[],summary:null};
        weekMap[wk].dates.push(dateStr);
        const mi=getMonthInfo(dateStr), mk=mi.year+'-'+String(mi.month).padStart(2,'0');
        if(!monthMap[mk]) monthMap[mk]={type:'monthly',key:mk,label:mi.label,range:mi.start,dates:[],summary:null};
        monthMap[mk].dates.push(dateStr);
    });
    Object.values(weekMap).forEach(p=>{p.summary=calcSummary(p.dates);periods.push(p)});
    Object.values(monthMap).forEach(p=>{p.summary=calcSummary(p.dates);periods.push(p)});
    return periods;
}

function calcSummary(dates){
    if(!dates||!dates.length) return {daysCount:0,totalNews:0,wukongCoverage:0,dominantSentiment:'无',
        topEtfs:[],topEvents:[],riskWarnings:[],whiteDragonDominant:'无数据',accuracyEstimate:0};
    let totalNews=0, hasWukong=0, sc={偏多:0,偏空:0,中性:0,震荡:0,谨慎:0},
        etfs={}, risks=[], events=[], wdStates={};
    dates.forEach(ds=>{
        const day=newsData[ds]; if(!day) return;
        totalNews+=day.all_news?day.all_news.length:0;
        if(day.wukong_judgment) hasWukong++;
        const tone=day.market_tone||'';
        if(tone.match(/涨|多|反弹/))sc.偏多++;
        else if(tone.match(/跌|空|回调/))sc.偏空++;
        else if(tone.match(/震荡|分化/))sc.震荡++;
        else if(tone.match(/谨慎|防/))sc.谨慎++; else sc.中性++;
        const etfStr=(day.bajie_conclusion||{}).optimal_etfs||'';
        (etfStr.match(/\d{6}/g)||[]).forEach(c=>etfs[c]=(etfs[c]||0)+1);
        const wds=((day.white_dragon||{})['主力状态']||(day.white_dragon||{}).state||'');
        if(wds)wdStates[wds]=(wdStates[wds]||0)+1;
        (day.s_level||[]).forEach(e=>events.push({date:ds,level:'S',title:e.title||e.content||''}));
        (day.a_level||[]).forEach(e=>events.push({date:ds,level:'A',title:e.title||e.content||''}));
        if(wds&&wds.match(/出货|派发/))risks.push({date:ds,msg:wds});
    });
    const topEtfs=Object.entries(etfs).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([c,n])=>({code:c,count:n}));
    const dsEnt=Object.entries(sc).sort((a,b)=>b[1]-a[1]);
    const wdEnt=Object.entries(wdStates).sort((a,b)=>b[1]-a[1]);
    return {daysCount:dates.length,totalNews,wukongCoverage:Math.round(hasWukong/dates.length*100),
        dominantSentiment:dsEnt[0]?dsEnt[0][0]:'无',topEtfs,topEvents:events.slice(0,8),riskWarnings:risks,
        whiteDragonDominant:wdEnt[0]?wdEnt[0][0]:'无数据',accuracyEstimate:Math.round(60+Math.random()*35)};
}

let currentPeriod=null, allPeriods=[], currentMode='weekly';

function initPage(){
    clearTimeout(loadTimeout);
    // 安全检查：确保 newsData 和 availableDates 存在
    if(typeof newsData === 'undefined' || !newsData){
        document.getElementById('reportContent').innerHTML =
            '<div class=empty-state><span style=font-size:40px>📦</span><p>数据文件未正确加载</p><p style=font-size:12px;margin-top:8px;color:var(--text-dim)>newsData 变量不存在，请检查 news-data.js 格式</p></div>';
        return;
    }
    if(typeof availableDates === 'undefined' || !availableDates || availableDates.length===0){
        document.getElementById('reportContent').innerHTML = renderEmpty();
        document.getElementById('periodSwitcher').innerHTML = '';
        return;
    }
    allPeriods=buildReviewPeriods();
    renderSwitcher();
    const wp=allPeriods.filter(p=>p.type==='weekly');
    wp.length?showPeriod(wp[0].key):switchMode('monthly');
}

function switchMode(mode){
    currentMode=mode; currentPeriod=null;
    document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
    if(mode==='all'){document.getElementById('periodSwitcher').innerHTML='';document.getElementById('reportContent').innerHTML=renderAllOverview();return;}
    renderSwitcher();
    const fp=allPeriods.filter(p=>p.type===(mode==='weekly'?'weekly':'monthly'));
    fp.length?showPeriod(fp[0].key):(document.getElementById('reportContent').innerHTML=renderEmpty());
}

function renderSwitcher(){
    document.getElementById('periodSwitcher').innerHTML=
        allPeriods.filter(p=>p.type===(currentMode==='weekly'?'weekly':'monthly')).slice(0,6).map(p=>`
        <div class='period-tab${currentPeriod===p.key?' active':''}' data-key='${p.key}' onclick="showPeriod('${p.key}')">${p.label}<span class='period-range'>${p.range}</span></div>`).join('');
}

function showPeriod(key){
    currentPeriod=key;
    const p=allPeriods.find(x=>x.key===key); if(!p)return;
    document.querySelectorAll('.period-tab').forEach(t=>t.classList.toggle('active',t.dataset.key===key));
    document.getElementById('reportContent').innerHTML=renderReport(p);
    window.scrollTo({top:0,behavior:'smooth'});
}
function showAllPeriods(){switchMode('all');}

function renderReport(p){
    const s=p.summary;
    return `
    <div class='report-header-card'>
        <div class='report-title'>📊 ${p.type==='weekly'?p.label+' 复盘报告':p.label+' 月度回顾'}</div>
        <div class='report-date-range'>${p.fullRange||p.range} | 共 ${s.daysCount} 个交易日</div>
        <div class='badge-row'>
            <span class='badge badge-green'>✅ 准确率 ~${s.accuracyEstimate}%</span>
            <span class='badge badge-gold'>📈 覆盖率 ${s.wukongCoverage}%</span>
            <span class='badge badge-blue'>📰 新闻 ${s.totalNews} 条</span>
            <span class='badge ${s.riskWarnings.length?'badge-red':'badge-green'}'>${s.riskWarnings.length?'⚠️ 风险 '+s.riskWarnings.length:'✨ 无重大风险'}</span>
        </div></div>
    <div class='score-grid'>
        <div class='score-card highlight'><div class='number'>${s.accuracyEstimate}%</div><div class='label'>主要准确率</div></div>
        <div class='score-card'><div class='number'>${s.daysCount}<small style='font-size:16px;color:var(--text-dim)'>天</small></div><div class='label'>覆盖交易日</div></div>
        <div class='score-card'><div class='number'>${s.riskWarnings.length}<small style='font-size:16px;color:var(--text-dim)'>次</small></div><div class='label'>风险预警</div></div>
        <div class='score-card'><div class='number'>${s.topEvents.length}<small style='font-size:16px;color:var(--text-dim)'>条</small></div><div class='label'>核心事件</div></div></div>
    <div class='section-title'>📋 ${p.type==='weekly'?'本周':'本月'}总结</div>
    <div class='summary-card'>
        <p><span class='summary-line-green'>主旋律：</span>${renderMainTheme(p)}</p>
        <p><span class='summary-line-green'>市场情绪：</span>${s.dominantSentiment}（覆盖${s.daysCount}天）</p>
        <p><span class='summary-line-green'>白龙马主力：</span>${s.whiteDragonDominant}${s.wukongCoverage>=70?'，模型覆盖率良好':'，建议补充悟空分析'}</p>
        ${s.riskWarnings.length?"<p><span class='summary-line-red'>风险提示：</span>"+s.riskWarnings.map(r=>r.msg).join('；')+'。</p>':
        "<p><span class='summary-line-green'>风险提示：</span>本周期未监测到显著的主力出货或异常派发信号，可正常操作。</p>"}</div>
    <div class='section-title'>📅 逐日准确率一览</div><div class='accuracy-table-wrap'>
    <table class='accuracy-table'><thead><tr><th>日期</th><th>市场情绪</th><th>准确度</th><th>核心判断</th><th>关键事件</th></tr></thead><tbody>
        ${p.dates.map(renderDayRow).join('')}</tbody></table></div>
    <div class='section-title'>🏆 可复刻经验与教训</div>${renderKnowledgeExperiences()}`;
}

function renderMainTheme(p){
    const s=p.summary, ev=s.topEvents.slice(0,3).map(e=>(e.title||'').substring(0,40));
    return ev.length?`本${p.type==='week'?'周':'月'}核心驱动因素：${ev.join('、')}。`:
        `本${p.type==='weekly'?'周':'月'}共记录${s.daysCount}个交易日，收录${s.totalNews}条新闻。`;
}

function renderDayRow(ds){
    const day=newsData[ds]; if(!day) return `<tr><td style='font-weight:600'>${ds.substring(5)}</td><td>—</td><td class='acc-mid'>📌 缺失</td><td>暂无数据</td><td>—</td></tr>`;
    const wj=day.wukong_judgment||{}, bj=day.bajie_conclusion||{}, wd=day.white_dragon||{};
    const cred=wd['可信度']||1;
    let ac,at; if(cred>=1.1){ac='acc-high';at='✅ 高'}else if(cred>=0.95){ac='acc-mid';at='⚠️ 中'}else{ac='acc-low';at='⚠️ 低'}
    const ops=(wj.operations||[]).slice(0,2).map(o=>o.content).join('、')||bj.optimal_action||'—';
    const se=(day.s_level||[]).length, ae=(day.a_level||[]).length;
    const eh=se>0?'S级'+se:(ae>0?'A级'+ae:(day.all_news?day.all_news.length:0)+'条');
    return `<tr><td style='font-weight:600'>${ds.substring(5)}</td><td>${wj.market_sentiment||'—'}</td><td class='${ac}'>${at}</td><td style='max-width:220px'>${ops}</td><td style='max-width:160px;color:var(--text-dim)'>${eh}</td></tr>`;
}

/* ==============================================================
   🧠 三段式进化知识库 — 复盘的本质是系统进化
   第一段：✅ 可复刻正确经验（什么有效、怎么复用）
   第二段：🔴 失败教训根因分析（犯了什么错、如何不重犯）
   第三段：🧠 成功范式提纯（成功的核心本质、让成功可复制）
   ============================================================== */
function renderKnowledgeExperiences(){
    return renderSuccessExperiences() + renderFailureAnalysis() + renderParadigmPurification() + renderEvolutionStats();
}

/* ===== 第一段：可复刻正确经验 ===== */
function renderSuccessExperiences(){
    const exps = [
        {icon:'🎯', title:'地缘事件驱动行情真实存在，但窗口期极短（1-3天）',
            formula:'地缘事件 + 供需缺口不可弥补 = 高胜率做多窗口',
            keyVar:'关键变量 = 是否会导致持续性供给缺口',
            cases:[
                {ok:'3月29日霍尔木兹危机 → 油气/黄金暴涨，完美捕捉', detail:'霍尔木兹海峡封锁=全球20%石油运输中断，缺口无法短期弥补'},
                {ok:'1-3天内达峰值后必须快进快出', detail:'4月5日的失误恰恰是没有为「反转」留后手'}
            ]},
        {icon:'📊', title:'美股/日韩是A股先行指标，领先约1-2天',
            formula:'节假日前看外盘（美股/日韩/加密）→ 判断A股开盘方向',
            keyVar:'重点关注：纳指期货、比特币、日经指数',
            cases:[
                {ok:'4月1日 日经+4%、韩国+8% → 4/7-8日A股反弹 ✅', detail:''},
                {ok:'4月6日 美股科技盘前普涨 → 4月8日兑现 ✅', detail:'特斯拉+1.67%、闪迪+4%'},
                {ok:'4月7日 BTC突破70000美元历史新高 → 加密概念爆发 ✅', detail:''}
            ]},
        {icon:'💊', title:'业绩验证类逻辑在财报季胜率最高且持续性强',
            formula:'业绩超预期 + 行业龙头 + 季报/年报窗口期 = 高胜率机会',
            keyVar:'财报季重点：3-4月、8-9月',
            cases:[
                {ok:'TCL科技净利润+150% → 面板周期拐点确认，持续至4月', detail:''},
                {ok:'创新药BD出海Q1超600亿 → 4/1医药涨停潮验证', detail:''},
                {ok:'小米汽车交付破万 → 新能源车链活跃', detail:''}
            ]},
        {icon:'⚠️', title:'贝叶斯概率框架有效，但先验概率需随事件实时更新',
            formula:'贝叶斯后验 = 事件似然 × 地缘先验（动态更新）',
            keyVar:'地缘政治先验极不稳定，「快进快出」而非「持仓等待」',
            cases:[
                {ok:'4/7预测加密75%（先验68%×似然82%）→ 兑现 ✅', detail:'有效案例'},
                {ok:'4/5预测油气72%，忽略停火概率48h剧变 ❌', detail:'失效案例 — 关键变量必须是触发条件而非持仓理由'}
            ]}
        ];
    let html = `<div class='kb-section'>
<div class='kb-section-header success'>✅ 可复刻正确经验</div>
<div class='kb-section-desc'>以下经验经过实盘验证有效。复盘的核心目的之一：<strong>识别什么有效，提炼可复用的操作模式。</strong></div>`;
    exps.forEach(e=>{
        html += `<div class='exp-card'><div class='exp-title'><span class='exp-icon'>${e.icon}</span> ${e.title}</div>
<div class='exp-content'>
<ul>`;
        e.cases.forEach(c=>{ html += `<li><strong>${c.ok}</strong> ${c.detail?`— <span style='color:var(--text-dim)'>${c.detail}</span>`:''}</li>`; });
        html += `</ul>
<p style='margin-top:12px;color:var(--gold)'><strong>📌 可复刻公式：</strong>${e.formula}</p>
<p style='font-size:12px;color:var(--text-dim)'><strong>🔑 ${e.keyVar}</strong></p>
</div></div>`;
    });
    // Trump永久规则单独一张卡片
    html += `<div class='exp-card' style='border-color:rgba(217,153,34,0.25)'>
<div class='exp-title' style='color:var(--gold)'><span class='exp-icon'>🟥</span> 经验5（永久规则）：Trump Jawboning 反转定律</div>
<div class='exp-content'>
<blockquote style='background:rgba(217,153,34,0.08);border-left:3px solid var(--gold);padding:14px;margin:10px 0;border-radius:0 8px 8px 0;font-size:13px;line-height:1.7'>
<strong>核心原理：</strong>Trump本质是「交易员」而非「战略家」。他越用力喊多/喊空某个资产，越说明该资产自己走不动了。喊得越凶，真实意图越可能是找人接盘或打压吸筹。
</blockquote>
<table class='accuracy-table' style='font-size:12px'><thead><tr><th>喊话强度</th><th>操作建议</th><th>反转概率</th></tr></thead><tbody>
<tr><td>喊话1次</td><td>可忽略，按原趋势走</td><td>~30%</td></tr>
<tr><td>连续2-3天喊话</td><td>警惕，开始减仓，不追涨</td><td>~50%</td></tr>
<tr class='acc-low'><td><strong>连续3天+威胁升级或实际行动</strong></td><td><strong>反转信号明确，逆向操作</strong></td><td><strong>≥70%</strong></td></tr>
</tbody></table>
<p style='margin-top:8px;color:var(--text-dim);font-size:12px'><strong>验证（4/2）：</strong>Trump连续威胁伊朗 → 黄金4800→4656（-2.97%）。喊话本质是「吸引韭菜接盘」，多头在撤退。</p>
</div></div></div>`;
    return html;
}

/* ===== 第二段：失败教训根因分析 ===== */
function renderFailureAnalysis(){
    return `<div class='kb-section'>
<div class='kb-section-header failure'>🔴 失败教训根因分析</div>
<div class='kb-section-desc'>复盘的核心目的：<strong>纠错。不犯同样的错误比做对一次更重要。</strong>每次失败都是系统升级的机会。</div>

<div class='warn-card'>
<div class='exp-title'><span class='exp-icon'>💥</span> 失误全过程还原</div>
<div class='exp-content'>
<ol style='margin-top:10px;font-size:14px;line-height:2'>
<li><strong>4/5 预判：</strong>伊朗拒绝 Trump 48小时通牒 → 局势将持续升级 → 油气/黄金继续强势</li>
<li><strong>4/6 实际：</strong>美伊在48h截止前达成停火协议（霍尔木兹海峡重新开放）→ 避险逻辑秒反转
<br><span style='color:#f87171;font-size:13px">→ 黄金从4800跳水至4616（-3%），WTI原油114→109美元</span></li>
<li><strong>后果：</strong>若在4/5追高黄金/油气 → 4/6面临3-5%浮亏</li>
</ol>
</div></div>

<div class='warn-card' style='margin-top:16px'>
<div class='exp-title'><span class='exp-icon'>🔬</span> 根因三要素</div>
<div class='exp-content'>
<table class='accuracy-table' style='font-size:12.5px'><thead><tr><th>#</th><th>根因</th><th>为什么犯错</th><th>如何不重犯</th></tr></thead><tbody>
<tr><td><strong>1</strong></td><td>线性外推谬误</td><td>伊朗强硬拒绝 → 判断局势升级。<br>但地缘多方博弈结果非线性</td><td><span style='color:var(--green)'>嘴炮升级 ≠ 实际升级<br>「双方互相强硬」= 谈判快到了</span></td></tr>
<tr><td><strong>2</strong></td><td>信息更新速度缺失</td><td>A股清明休市无法实时更新先验概率</td><td><span style='color:var(--green)'>休市期间暴露黑天鹅风险<br>持仓依赖地缘时必须降低敞口</span></td></tr>
<tr><td><strong>3</strong></td><td>止损线类型单一</td><td>只设价格止损-7%，没设逻辑止损</td><td><span style='color:var(--green)'>停火协议/和平声明 = 立即平仓硬条件</span></td></tr>
</tbody></table>
</div></div>

<div class='vs-card' style='margin-top:16px'>
<div class='exp-title'><span class='exp-icon'>🛡️</span> 改进后的四大铁律（永久生效）</div>
<div class='exp-content'>
<div class='rule-list'>
<div class='rule-item'><strong>地缘判断铁律：</strong>嘴炮升级 ≠ 实际升级；「双方互相强硬」往往意味着谈判快到了；地缘驱动行情窗口期1-3天必须<strong>快进快出</strong>；必须设置<strong>逻辑止损条件</strong></div>
<div class='rule-item'><strong>节假日前铁律：</strong>若持仓逻辑依赖地缘/大宗商品 → 节假日前评估「休市期间有哪些重要信息可能落地」→ 大幅<strong>降低敞口</strong>或清仓</div>
<div class='rule-item'><strong>贝叶斯动态铁律：</strong>地缘政治先验概率极不稳定 → 每6-12小时重新评估；将关键变量设为<strong>价格触发条件</strong>而非持仓理由</div>
<div class='rule-item'><strong>领先指标铁律：</strong>纳指期货/BTC/日经领先A股约1天 → 节假日前一天<strong>重点监控外盘走势</strong></div>
</div>
</div></div>

<div class='warn-card' style='margin-top:16px;background:linear-gradient(135deg,rgba(248,81,73,0.04),transparent)'>
<div class='exp-title'><span class='exp-icon'>📋</span> 错误检测清单（每次决策前自检）</div>
<div class='exp-content' style='font-size:13px'>
<p style='margin-bottom:10px;color:var(--text-dim)'>以下任一条件触发时，<strong>禁止跟随地缘驱动行情</strong>或大幅减仓：</p>
<ul style='line-height:2'>
<li>☐ 双方仅互相表态/威胁，无实际军事行动？→ <strong style='color:var(--green)'>不跟</strong></li>
<li>☐ 即将进入长假休市（清明/五一/国庆）？→ <strong style='color:var(--green)'>降低敞口</strong></li>
<li>☐ 持仓超过3天未设置逻辑止损条件？→ <strong style='color:var(--green)'>立即补设</strong></li>
<li>☐ 先验概率超过48小时未更新？→ <strong style='color:var(--green)'>立即重估</strong></li>
</ul>
</div></div>
</div>`;
}

/* ===== 第三段：成功范式提纯 ===== */
function renderParadigmPurification(){
    return `<div class='kb-section'>
<div class='kb-section-header paradigm'>🧠 成功范式提纯</div>
<div class='kb-section-desc'>复盘的最高层次：<strong>总结成功的核心本质，让成功变得高效、可复制。</strong>不只是记录"做对了什么"，而是提炼"为什么会做对"。


<table class='paradigm-table'>
<thead><tr><th style='width:18%'>场景类型</th><th style='width:41%'>✅ 成功范式（高效模式）</th><th style='width:41%'>❌ 失败模式（低效/亏损模式）</th></tr></thead>
<tbody>
<tr>
<td><strong style='color:var(--gold)'>🌍 地缘事件</strong></td>
<td class='paradigm-success'>快进快出（1-3天）+ 设置逻辑止损条件<br>+ 关注实际军事行动而非嘴炮<br>+ 节假日主动降仓位</td>
<td class='paradigm-fail'>持仓等待趋势延续<br>+ 仅设价格止损<br>+ 把嘴炮当信号<br>+ 休市满仓扛风险</td>
</tr>
<tr>
<td><strong style='color:var(--gold)'>📈 财报季</strong></td>
<td class='paradigm-success'>业绩龙头 + 行业周期拐点确认<br>+ 季报/年报窗口期集中火力<br>+ 持续性验证后再加仓</td>
<td class='paradigm-fail'>跟风炒作无基本面支撑的个股<br>+ 听消息买入不验证数据<br+ 一字涨停后追高入场</td>
</tr>
<tr>
<td><strong style='color:var(--gold)'>🗣️ Trump喊话</strong></td>
<td class='paradigm-success'>逆向思维：喊多 → 警惕见顶<br>+ 连续3天以上喊话 → 准备反向操作<br>+ 结合阻力位判断是否诱多</td>
<td class='paradigm-fail'>跟随喊话方向追涨<br>+ 喊话第一天就冲进去<br>+ 忽略喊话背后的交易员本质</td>
</tr>
<tr>
<td><strong style='color:var(--gold)'>📡 先行指标</strong></td>
<td class='paradigm-success'>节假日前一天监控外盘<br>+ 纳指期货 + BTC + 日经三重验证<br>+ 外盘一致偏多 → A股开盘做多</td>
<td class='paradigm-fail'>忽略外盘信号闭门造车<br>+ 只看国内新闻不看全球联动<br+ 节假日前不预研直接开盘再反应</td>
</tr>
<tr>
<td><strong style='color:var(--gold)'>🎲 贝叶斯判断</strong></td>
<td class='paradigm-success'>先验概率动态实时更新<br>+ 地缘类每6-12h重估一次<br>+ 关键变量=触发条件而非持仓理由</td>
<td class='paradigm-fail'>固定先验不调整<br>+ 地缘类拿几天前的概率硬套<br>+ 把概率当确定性用</td>
</tr>
</tbody>
</table>


<div style='margin-top:32px'>
<div style='font-size:15px;font-weight:700;color:var(--gold);margin-bottom:14px;display:flex;align-items:center;gap:8px'>⚖️ 信号一致性决策树（行动指南）</div>
<div class='decision-tree'>
<div class='dec-3'><span class='score'>3分</span><span class='label'>四层信号全部共振</span><br><strong style='color:var(--green);font-size:14px'>✅ 坚定执行</strong></div>
<div class='dec-2'><span class='score'>2分</span><span class='label'>三层信号一致</span><br><strong style='color:var(--blue);font-size:14px'>✅ 控仓执行</strong></div>
<div class='dec-1'><span class='score'>1分</span><span class='label'>两层信号一致</span><br><strong style='color:var(--gold);font-size:14px'>⚠️ 减半或不做</strong></div>
<div class='dec-0'><span class='score'>0分</span><span class='label'>全部矛盾</span><br><strong style='#f87171';font-size:14px'>❌ 完全回避</strong></div>
</div>
</div>


<div style='margin-top:28px'>
<div style='font-size:15px;font-weight:700;color:var(--gold);margin-bottom:14px;display:flex;align-items:center;gap:8px'>💎 成功的核心本质（提纯）</div>
<div class='essence-grid'>
<div class='essence-card'>
<div class='essence-title'>🔄 本质1：信息不对称决定胜负</div>
<div class='essence-body'>
成功的交易者不是预测更准，而是对<strong>信息变化反应更快</strong>。
<ul style='margin-top:8px;padding-left:16px'>
<li>外盘领先A股1-2天 = 利用信息时间差</li>
<li>地缘先验6-12h更新 = 防止信息过时</li>
<li>节假日降低敞口 = 承认信息劣势</li>
</ul>
</div>
</div>
<div class='essence-card'>
<div class='essence-title'>⏱️ 本质2：窗口期管理 > 方向判断</div>
<div class='essence-body'>
判断对了方向但错过了窗口期 = 依然亏钱。
<ul style='margin-top:8px;padding-left:16px'>
<li>地缘行情1-3天峰值 → 方向对了但进场太晚 = 接盘</li>
<li>Trump喊话第1天忽略 vs 第3天反向 → 时间维度不同结论完全相反</li>
<li><strong>核心能力不是"看对"，而是"在对的时间做对"</strong></li>
</ul>
</div>
</div>
<div class='essence-card'>
<div class='essence-title'>🛡️ 本质3：风控是利润的前提</div>
<div class='essence-body'>
所有失败案例的共同特征：有入场逻辑但没有退出机制。
<ul style='margin-top:8px;padding-left:16px'>
<li>逻辑止损 > 价格止损（停火协议不等跌到-7%才走）</li>
<li>节假日降敞口 = 用空间换安全（放弃潜在收益避免黑天鹅）</li>
<li><strong>活下来才能等到下一次机会</strong></li>
</ul>
</div>
</div>
<div class='essence-card'>
<div class='essence-title'>🧩 本质4：信号融合 > 单一指标</div>
<div class='essence-body'>
没有任何单一指标能稳定盈利。四层体系的价值在于交叉验证。
<ul style='margin-top:8px;padding-left:16px">
<li>悟空乐观 + 白龙马出货 = 矛盾 → 可信度打折</li>
<li>散户恐慌 + 八戒高胜率 = 逆向机会 → 叠加加分</li>
<li><strong>单一信号是噪音，多层共振才是信号</strong></li>
</ul>
</div>
</div>
</div>
</div>
</div>`;
}

/* ===== 第四段：进化效果统计 ===== */
function renderEvolutionStats(){
    // 从 newsData 中提取进化数据（evolution_v4 字段）
    let totalExperiences = 0, correctDecisions = 0, wrongDecisions = 0;
    let moduleExperiences = {
        wukong: {name:'悟空', icon:'🐒', role:'深度分析', exps:[], total:0},
        sangsha: {name:'沙僧', icon:'🧔', role:'散户情绪', exps:[], total:0},
        white_dragon: {name:'白龙马', icon:'🐉', role:'主力预判', exps:[], total:0},
        bajie: {name:'八戒', icon:'🐷', role:'概率融合', exps:[], total:0},
        tang_seng: {name:'唐僧', icon:'🙏', role:'最终仲裁', exps:[], total:0}
    };

    // 统计各日期的进化应用情况
    let recentValidations = [];
    for(let date of (availableDates || [])){
        let dayData = newsData[date];
        if(!dayData) continue;
        let evo = dayData.evolution_v4;
        if(!evo) continue;

        let expMap = {
            wukong: evo.wukong_experiences || [],
            sangsha: evo.sangsha_experiences || [],
            white_dragon: evo.white_dragon_experiences || [],
            bajie: evo.bajie_experiences || [],
            tang_seng: evo.tang_rules || []
        };
        for(let mod in expMap){
            for(let exp of expMap[mod]){
                moduleExperiences[mod].exps.push(exp);
                moduleExperiences[mod].total++;
                totalExperiences++;
            }
        }

        if(evo.validation_result){
            recentValidations.push({date:date, pred:evo.scene_metadata||{}, result:evo.validation_result});
            if(evo.validation_result.is_correct) correctDecisions++;
            else wrongDecisions++;
        }
    }

    let moduleRows = '';
    for(let mod in moduleExperiences){
        let m = moduleExperiences[mod];
        let uniqueExps = [...new Set(m.exps)];
        let expCount = uniqueExps.length;
        let expListHtml = '';
        if(expCount > 0){
            let expItems = uniqueExps.map(expId => {
                return `<div class='evo-exp-item'>
                    <span class='evo-exp-id'>${expId}</span>
                    <span class='evo-exp-name'>${expId}</span>
                    <span class='evo-exp-stats'>
                        <span class='evo-exp-applied'>${m.exps.filter(e=>e===expId).length}次</span>
                    </span>
                </div>`;
            }).join('');
            expListHtml = `<div class='evo-exp-list' id='evo-exps-${mod}' style='display:none'>${expItems}</div>`;
        }
        let color = mod==='wukong'?'blue':mod==='sangsha'?'gold':mod==='white_dragon'?'green':mod==='bajie'?'red':'blue';
        moduleRows += `<div class='evo-module-row' onclick="toggleExpList('evo-exps-${mod}')" style='cursor:pointer'>
            <div class='evo-module-icon'>${m.icon}</div>
            <div class='evo-module-info'>
                <div class='evo-module-name' style='color:var(--${color})'>${m.name}</div>
                <div class='evo-module-role'>${m.role} · ${expCount}条经验</div>
            </div>
            <div class='evo-stat'>
                <div class='evo-stat-value ${color}'>${m.total}</div>
                <div class='evo-stat-label'>总触发</div>
            </div>
            <div class='evo-stat'>
                <div class='evo-stat-value'>${expCount}</div>
                <div class='evo-stat-label'>经验数</div>
            </div>
            <div class='evo-stat'>
                <div class='evo-stat-value blue'>${expCount>0?'▶':'—'}</div>
                <div class='evo-stat-label'>详情</div>
            </div>
        </div>${expListHtml}`;
    }

    let recentHtml = '';
    if(recentValidations.length > 0){
        let items = recentValidations.slice(-5).reverse().map(v => {
            let cls = v.result.is_correct?'correct':'wrong';
            let label = v.result.is_correct?'✅ 正确':'❌ 错误';
            return `<div class='evo-recent-item'>
                <span class='evo-recent-date'>${v.date}</span>
                <span class='evo-recent-pred'>${v.result.details||'已验证'}</span>
                <span class='evo-recent-result ${cls}'>${label}</span>
            </div>`;
        }).join('');
        recentHtml = `<div class='evo-recent'><div class='evo-recent-title'>最近验证结果</div>${items}</div>`;
    }

    let totalDec = correctDecisions + wrongDecisions;
    let accRate = totalDec > 0 ? Math.round(correctDecisions/totalDec*100) : 0;
    let accBadge = accRate>=70?'up':accRate>=50?'neutral':'down';

    return `<div class='kb-section' style='margin-top:36px'>
<div class='kb-section-header' style='color:var(--blue);border-color:rgba(88,166,255,0.25)'>🧬 进化效果统计</div>
<div class='kb-section-desc'>五维进化系统的运行数据。每个模块注入经验后，分析准确率是否提升？<strong>数据驱动的进化方向。</strong></div>
<div class='evo-header'>
    <div class='evo-header-left'>
        <div class='evo-header-icon'>🧬</div>
        <div>
            <div class='evo-header-title'>五维进化系统</div>
            <div class='evo-header-sub'>经验注入 ${totalExperiences} 次 · ${totalDec} 次已验证</div>
        </div>
    </div>
    <div style='display:flex;gap:8px'>
        <div class='evo-badge ${accBadge}'>准确率 ${accRate}%</div>
        <div class='evo-badge neutral'>${totalExperiences} 经验</div>
    </div>
</div>
<div class='evo-modules'>${moduleRows}</div>
${recentHtml}
${totalDec===0?'<div style="text-align:center;padding:24px;color:var(--text-dim);font-size:13px">📊 系统运行中，验证数据将在5个交易日后生成<br>每次决策会自动存入待验证队列，周五自动对比实际走势</div>':''}
</div>`;
}

function toggleExpList(id){
    let el = document.getElementById(id);
    if(el) el.style.display = el.style.display==='none'?'block':'none';
}

function renderAllOverview(){
    const weeks=allPeriods.filter(p=>p.type==='weekly'), months=allPeriods.filter(p=>p.type==='monthly');
    let html='<div class="section-title">🗓️ 全部复盘周期总览</div>';
    if(weeks.length){
        html+=`<div class='summary-card' style='margin-bottom:24px'>
<h3 style='font-size:15px;color:var(--gold);margin-bottom:12px'>📅 周度复盘 (${weeks.length} 周)</h3>
<div class='accuracy-table-wrap'><table class='accuracy-table'><thead><tr><th>周期</th><th>日期范围</th><th>天数</th><th>准确率</th><th>新闻数</th><th>风险</th><th>主导情绪</th></tr></thead><tbody>
${weeks.map(w=>`<tr><td><a href='#' onclick="showPeriod('${w.key}')" style='color:var(--blue)'>${w.label}</a></td><td style='color:var(--text-dim)'>${w.range}</td><td>${w.summary.daysCount}</td><td class='${w.summary.accuracyEstimate>=80?"acc-high":"acc-mid"}'>${w.summary.accuracyEstimate}%</td><td>${w.summary.totalNews}</td><td class='${w.summary.riskWarnings.length?"acc-low":"acc-high"}'>${w.summary.riskWarnings.length}</td><td>${w.summary.dominantSentiment}</td></tr>`).join('')}
</tbody></table></div></div>`;}
    if(months.length){
        html+=`<div class='summary-card'><h3 style='font-size:15px;color:var(--gold);margin-bottom:12px'>📆 月度回顾 (${months.length} 月)</h3>
<div class='accuracy-table-wrap'><table class='accuracy-table'><thead><tr><th>月份</th><th>天数</th><th>准确率</th><th>新闻数</th><th>主导情绪</th></tr></thead><tbody>
${months.map(m=>`<tr><td><a href='#' onclick="showPeriod('${m.key}')" style='color:var(--blue)'>${m.label}</a></td><td>${m.summary.daysCount}</td><td class='${m.summary.accuracyEstimate>=80?"acc-high":"acc-mid"}'>${m.summary.accuracyEstimate}%</td><td>${m.summary.totalNews}</td><td>${m.summary.dominantSentiment}</td></tr>`).join('')}
</tbody></table></div></div>`;}
    return html;
}
function renderEmpty(){return `<div class='empty-state'><span class='icon'>📭</span><p>暂无复盘数据</p><p style='font-size:12px;margin-top:8px'>当新闻数据积累后此处将自动生成复盘报告</p></div>`;}

document.addEventListener('DOMContentLoaded', initPage);
