const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const overviewScreen = $('#overviewScreen');
const billScreen = $('#billScreen');
const detailScreen = $('#followRecordScreen');
const toast = $('#toast');
const members = [
  ['张三','12000000003','parent',true,'¥ 12,112.50'],
  ['李明','12000000007','parent',true,'¥ 8,920.00'],
  ['王教员','12000000005','teacher,parent',false,'¥ 6,580.00'],
  ['赵敏','12000000006','parent',false,'¥ 3,260.50'],
  ['刘洋','12000000004','parent',false,'¥ 15,680.00'],
  ['陈教员','12000000008','teacher',false,'¥ 10,240.00'],
  ['严教员','12000000110','teacher',false,'¥ 2,480.00'],
  ['韩雪','12000000101','parent',true,'¥ 1,680.00'],
  ['曹宇','12000000102','parent',true,'¥ 2,415.50'],
  ['宋教员','12000000103','teacher,parent',false,'¥ 3,151.00'],
  ['杜晨','12000000104','parent',false,'¥ 3,886.50'],
  ['马欣','12000000105','parent',false,'¥ 4,622.00'],
  ['谢教员','12000000106','teacher',false,'¥ 5,357.50'],
  ['安教员','12000000108','teacher',false,'¥ 6,828.50']
].map(([name,phone,roles,hasOrders,profit],index) => ({name,phone,roles:roles.split(','),hasOrders,profit,city:'陕西.西安',followText:'',followTime:'今天 13:43',revisitRecords:[],level:'一星',registerDate:teamDate(index<2?0:index),teamCount:index===0?8:5,teamToday:index===0?2:1}));
const commissionRecords = [
  ['parent','陈小满','13800138001','08.22 10:32','18','settled'],
  ['parent','王晓琳','13900139002','08.21 16:18','128','pending'],
  ['parent','赵一诺','13700137003','08.20 14:06','68','settled'],
  ['parent','孙可欣','13600136004','08.19 11:24','88','pending'],
  ['parent','郑雨桐','13500135005','08.18 09:42','198','settled'],
  ['teacher','黄教员','13400134006','08.17 15:16','30','pending'],
  ['cooperation','刘子涵','13300133007','08.16 18:36','26','settled'],
  ['parent','吴思远','13200132008','08.15 13:08','96','pending'],
  ['cooperation','宋佳宁','13100131009','08.14 10:52','188','settled'],
  ['parent','方晨曦','13000130010','08.13 16:44','18','settled'],
  ['teacher','何教员','13900139011','08.12 09:20','30','settled'],
  ['cooperation','唐可','13800138012','08.11 17:02','36','pending']
].map(([type,user,phone,date,amount,status]) => ({type,user,phone,date,amount,status}));
commissionRecords.push(...commissionRecords.map((item,index) => ({...item,date:item.date.replace('08.','07.'),amount:String(Number(item.amount)+index+6),status:index%3===0?'pending':item.status})));
const parentCommissionDetails = [
  ['XQ202608220032','王教员','13900139001'],
  ['XQ202608210041','李教员','13800138002'],
  ['XQ202608200018','张教员','13700137003'],
  ['XQ202608190027','赵教员','13600136004'],
  ['XQ202608180056','刘教员','13500135005'],
  ['XQ202608150063','周教员','13400134006'],
  ['XQ202608130074','吴教员','13300133007'],
  ['XQ202607220032','王教员','13900139001'],
  ['XQ202607210041','李教员','13800138002'],
  ['XQ202607200018','张教员','13700137003'],
  ['XQ202607190027','赵教员','13600136004'],
  ['XQ202607180056','刘教员','13500135005'],
  ['XQ202607150063','周教员','13400134006'],
  ['XQ202607130074','吴教员','13300133007']
];
let parentCommissionIndex = 0;
commissionRecords.forEach(item => {
  if(item.type !== 'parent') return;
  const [orderId,teacherName,teacherPhone] = parentCommissionDetails[parentCommissionIndex++] || parentCommissionDetails[0];
  Object.assign(item,{orderId,teacherName,teacherPhone});
});
const teacherCommissionOrders={
 '黄教员':'XQ202608170006',
 '何教员':'XQ202608120011'
};
const cooperationCommissionDetails={
 '刘子涵':{orderId:'XQ202608160007',parentName:'陈小满',parentPhone:'13800138001',teacherName:'王教员',teacherPhone:'13900139001'},
 '宋佳宁':{orderId:'XQ202608140009',parentName:'孙可欣',parentPhone:'13600136004',teacherName:'赵教员',teacherPhone:'13700137003'},
 '唐可':{orderId:'XQ202608110012',parentName:'郑雨桐',parentPhone:'13500135005',teacherName:'刘教员',teacherPhone:'13400134006'}
};
commissionRecords.forEach(item=>{
 const monthOrderId=id=>item.date.startsWith('07')?id.replace('202608','202607'):id;
 if(item.type==='teacher')item.orderId=monthOrderId(teacherCommissionOrders[item.user]||'XQ202608170006');
 if(item.type==='cooperation')Object.assign(item,cooperationCommissionDetails[item.user]||cooperationCommissionDetails['刘子涵'],{orderId:monthOrderId((cooperationCommissionDetails[item.user]||cooperationCommissionDetails['刘子涵']).orderId)});
});
const withdrawRecords = [
 {bank:'中国建设银行',tail:'3188',date:'2026-10-12 17:44',amount:'1018.54',status:'审核中',tone:'reviewing'},
 {bank:'招商银行',tail:'6821',date:'2026-10-11 18:11',amount:'906.71',status:'已打款',tone:'done'},
 {bank:'中国工商银行',tail:'3906',date:'2026-10-10 09:32',amount:'500.00',status:'驳回',tone:'rejected',reason:'开户人姓名与银行卡账户信息不一致，请核对后重新申请。'},
 {bank:'中国工商银行',tail:'3906',date:'2026-10-09 19:15',amount:'1085.22',status:'已打款',tone:'done'}
];
let savedBank=null;
try{const bank=JSON.parse(localStorage.getItem('lingbang-withdraw-bank'));if(bank&&bank.bank&&bank.holder&&/^\d{16,19}$/.test(bank.card))savedBank=bank}catch{}
function renderSavedBank(edit=false){$('#bankEditor').hidden=Boolean(savedBank)&&!edit;$('#savedBankSummary').hidden=!savedBank||edit;$('#editSavedBank').hidden=!savedBank||edit;$('#cancelBankEdit').hidden=!savedBank;$('#bankMessage').hidden=true;if(savedBank){$('#savedBankSummary').textContent=`${savedBank.bank} · 尾号 ${savedBank.card.slice(-4)} · ${maskName(savedBank.holder)}`;$('#withdrawBank').value=savedBank.bank;$('#withdrawHolder').value=savedBank.holder;$('#withdrawCard').value=savedBank.card}}
function saveBank(){const bank=$('#withdrawBank').value.trim(),holder=$('#withdrawHolder').value.trim(),card=$('#withdrawCard').value.replace(/\s/g,'');const message=!bank?'请输入开户银行':!holder?'请输入开户人姓名':!/^\d{16,19}$/.test(card)?'请输入16–19位有效银行卡号':'';if(message){$('#bankMessage').textContent=message;$('#bankMessage').hidden=false;return}savedBank={bank,holder,card};try{localStorage.setItem('lingbang-withdraw-bank',JSON.stringify(savedBank))}catch{}renderSavedBank();showToast('银行卡已保存')}

let currentMember = null;
let commissionFilter = 'all';
let withdrawAvailable = 255386.50;
let withdrawCount = 0;
let withdrawTotal = 0;
let withdrawReturnScreen=overviewScreen;
let toastTimer;
const withdrawLimits = {min:10,max:2000,count:3,daily:3000};

function maskName(name){const chars=[...name];return chars.length===1?chars[0]:chars.length===2?`${chars[0]}*`:`${chars[0]}*${chars.at(-1)}`}
const phoneIcon = '<svg class="phone-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.8 9 3.2l2 5-1.7 1.4a14 14 0 0 0 5.1 5.1L15.8 13l5 2-.6 2.4c-.3 1.3-1.5 2.2-2.8 2.1A15.8 15.8 0 0 1 4.5 6.6c-.1-1.3.8-2.5 2.1-2.8Z"/></svg>';
function maskPhone(phone){return `${phone.slice(0,3)}****${phone.slice(-4)}`}
function escapeHtml(text){const el=document.createElement('span');el.textContent=String(text??'');return el.innerHTML}
function roles(item){return item.roles.map(role=>`<span class="role-tag role-${role}">${role==='teacher'?'老师':'家长'}</span>`).join('')}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1500)}
function showScreen(screen){$('#personalScreen').classList.toggle('active',screen===$('#personalScreen'));$('.phone').scrollLeft=0;overviewScreen.classList.toggle('active',screen===overviewScreen);overviewScreen.classList.toggle('leaving',screen!==overviewScreen);$$('.team-directory-screen').forEach(el=>el.classList.toggle('active',el===screen));billScreen.classList.toggle('active',screen===billScreen);$('#withdrawScreen').classList.toggle('active',screen===$('#withdrawScreen'));detailScreen.classList.toggle('active',screen===detailScreen);if(screen!==overviewScreen)screen.querySelector('.scroll')?.scrollTo(0,0)}

function memberPhone(item){return `<a class="phone-link" href="tel:${item.phone}" aria-label="拨打${maskName(item.name)}的电话 ${item.phone}"><span>${item.phone}</span>${phoneIcon}</a>`}
function memberIdentity(item){const name=maskName(item.name);return `<div class="member-head"><span class="avatar">${item.name[0]}</span><div class="member-info"><div class="member-name">${name}${roles(item)}</div><div class="member-meta"><span>${item.city}</span>${memberPhone(item)}</div></div><div class="member-profit">累计分润<strong>${item.profit}</strong></div></div>`;}
function canAddRevisit(item){return Boolean(item)}
function memberCard(item){
  const name=maskName(item.name);
  return `<article class="member-card" data-phone="${item.phone}" tabindex="0" role="link" aria-label="查看${name}的成员详情">${memberIdentity(item)}<div class="trace"><div class="trace-row"><span>最近跟进</span><span class="trace-copy">${escapeHtml(item.followText||'已电话沟通，家长有意向上……')}</span><span class="trace-time">${item.followTime}</span></div></div><div class="card-actions ${canAddRevisit(item)?'cols-2':'cols-1'}"><button class="card-action" type="button" data-follow-record>跟进记录</button>${canAddRevisit(item)?'<button class="card-action revisit-action" type="button" data-open-revisit>添加回访</button>':''}</div></article>`;
}
let activeMemberLevel="all";
function renderMembers(){const items=directoryMembers(activeMemberLevel);$('#myTeamTotal').textContent=`${items.length}人`;$('#myTeamToday').textContent=`今日新增 ${items.filter(item=>item.registerDate===teamDate(0)).length}人`;$('#personalCreatorOpened .creator-reward-team strong').innerHTML=`${items.length}<small>人</small>`;const filter=$('#identityField .identity-flat-option.active')?.dataset.identityValue||'all';const visible=items.filter(item=>filter==='all'||item.roles.includes(filter));$$('#identityField .identity-flat-option').forEach(button=>{const value=button.dataset.identityValue;const label={all:'全部',teacher:'老师',parent:'家长'}[value];const count=items.filter(item=>value==='all'||item.roles.includes(value)).length;button.textContent=`${label} ${count}`});$('#memberList').innerHTML=visible.length?visible.map(memberCard).join(''):'<div class="empty-result">暂无符合当前筛选条件的成员<br>请调整筛选项后查看</div>'}
function followRecords(item){const initial={time:item.followTime,content:'已电话沟通，进一步了解用户需求',meta:'跟进人：我'};initial.content=item.followText||initial.content;const history=[['08.18 16:20','已了解用户当前需求，约定后续再次联系。'],['08.12 10:35','已添加联系方式并发送相关介绍资料。'],['08.08 15:42','已补充了解课程时间与学习基础。'],['08.03 11:18','已发送课程介绍和师资资料。'],['07.29 09:26','已确认用户重点关注的课程方向。']].map(([time,content])=>({time,content,meta:'跟进人：我'}));return item.revisitRecords.length?[...item.revisitRecords,...history]:[initial,...history]}
function orderRecords(item){if(!item.hasOrders)return[];return [{time:'08.20 14:32',kind:'课程订单',title:'购买《优AI英语阅读提升》',meta:'订单号 YZB202608203286',amount:'¥ 1,280.00'},{time:'07.16 16:08',kind:'体验课订单',title:'购买《数学思维体验课》',meta:'订单号 YZB202607163508',amount:'¥ 99.00'},{time:'06.30 11:36',kind:'服务订单',title:'购买学习规划服务',meta:'订单号 YZB202606301126',amount:'¥ 299.00'}]}
const detailTabs={follow:['跟进动态','暂无跟进记录',followRecords],purchase:['订单动态','暂无订单记录',orderRecords]};
function renderDetailTab(tab){
  $$('#memberDetailTablist [data-member-detail-tab]').forEach(button=>{const active=button.dataset.memberDetailTab===tab;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
  const commission=tab==='commission';$('.follow-record-heading').hidden=commission;$('#memberCommissionToolbar').hidden=!commission;$('#followRecordList').hidden=commission;$('#memberCommissionPanel').hidden=!commission;
  if(commission){renderCommissions(commissionFilter);return}
  const [title,empty,source]=detailTabs[tab]||detailTabs.follow;const records=source(currentMember);$('#memberDetailListTitle').textContent=title;$('#followRecordCount').textContent=`${records.length} 条记录`;
  $('#followRecordList').innerHTML=records.length?records.map(record=>`<article class="detail-record-card"><div class="detail-record-top">${record.kind?`<span class="detail-record-kind">${escapeHtml(record.kind)}</span>`:''}<time class="detail-record-time">${record.time}</time></div>${record.title?`<div class="detail-record-title">${escapeHtml(record.title)}</div>`:''}<p class="detail-record-content">${escapeHtml(record.content||'')}</p><div class="detail-record-meta"><span>${escapeHtml(record.meta||'')}</span>${record.amount?`<strong class="detail-record-amount">${record.amount}</strong>`:''}</div></article>`).join(''):`<div class="empty-result">${empty}<br>暂无可展示内容</div>`;
}
let memberReturnScreen=overviewScreen;
function openMember(item){$('#memberDetailTeam').hidden=true;if(item.level==='一星'){const team=ensureTeamMembers(item);$('#memberDetailTeamTotal').textContent=`${team.length}人`;$('#memberDetailTeamToday').textContent=`${team.filter(child=>child.registerDate===teamDate(0)).length}人`;}$('#memberDetailRevisit').hidden=!canAddRevisit(item);if(!detailScreen.classList.contains('active'))memberReturnScreen=$('.screen.active')||overviewScreen;currentMember=item;const owner=$('#memberDetailOwner');owner.hidden=true;owner.textContent=item.level==='二星'?`所属一星成员：${maskName(item.ownerName)} · ${maskPhone(item.ownerPhone)}`:'';$('#memberDetailLevel').parentElement.hidden=true;$('#memberDetailLevel').textContent=item.level;$('#memberDetailLevel').className=`team-level-tag ${item.level==='二星'?'level-two':'level-one'}`;$('#followRecordAvatar').textContent=item.name[0];$('#followRecordName').textContent=maskName(item.name);$('#followRecordRole').innerHTML=roles(item);$('#followRecordCity').textContent=item.city.replace('.', '·');const masked=false;const contact=$('#followRecordPhone');contact.classList.toggle('masked',masked);if(masked){contact.removeAttribute('href');contact.innerHTML=`<span>${maskPhone(item.phone)}</span>`}else{contact.href=`tel:${item.phone}`;contact.innerHTML=`<span>${item.phone}</span>${phoneIcon}`}$('#memberDetailProfit').textContent=item.profit;renderDetailTab('follow');showScreen(detailScreen)}

const revisitSheet=$('#revisitSheet');const keyboard=$('#iphoneKeyboard');const revisitContent=$('#revisitContent');let revisitReturnFocus=null;let keyboardTimer;let keyboardShift=false;let keyboardLayout='letters';
function updateRevisit(){const length=revisitContent.value.length;$('#revisitCount').textContent=`${length}/200`;$('#revisitMessage').hidden=true;$('#submitRevisit').disabled=!revisitContent.value.trim()}
function renderKeyboard(){const symbols=['1','2','3','4','5','6','7','8','9','0','-','/',';',':','(',')','¥','&','@','"','.',',','?','!',"'",'_'];$$('#iphoneKeyboard [data-letter]').forEach((key,index)=>{const value=keyboardLayout==='letters'?key.dataset.letter:symbols[index];key.textContent=keyboardLayout==='letters'?(keyboardShift?value.toUpperCase():value):value;key.dataset.key=value});$('#iphoneKeyboardMode').textContent=keyboardLayout==='letters'?'123':'ABC';$('#iphoneKeyboard [data-keyboard-action="shift"]').classList.toggle('active',keyboardShift&&keyboardLayout==='letters')}
function showKeyboard(){if(revisitSheet.hidden)return;clearTimeout(keyboardTimer);keyboard.hidden=false;revisitSheet.classList.add('keyboard-open');requestAnimationFrame(()=>keyboard.classList.add('open'))}
function hideKeyboard(immediate=false){keyboard.classList.remove('open');revisitSheet.classList.remove('keyboard-open');clearTimeout(keyboardTimer);if(immediate)keyboard.hidden=true;else keyboardTimer=setTimeout(()=>keyboard.hidden=true,230)}
function insertText(text){const start=revisitContent.selectionStart??revisitContent.value.length;const end=revisitContent.selectionEnd??start;const insert=String(text).slice(0,Math.max(0,200-revisitContent.value.length+end-start));revisitContent.value=revisitContent.value.slice(0,start)+insert+revisitContent.value.slice(end);revisitContent.setSelectionRange(start+insert.length,start+insert.length);updateRevisit()}
function openRevisit(trigger,item){if(!canAddRevisit(item)){showToast('暂无该成员的回访权限');return}currentMember=item;revisitReturnFocus=trigger;$('#revisitMemberCard').innerHTML=memberIdentity(item);$('#revisitLatestText').textContent=item.followText||'暂无跟进记录';revisitContent.value='';$('#revisitPhrases').hidden=true;hideKeyboard(true);keyboardLayout='letters';keyboardShift=false;renderKeyboard();updateRevisit();$('#revisitMask').hidden=false;revisitSheet.hidden=false;requestAnimationFrame(()=>{$('#revisitMask').classList.add('open');revisitSheet.classList.add('open')})}
function closeRevisit(){if(revisitSheet.hidden)return;$('#revisitMask').classList.remove('open');revisitSheet.classList.remove('open');hideKeyboard(true);$('#revisitPhrases').hidden=true;setTimeout(()=>{$('#revisitMask').hidden=true;revisitSheet.hidden=true;revisitReturnFocus?.focus({preventScroll:true});revisitReturnFocus=null},240)}
function saveRevisit(){if(!canAddRevisit(currentMember)){showToast('暂无该成员的回访权限');return}const content=revisitContent.value.trim().replace(/[<>]/g,'');if(!content){$('#revisitMessage').textContent='请输入跟进内容';$('#revisitMessage').hidden=false;return}currentMember.followText=content;currentMember.followTime='刚刚';currentMember.revisitRecords.unshift({time:'刚刚',content,meta:'跟进人：我'});const inDetail=detailScreen.classList.contains('active');closeRevisit();setTimeout(()=>{renderMembers();['one','two'].forEach(renderDirectory);if(inDetail)renderDetailTab('follow');showToast(`已添加${maskName(currentMember.name)}的回访记录`)},250)}

function commissionIcon(type){const paths={parent:'<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0M18 5.5a3.5 3.5 0 0 1 0 6.8M19.5 15a6 6 0 0 1 2 4.5"/>',teacher:'<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 11.2V16c2.8 2.4 7.2 2.4 10 0v-4.8M21 9v6"/>',cooperation:'<path d="M8.5 14.5 6 17a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4.2 0M15.5 9.5 18 7a3 3 0 0 1 4 4l-4 4a3 3 0 0 1-4.2 0M8 16l8-8"/>'};return `<span class="commission-record-icon ${type}" aria-hidden="true"><svg viewBox="0 0 24 24">${paths[type]}</svg></span>`}
function commissionMarkup(item){
 const isParent=item.type==='parent';
 const title=isParent?'邀请家长':item.type==='teacher'?'邀请老师':'促成合作';
 const description=isParent
  ? `家长${maskName(item.user)}（${maskPhone(item.phone)}）发布需求，需求单由教员抢单并支付。`
  : item.type==='teacher'
   ? `教员${maskName(item.user)}（${maskPhone(item.phone)}）抢单并支付需求单。`
   : `撮合家长${maskName(item.parentName)}（${maskPhone(item.parentPhone)}）与教员${maskName(item.teacherName)}（${maskPhone(item.teacherPhone)}），需求单已支付。`;
 return `<article class="bill-record-item commission-record-item commission-event-record"><div class="commission-record-result"><strong class="bill-record-money">+¥${escapeHtml(item.amount)}</strong><span class="bill-record-status ${item.status}">${item.status==='settled'?'已结算':'待结算'}</span></div><div class="commission-record-heading"><span class="bill-record-title">${title}</span></div><p class="commission-record-subtitle">${escapeHtml(description)}</p><div class="commission-record-footer"><span class="commission-record-order"><b>需求订单号</b><span>${escapeHtml(item.orderId)}</span></span><span class="commission-record-date"><time>${escapeHtml(item.date)}</time></span></div></article>`;
}
function renderCommissions(filter='all'){commissionFilter=filter;const visible=filter==='all'?commissionRecords:commissionRecords.filter(item=>item.type===filter);const counts={all:commissionRecords.length,parent:commissionRecords.filter(item=>item.type==='parent').length,teacher:commissionRecords.filter(item=>item.type==='teacher').length,cooperation:commissionRecords.filter(item=>item.type==='cooperation').length};$$('[data-commission-label]').forEach(button=>{button.textContent=`${button.dataset.commissionLabel} ${counts[button.dataset.commissionFilter]}`});$('#memberCommissionSummary').textContent=`${visible.length} 笔记录`;const content=visible.length?visible.map(commissionMarkup).join(''):'<div class="empty-result">暂无该业务类型的分润明细</div>';$('#commissionList').innerHTML=content;$('#memberCommissionList').innerHTML=content}
function setCommissionFilter(filter){$$('[data-commission-filter]').forEach(button=>{const active=button.dataset.commissionFilter===filter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});renderCommissions(filter)}
function renderWithdrawRecords(){
 const list=$('#withdrawRecordList');
 $('#withdrawRecordCount').textContent=`${withdrawRecords.length} 笔`;
 list.innerHTML=withdrawRecords.length?withdrawRecords.map(item=>{
  const amounts=calculateWithdrawal(Number(item.amount));
  const arrivalLabel=item.tone==='done'?'实际到账':item.tone==='rejected'?'未到账':'预计到账';
  const arrivalValue=item.tone==='rejected'?'—':`¥${amounts.net.toFixed(2)}`;
  return `<article class="bill-record-item withdraw-history"><div class="withdraw-history-main"><div class="withdraw-history-bank">${escapeHtml(item.bank)}（尾号${escapeHtml(item.tail)}）</div><div class="withdraw-history-meta">申请时间 ${escapeHtml(item.date)}</div><div class="withdraw-history-amounts">提现 ¥${amounts.gross.toFixed(2)}　·　税费 ¥${amounts.tax.toFixed(2)}</div>${item.reason?`<details><summary>查看驳回原因</summary><p>${escapeHtml(item.reason)}</p></details>`:''}</div><div class="withdraw-history-side"><span class="withdraw-history-side-label">${arrivalLabel}</span><strong>${arrivalValue}</strong><span class="withdraw-history-status ${item.tone}">${escapeHtml(item.status)}</span></div></article>`
 }).join(''):'<div class="empty-result">暂无提现记录</div>';
}
function clearWithdrawError(){$('#withdrawAmount').removeAttribute('aria-invalid');$('#withdrawMessage').hidden=true;$('#withdrawMessage').textContent=''}
function calculateWithdrawal(amount){const gross=Math.round(amount*100);const tax=amount>800?Math.round(gross*.08):0;return {gross:gross/100,tax:tax/100,net:(gross-tax)/100}}
function updateTax(){const input=Number($('#withdrawAmount').value);const amount=Number.isFinite(input)&&input>0?input:0;const result=calculateWithdrawal(amount);$('#withdrawGrossAmount').textContent=`¥${result.gross.toFixed(2)}`;$('#withdrawTaxAmount').textContent=`-¥${result.tax.toFixed(2)}`;$('#withdrawNetAmount').textContent=`¥${result.net.toFixed(2)}`;$('#withdrawTaxSummary').textContent=result.tax>0?`含代扣税费 ¥${result.tax.toFixed(2)}`:'无代扣税费'}
function maxWithdrawable(){return Math.max(0,Math.min(withdrawAvailable,withdrawLimits.max,withdrawLimits.daily-withdrawTotal))}
function updateWithdraw(){const availableText=withdrawAvailable.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});$('#withdrawAvailable').textContent=availableText;$('#overviewScreen .available').innerHTML='<small class="currency">¥</small>'+availableText;$('#withdrawTodayUsage').textContent=`${withdrawCount} 次 · ¥${withdrawTotal.toFixed(2)}`;$('#withdrawAll').disabled=withdrawCount>=withdrawLimits.count||maxWithdrawable()<withdrawLimits.min}
function resetBill(){$('#withdrawDetails').open=false;$('#withdrawAmount').value=maxWithdrawable().toFixed(2);clearWithdrawError();updateTax();updateWithdraw();setCommissionFilter('all')}
function submitWithdraw(event){event.preventDefault();const input=$('#withdrawAmount');const value=Number(input.value);let message='';if(!savedBank)message='请先填写并保存收款银行卡';else if(!$('#bankEditor').hidden)message='请先保存银行卡修改，或取消修改';else if(!input.value||!Number.isFinite(value))message='请输入提现金额';else if(withdrawCount>=withdrawLimits.count)message='今日提现次数已达3次，请明日再试';else if(value<withdrawLimits.min)message='单笔提现金额不能低于10元';else if(value>withdrawLimits.max)message='单笔提现金额不能超过2000元';else if(value>withdrawAvailable)message='提现金额不能超过可提现佣金';else if(withdrawTotal+value>withdrawLimits.daily)message=`今日剩余可提现额度为¥${Math.max(0,withdrawLimits.daily-withdrawTotal).toFixed(2)}`;if(message){input.setAttribute('aria-invalid','true');$('#withdrawMessage').textContent=message;$('#withdrawMessage').hidden=false;input.focus();return}const amounts=calculateWithdrawal(value);const destination=savedBank.bank;withdrawAvailable=Math.round((withdrawAvailable-value)*100)/100;withdrawCount++;withdrawTotal=Math.round((withdrawTotal+value)*100)/100;withdrawRecords.unshift({bank:savedBank.bank,tail:savedBank.card.slice(-4),date:new Date().toLocaleString('zh-CN',{hour12:false}),amount:amounts.gross.toFixed(2),status:'审核中',tone:'reviewing'});renderWithdrawRecords();updateWithdraw();input.value=maxWithdrawable()>=withdrawLimits.min?maxWithdrawable().toFixed(2):'';updateTax();showToast(`已提交¥${amounts.gross.toFixed(2)}至${destination}`)}

function openWithdraw(){withdrawReturnScreen=$('.screen.active')||overviewScreen;resetBill();renderSavedBank();renderWithdrawRecords();showScreen($('#withdrawScreen'))}
function openBill(mode){if(mode==='withdraw'){openWithdraw();return}resetBill();$('#billIncomeTotal').textContent=$('.income-total-value').textContent;showScreen(billScreen)}
$('#openBill').addEventListener('click',openWithdraw);
$('#openIncomeDetails').addEventListener('click',()=>openBill('income'));
$('#billWithdrawToggle').addEventListener('click',openWithdraw);
$('#closeWithdraw').addEventListener('click',()=>showScreen(withdrawReturnScreen));
$('#saveBank').addEventListener('click',saveBank);
$('#editSavedBank').addEventListener('click',()=>renderSavedBank(true));
$('#cancelBankEdit').addEventListener('click',()=>renderSavedBank());
$('#closeBill').addEventListener('click',()=>showScreen(overviewScreen));
$('#closeFollowRecord').addEventListener('click',()=>{showScreen(memberReturnScreen);if(detailScreen.dataset.fromTeam){delete detailScreen.dataset.fromTeam;if(teamFromDetail)openMember(teamOwner);openTeam(teamOwner)}});
$('#memberDetailTeam').addEventListener('click',()=>openTeam(currentMember));
$('#memberDetailRevisit').addEventListener('click',event=>openRevisit(event.currentTarget,currentMember));
$$('[data-member-detail-tab]').forEach(button=>button.addEventListener('click',()=>renderDetailTab(button.dataset.memberDetailTab)));
$$('#identityField .identity-flat-option').forEach(button=>button.addEventListener('click',()=>{$$('#identityField .identity-flat-option').forEach(option=>{const active=option===button;option.classList.toggle('active',active);option.setAttribute('aria-pressed',String(active))});renderMembers()}));
const teamMask=$('#teamMask');const teamSheet=$('#teamSheet');
let teamOwner=null,teamTrigger=null,teamItems=[],teamFromDetail=false;
function teamDate(days){const d=new Date();d.setDate(d.getDate()-days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function renderTeam(){
 const visible=teamItems;
 $('#teamMemberList').innerHTML=visible.length?visible.map(i=>`<article class="member-card team-detail-card"><div class="team-card-top"><span class="team-level-tag level-two">二星</span><button type="button" data-team-follow="${i.phone}">跟进记录 ›</button></div><div class="member-head"><span class="avatar">${i.name[0]}</span><div class="member-info"><div class="member-name">${maskName(i.name)}${roles(i)}</div><div class="member-meta team-contact"><span>${i.city}</span>${memberPhone(i)}</div><div class="team-register">注册于 ${i.registerDate.replaceAll('-','.')}</div></div><div class="member-profit">累计分润<strong>${i.profit}</strong></div></div><div class="trace"><div class="trace-row"><span>最近跟进</span><span class="trace-copy">${escapeHtml(i.followText)}</span><span class="trace-time">${i.followTime}</span></div></div></article>`).join(''):'<div class="empty-result">暂无团队成员</div>';
}
function ensureTeamMembers(item){
 if(!item.teamMembers){const names=['冯雪','潘莉','许宁','周敏','郑雨桐','吴思远','方晨曦','宋佳宁'];const profits=['825.62','617.96','300.70','61.54','198.00','96.00','188.00','174.29'];item.teamMembers=names.slice(0,item.teamCount).map((name,index)=>{const roles=index===2?['teacher','parent']:index%3===1?['teacher']:['parent'];return{name:roles.includes('teacher')?`${[...name][0]}教员`:name,level:'二星',phone:`12000000${405+members.indexOf(item)*10+index}`,roles,city:index===2?'陕西·咸阳':'陕西·西安',profit:`¥ ${profits[index]}`,hasOrders:index%2===0,registerDate:teamDate(index<item.teamToday?0:(index-item.teamToday+1)*4),followText:['已电话沟通，家长有意向上课','已发送课程资料，等待进一步回复','已完成教师入驻资料确认'][index%3],followTime:index<2?'今天 13:43':'昨天 11:05',revisitRecords:[]}})}
 item.teamMembers.forEach(child=>{child.ownerName=item.name;child.ownerPhone=item.phone});return item.teamMembers;
}
function openTeam(item){
 teamFromDetail=detailScreen.classList.contains('active');teamOwner=item;teamTrigger=document.activeElement;
 ensureTeamMembers(item);
 teamItems=item.teamMembers;$('#teamSheetTitle').textContent=`${maskName(item.name)}的团队`;$('#teamOwnerAvatar').textContent=item.name[0];$('#teamOwnerPhone').innerHTML=`<span>${item.phone}</span>${phoneIcon}`;$('#teamOwnerPhone').href=`tel:${item.phone}`;
 $('#teamSheetSummary').innerHTML=`<span class="team-total">二星团队 · ${teamItems.length}人</span><span class="team-today">今日新增 ${teamItems.filter(i=>i.registerDate===teamDate(0)).length}人</span><span class="team-profit">累计分润 <strong>¥${teamItems.reduce((sum,i)=>sum+Number(i.profit.replace(/[^\d.]/g,'')),0).toFixed(2)}</strong></span>`;
 renderTeam();teamMask.hidden=false;teamSheet.hidden=false;requestAnimationFrame(()=>{teamMask.classList.add('open');teamSheet.classList.add('open');$('#teamSheetClose').focus({preventScroll:true})})
}
$('#teamMemberList').addEventListener('click',e=>{const button=e.target.closest('[data-team-follow]');if(!button)return;teamSheet.classList.remove('open');teamMask.classList.remove('open');teamSheet.hidden=true;teamMask.hidden=true;openMember(teamItems.find(i=>i.phone===button.dataset.teamFollow));detailScreen.dataset.fromTeam='true'});
function closeTeam(){if(teamSheet.hidden)return;teamMask.classList.remove('open');teamSheet.classList.remove('open');setTimeout(()=>{teamMask.hidden=true;teamSheet.hidden=true},240)}
$('#memberList').addEventListener('click',event=>{const card=event.target.closest('.member-card');if(!card||event.target.closest('.phone-link'))return;const item=directoryMembers(activeMemberLevel).find(member=>member.phone===card.dataset.phone);if(event.target.closest('[data-team-summary]'))openTeam(item);else if(event.target.closest('[data-open-revisit]'))openRevisit(event.target,item);else openMember(item)});
$('#teamMask').addEventListener('click',closeTeam);$('#teamSheetClose').addEventListener('click',closeTeam);
$('#memberList').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('.member-card')){event.preventDefault();openMember(directoryMembers(activeMemberLevel).find(member=>member.phone===event.target.dataset.phone))}});
$('#revisitMask').addEventListener('click',closeRevisit);
$('#revisitClose').addEventListener('click',closeRevisit);
$('#cancelRevisit').addEventListener('click',closeRevisit);
revisitContent.addEventListener('input',updateRevisit);
revisitContent.addEventListener('focus',showKeyboard);
revisitContent.addEventListener('click',showKeyboard);
keyboard.addEventListener('pointerdown',event=>{if(event.target.closest('button'))event.preventDefault()});
keyboard.addEventListener('click',event=>{const key=event.target.closest('button');if(!key)return;const action=key.dataset.keyboardAction;if(action==='shift'){keyboardShift=!keyboardShift;renderKeyboard()}else if(action==='delete'){const start=revisitContent.selectionStart,end=revisitContent.selectionEnd;if(start>0||end>0){const from=start===end?start-1:start;revisitContent.value=revisitContent.value.slice(0,from)+revisitContent.value.slice(end);revisitContent.setSelectionRange(from,from);updateRevisit()}}else if(action==='mode'){keyboardLayout=keyboardLayout==='letters'?'symbols':'letters';renderKeyboard()}else if(action==='space')insertText(' ');else if(action==='done'){revisitContent.blur();hideKeyboard()}else if(key.dataset.letter)insertText(keyboardLayout==='letters'?(keyboardShift?key.dataset.letter.toUpperCase():key.dataset.letter):key.dataset.key);else if(key.dataset.key)insertText(key.dataset.key)});
$('#openRevisitPhrases').addEventListener('click',()=>{hideKeyboard();$('#revisitPhrases').hidden=false});
$('#closeRevisitPhrases').addEventListener('click',()=>$('#revisitPhrases').hidden=true);
$$('.revisit-phrase-option').forEach(button=>button.addEventListener('click',()=>{revisitContent.value=button.textContent.trim().slice(0,200);updateRevisit();$('#revisitPhrases').hidden=true}));
$('#submitRevisit').addEventListener('click',saveRevisit);
$$('[data-commission-filter]').forEach(button=>button.addEventListener('click',()=>setCommissionFilter(button.dataset.commissionFilter)));
$('#withdrawAll').addEventListener('click',()=>{$('#withdrawAmount').value=maxWithdrawable().toFixed(2);clearWithdrawError();updateTax()});
$('#withdrawAmount').addEventListener('input',event=>{const parts=event.target.value.replace(/[^\d.]/g,'').split('.');event.target.value=parts.length>1?`${parts.shift()}.${parts.join('').slice(0,2)}`:parts[0];clearWithdrawError();updateTax()});
$('#withdrawForm').addEventListener('submit',submitWithdraw);
document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(!keyboard.hidden)hideKeyboard();else if(!revisitSheet.hidden)closeRevisit();else if(!teamSheet.hidden)closeTeam();else if(detailScreen.classList.contains('active'))$('#closeFollowRecord').click();else if($('#withdrawScreen').classList.contains('active'))$('#closeWithdraw').click();else if(billScreen.classList.contains('active')||$('.team-directory-screen.active'))showScreen(overviewScreen)});
renderMembers();renderCommissions();renderWithdrawRecords();updateWithdraw();

function directoryMembers(level){return level==='all'?[...members,...members.flatMap(ensureTeamMembers)]:level==='one'?members:members.flatMap(ensureTeamMembers)}
function renderDirectory(level){
 const items=directoryMembers(level),filters=$(`#${level}TeamFilters`);
 const selected=filters.querySelector('.active')?.dataset.directoryIdentity||'all';
 filters.querySelectorAll('button').forEach(button=>{const value=button.dataset.directoryIdentity;const count=items.filter(item=>value==='all'||item.roles.includes(value)).length;button.textContent=`${{all:'全部',teacher:'老师',parent:'家长'}[value]} ${count}`});
 const visible=items.filter(item=>selected==='all'||item.roles.includes(selected));
 $(`#${level}TeamList`).innerHTML=visible.length?visible.map(memberCard).join(''):'<div class="empty-result">暂无符合当前筛选条件的成员</div>';
}
['one','two'].forEach(level=>{
 const screen=$(`#${level}TeamScreen`),list=$(`#${level}TeamList`);
 $(`#${level}TeamFilters`).addEventListener('click',event=>{const button=event.target.closest('[data-directory-identity]');if(!button)return;button.parentElement.querySelectorAll('button').forEach(option=>{const active=option===button;option.classList.toggle('active',active);option.setAttribute('aria-pressed',String(active))});renderDirectory(level)});
 $(`#close${level}Team`).addEventListener('click',()=>showScreen(overviewScreen));
 list.addEventListener('click',event=>{const card=event.target.closest('.member-card');if(!card||event.target.closest('.phone-link'))return;const item=directoryMembers(level).find(i=>i.phone===card.dataset.phone);if(event.target.closest('[data-team-summary]'))openTeam(item);else if(event.target.closest('[data-open-revisit]'))openRevisit(event.target,item);else openMember(item)});
 list.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('.member-card')){event.preventDefault();openMember(directoryMembers(level).find(i=>i.phone===event.target.dataset.phone))}});
 const items=directoryMembers(level);


});

$('#backToPersonal').addEventListener('click',()=>showScreen($('#personalScreen')));

$('#personalBack').addEventListener('click',()=>showScreen(overviewScreen));
function setCreatorDemoOpened(opened){
 $('#creatorDemoToggle').setAttribute('aria-checked',String(opened));
 $('#personalCreatorLocked').hidden=opened;
 $('#personalCreatorOpened').hidden=!opened;
}
$('#creatorDemoToggle').addEventListener('click',()=>setCreatorDemoOpened($('#creatorDemoToggle').getAttribute('aria-checked')!=='true'));
$('#personalOpenCreator').addEventListener('click',()=>setCreatorDemoOpened(true));
$('#personalEnterCreator').addEventListener('click',()=>showScreen(overviewScreen));
