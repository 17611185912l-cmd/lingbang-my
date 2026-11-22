import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const spec = JSON.parse(fs.readFileSync(path.join(root, 'src/spec/prototype-spec.json'), 'utf8'));
const { metadata, requirements, sections, contexts, decisions } = spec;
const check = process.argv.includes('--check');
const failures = [];
const unique = (items, label) => {
  const ids = items.map(item => item.id);
  if (new Set(ids).size !== ids.length) failures.push(`${label}编号重复`);
  return new Set(ids);
};
const reqIds = unique(requirements, '需求');
const sectionIds = unique(sections, '章节');
unique(contexts, '场景');
unique(decisions, '规则决策');
for (const d of decisions) if (![d.status, d.resolution, d.followUp, d.impact].every(Boolean)) failures.push(d.id + '缺少状态/决策/联调项/影响');
const cases = sections.flatMap(section => section.cases);
unique(cases, '验收场景');
for (const section of sections) {
  for (const id of section.requirements) if (!reqIds.has(id)) failures.push(`${section.id}引用未知需求${id}`);
  for (const [key, size] of [['actions', 5], ['fields', 6], ['states', 3]]) {
    if (section[key].some(row => row.length !== size)) failures.push(`${section.id}的${key}列数不符`);
  }
  for (const test of section.cases) {
    if (![test.given, test.when, test.then, test.stage].every(Boolean)) failures.push(`${test.id}缺少前置/步骤/预期/阶段`);
    for (const id of test.requirements) if (!reqIds.has(id)) failures.push(`${test.id}引用未知需求${id}`);
  }
}
for (const req of requirements) if (!cases.some(test => test.requirements.includes(req.id))) failures.push(`${req.id}没有验收场景`);
for (const context of contexts) for (const id of context.sections) if (!sectionIds.has(id)) failures.push(`${context.id}引用未知章节${id}`);
if (failures.length) throw new Error(failures.join('\n'));

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
const mdTable = (heads, rows) => `\n| ${heads.map(cell).join(' | ')} |\n| ${heads.map(() => '---').join(' | ')} |\n${rows.map(row => `| ${row.map(cell).join(' | ')} |`).join('\n')}\n`;
const htmlTable = (heads, rows) => `<div class="table-scroll"><table><thead><tr>${heads.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const actionHeads = ['入口/控件', '触发', '结果/去向', '返回/取消', '状态保留'];
const fieldHeads = ['字段', '类型/来源', '必填/显示条件', '格式/约束', '示例', '缺失/异常/边界'];
const stateHeads = ['状态/前置', '事件/条件', '预期呈现'];
const caseHeads = ['用例依据ID', '需求', '阶段', '前置条件', '操作/事件', '预期结果'];
const requirementRows = requirements.map(req => [req.id, req.area, req.title, req.basis, req.implementation,
  sections.filter(s => s.requirements.includes(req.id)).map(s => s.title).join('；'),
  cases.filter(c => c.requirements.includes(req.id)).map(c => c.id).join('、')]);
const reqHeads = ['需求ID', '模块', '需求内容', '确认依据', '实现状态', '说明章节', '验收场景引用'];
const intro = `更新：${metadata.updated}；原型基线：${metadata.baseVersion}；说明修订：${metadata.revision}。\n\n${metadata.intro}\n\n${metadata.reference}\n\n共${requirements.length}项需求、${sections.length}个说明章节、${contexts.length}种页面/浮层场景、${cases.length}条可细化为测试用例的验收场景、${decisions.length}项规则决策。\n\n场景阶段：原型验收在当前页面执行；算法核验可用受控数据/时间执行；接口联调需要真实或模拟服务端，不代表网页已实现；工具校验用于说明同步。已确认规则和已采纳方案分别记录；尚未给出的联调参数不预设生产默认值。`;
let md = `# ${metadata.title}\n\n${intro}\n\n## 需求列表\n${mdTable(reqHeads, requirementRows)}\n## 说明目录\n\n${sections.map((s, i) => `${i + 1}. [${s.title}](#${s.id})`).join('\n')}\n\n`;
for (const s of sections) {
  md += `<a id="${s.id}"></a>\n\n## ${s.title}\n\n关联需求：${s.requirements.join('、')}。\n\n${s.summary}\n\n实现核对位置：${s.sources.map(source => '`' + source + '`').join('、')}。\n`;
  if (s.actions.length) md += `\n### 点击、去向、返回和状态保留\n${mdTable(actionHeads, s.actions)}`;
  if (s.fields.length) md += `\n### 字段与约束\n${mdTable(fieldHeads, s.fields)}`;
  if (s.states.length) md += `\n### 状态与边界矩阵\n${mdTable(stateHeads, s.states)}`;
  if (s.rules.length) md += `\n### 联动与业务边界\n\n${s.rules.map(rule => '- ' + rule).join('\n')}\n`;
  md += `\n### 验收场景与测试用例输入\n${mdTable(caseHeads, s.cases.map(c => [c.id, c.requirements.join('、'), c.stage, c.given, c.when, c.then]))}\n`;
}
md += `<a id="decisions"></a>\n\n## 规则决策与剩余联调清单\n\n以下记录用户本轮确认及采纳的方案；本期不做与剩余联调参数分别标明。接口联调仍不等于原型已实现。\n`;
for (const p of decisions) md += `\n### ${p.id} ${p.title}\n\n- 状态：${p.status}\n- 决策：${p.resolution}\n- 影响：${p.impact}\n- 剩余联调项：${p.followUp}\n`;
md += `\n## 测试设计覆盖清单\n\n- 角色/身份组合：未开通、有效、到期会员 × 创客未开通/已开通；三类邀请对象均覆盖。\n- 路径组合：个人中心直接进入、会员中转奖励、历史返回、海报关闭、返回/刷新、窄屏与键盘。\n- 数值边界：N=0/1/9/10/11/12/19/20、重复用户、重复注册事件、并发跨门槛、月底/闰年、到期前1毫秒/截止时刻/截止后。\n- 券状态：可用、已用、过期及各自空态；排序、张数/记录数/面额/月数单位、期限展示、过期刷新、并发核销。\n- 输入边界：空、纯空格、长度下限/上限/超限、中文/字母/多码元、手机位数/格式/空格、切换隐藏字段、草稿保留。\n- 外部能力：支付成功/取消/失败/回调延迟/重放；注册归因；部分发奖失败重试；海报资源失败/下载；微信取消；接口错误/断网/鉴权。\n- 需求追踪：以上验收场景是用例设计输入，测试员应按项目模板拆分步骤、数据、环境、优先级、实际结果及缺陷；接口联调场景不得勾选为网页已验证。\n\n## 说明维护\n\n单一来源：\`src/spec/prototype-spec.json\`。修改业务页面时同步此数据，运行\`npm run docs:build\`生成页面可读文件和Markdown，运行\`npm run docs:check\`验证一致性。页面运行状态通过业务组件订阅联动；不是通过静态URL猜测页面，也不自动把尚未评审的代码变更当成已确认业务。1.0和2.0存档保持原样，本轮说明属于当前工作副本。\n`;
const listMd = `# 领榜个人中心 · 需求列表\n\n${intro}\n\n完整字段、交互、状态及验收：[原型开发与测试说明](原型开发与测试说明.md)。\n${mdTable(reqHeads, requirementRows)}\n## 规则决策\n${mdTable(['编号', '事项', '状态', '决策', '剩余联调项', '影响'], decisions.map(p => [p.id, p.title, p.status, p.resolution, p.followUp, p.impact]))}\n`;
const htmlSections = sections.map(s => `<section id="${s.id}"><p class="eyebrow">${esc(s.requirements.join(' · '))}</p><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p><p class="sources">实现核对：${esc(s.sources.join('；'))}</p>${s.actions.length ? '<h3>点击、去向、返回和状态保留</h3>' + htmlTable(actionHeads,s.actions) : ''}${s.fields.length ? '<h3>字段与约束</h3>' + htmlTable(fieldHeads,s.fields) : ''}${s.states.length ? '<h3>状态与边界矩阵</h3>' + htmlTable(stateHeads,s.states) : ''}${s.rules.length ? '<h3>联动与业务边界</h3><ul>' + s.rules.map(r=>`<li>${esc(r)}</li>`).join('') + '</ul>' : ''}<h3>验收场景与测试用例输入</h3>${htmlTable(caseHeads,s.cases.map(c=>[c.id,c.requirements.join('、'),c.stage,c.given,c.when,c.then]))}<a href="#top" class="back">返回目录 ↑</a></section>`).join('');
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(metadata.title)}</title><style>
:root{font:14px/1.85 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#253d34;background:#f2f5f3}*{box-sizing:border-box}body{max-width:1440px;margin:0 auto;padding:36px 28px 72px}h1{font-size:28px;line-height:1.4;margin:8px 0 16px}h2{font-size:22px;line-height:1.5;margin:0 0 12px}h3{font-size:16px;margin:24px 0 10px}p{margin:8px 0}a{color:#007c6b;text-underline-offset:3px}header,section{padding:28px;background:#fff;border:1px solid #dfe8e2;border-radius:14px;margin-bottom:22px;scroll-margin-top:20px}.eyebrow,.sources,.meta{font-size:12px;color:#72877a}.eyebrow{color:#00816b;font-weight:600}.toolbar{display:flex;gap:18px;flex-wrap:wrap;margin:18px 0}.toc{columns:2;column-gap:32px}.toc li{break-inside:avoid;margin:3px 0}.table-scroll{overflow:auto;max-height:none}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #dfe8e2;padding:10px 12px;vertical-align:top;min-width:90px;overflow-wrap:anywhere}th{background:#edf5f0;color:#2a5d48;text-align:left}td:first-child{font-weight:600}li{margin:7px 0}.back{display:inline-block;margin-top:18px;font-size:12px}.decisions-item{padding:16px 0;border-top:1px solid #e6ece8}.decisions-item:first-of-type{border:0}@media(max-width:700px){body{padding:18px 12px}header,section{padding:18px}.toc{columns:1}h1{font-size:23px}}@media print{:root{background:#fff}body{padding:0;font-size:10pt;max-width:none}header,section{border:0;padding:12px 0;break-before:auto}.toolbar,.back{display:none}table{font-size:8pt}tr{break-inside:avoid}.table-scroll{overflow:visible}a{color:inherit;text-decoration:none}}
</style></head><body><header id="top"><p class="eyebrow">原型基线 ${esc(metadata.baseVersion)} · 说明 ${esc(metadata.revision)}</p><h1>${esc(metadata.title)}</h1><p class="meta">${esc(metadata.updated)} · ${requirements.length}项需求 · ${sections.length}个章节 · ${cases.length}条验收场景 · ${decisions.length}项规则决策</p><p>${esc(metadata.intro)}</p><p>${esc(metadata.reference)}</p><p>验收分原型、算法、接口联调和工具四类；接口联调能力不等于当前网页已实现。规则确认与剩余联调参数见决策清单。</p><nav class="toolbar"><a href="/">打开交互原型</a><a href="原型开发与测试说明.md" download>下载完整Markdown</a><a href="需求列表.md" download>下载需求列表</a><a href="#requirements">需求列表</a><a href="#decisions">规则决策</a></nav><ol class="toc">${sections.map(s=>`<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('')}</ol></header><section id="requirements"><h2>需求列表</h2>${htmlTable(reqHeads, requirementRows)}</section>${htmlSections}<section id="decisions"><h2>规则决策与剩余联调清单</h2>${decisions.map(p=>`<article class="decisions-item"><h3>${esc(p.id)} ${esc(p.title)}</h3><p><b>状态：</b>${esc(p.status)}</p><p><b>决策：</b>${esc(p.resolution)}</p><p><b>影响：</b>${esc(p.impact)}</p><p><b>剩余联调项：</b>${esc(p.followUp)}</p></article>`).join('')}</section><footer>内容源：src/spec/prototype-spec.json。修改后运行npm run docs:build；禁止独立手改生成物。1.0/2.0版本存档不随本轮变更。</footer></body></html>\n`;
const outputs = new Map([
  ['docs/原型开发与测试说明.md', md], ['docs/需求列表.md', listMd],
  ['public/docs/原型开发与测试说明.md', md], ['public/docs/需求列表.md', listMd],
  ['public/docs/原型开发与测试说明.html', html],
]);
for (const [relative, text] of outputs) {
  const target = path.join(root, relative);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target,'utf8') !== text) failures.push(`未同步：${relative}`);
  } else {
    fs.mkdirSync(path.dirname(target), {recursive:true});
    fs.writeFileSync(target, text);
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`${check ? 'Checked' : 'Generated'} docs: ${requirements.length} requirements, ${sections.length} sections, ${contexts.length} scenes, ${cases.length} acceptance cases, ${decisions.length} rule decisions.`);
