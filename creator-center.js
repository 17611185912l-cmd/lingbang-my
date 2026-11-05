const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const overviewScreen = $('#overviewScreen');
const billScreen = $('#billScreen');
const detailScreen = $('#followRecordScreen');
const toast = $('#toast');
// 定位演示数据：行政区与详细位置分开，以下小区、大厦名称仅用于原型展示。
function memberLocationDemoFields(item,index=0){
  const city=(item.city||'陕西·西安').replaceAll('.', '·');
  const fallbackDistrict=city.includes('咸阳')?'秦都区':city.includes('宝鸡')?'渭滨区':city.includes('渭南')?'临渭区':['雁塔区','碑林区','莲湖区'][index%3];
  const locationRegion=(item.roles.includes('teacher')?item.teacherRegion:item.roles.includes('parent')?item.region:'')||`${city}·${fallbackDistrict}`;
  const point=['明德花园小区','启航商务大厦','锦园小区'][index%3];
  return {locationRegion,detailAddress:`${fullRegion(locationRegion)}·${point}`};
}
// 家长资料演示数据：按单个学生展示，包含多科目和未填写状态。
function parentDemoFields(index,city='陕西·西安'){
  if(index%7===3)return {region:'',studentGrade:'',intendedSubjects:[],lessonMethod:''};
  const district=city.includes('咸阳')?'秦都区':['雁塔区','碑林区','莲湖区'][index%3];
  return {lessonMethod:['在线辅导','教员上门','学员上门'][index%3],region:`${city.replaceAll('.', '·')}·${district}`,studentGrade:['初二','五年级','高一','初三'][index%4],intendedSubjects:[['数学','英语','物理','化学','生物'],['语文','数学'],['数学','英语','物理']][index%3]};
}
// 老师资料演示数据，列表与详情共用，教龄最少1年，并保留未填写状态。
function teacherDemoFields(index,city='陕西·西安'){
  const district=city.includes('咸阳')?'秦都区':['雁塔区','碑林区','莲湖区'][index%3];
  const teacherRegion=`${city.replaceAll('.', '·')}·${district}`;
  const teacherType=index%6===5?'student':'professional'; // 显式的演示身份字段，展示时不根据学历或教龄推断。
  const teacherVerification=index%3===2?'verified':'pending'; // 认证状态演示值，独立于老师类型。
  if(index%7===6)return {teacherType,teacherVerification,teacherRegion,teachingYears:null,graduateSchool:'',education:'',tutoringSubjects:[]};
  return {teacherType,teacherVerification,teacherRegion,teachingYears:[3,6,8,2,5,1][index%6],graduateSchool:['西安交通大学','西安外国语大学','陕西科技大学'][index%3],education:index%4===0?'硕士':'本科',tutoringSubjects:[['数学','英语','物理','化学','生物'],['语文','英语'],['数学','物理','化学']][index%3]};
}
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
].map(([name,phone,roles,hasOrders,profit],index) => ({name,phone,roles:roles.split(','),hasOrders,profit,city:'陕西.西安',...(roles.split(',').includes('teacher')?teacherDemoFields(index):{}),...(roles.split(',').includes('parent')?{...parentDemoFields(index),hasDemands:index!==3}:{}),followText:'',followTime:'今天 13:43',revisitRecords:[],level:'一星',registerDate:teamDate(index<2?0:index),teamCount:index===0?8:5,teamToday:index===0?2:1}));
// 仅注册、尚未取得家长或老师身份的演示成员。
members.push(...[
  ['林悦','12000000201','parent',7,3,0,'陕西·西安'],
  ['许晨','12000000202','teacher',7,3,1,'陕西·西安'],
  ['周雨桐','12000000203','parent',2,1,0,'陕西·咸阳'],
  ['赵嘉宁','12000000204','teacher',2,1,0,'陕西·西安'],
  ['陈思远','12000000205','none',1,1,0,'陕西·宝鸡'],
  ['吴可欣','12000000206','parent',3,2,1,'陕西·渭南'],
  ['郑宇航','12000000207','teacher',3,2,2,'陕西·咸阳'],
  ['何佳怡','12000000208','parent',4,3,3,'陕西·西安'],
  ['孙浩然','12000000209','teacher',4,3,4,'陕西·宝鸡'],
  ['高梓涵','12000000210','none',1,2,5,'陕西·渭南'],
  ['蒋文博','12000000211','teacher',5,2,6,'陕西·西安'],
  ['唐欣然','12000000212','parent',3,1,7,'陕西·咸阳']
].map(([name,phone,registeredIntent,activityCount,revisitCount,days,city])=>({name,phone,registeredIntent,revisitCount,roles:[],hasOrders:false,profit:'¥ 0.00',city,followText:'',followTime:'',revisitRecords:[],activityRecords:registeredActivityDemo(registeredIntent,teamDate(days),activityCount),level:'一星',registerDate:teamDate(days),teamCount:0,teamToday:0})));
// 仅用于原型演示；完整流程事件不会改变演示成员的静态身份，实际应按身份生效规则同步身份并保留历史轨迹。
function registeredActivityDemo(intent,date,count=7){
  const time=clock=>`${date.replaceAll('-','.')} ${clock}`;
  const records=[{time:time('09:20'),title:'注册成功',content:'完成账号注册。',status:'已完成'}];
  if(intent==='parent'){
    records.push(
      {time:time('09:21'),title:'选择家长身份',content:'注册时选择家长身份，尚未完善家长资料。',status:'未提交'},
      {time:time('09:25'),title:'进入家长资料页',content:'进入家长资料页，尚未填写资料。'},
      {time:time('09:32'),title:'填写家长资料',content:'已填写所在区域和学生年级，尚未完善意向科目。'},
      {time:time('09:40'),title:'完善家长资料',content:'已完善所在区域、学生年级和意向科目。'},
      {time:time('10:05'),title:'修改学生年级',content:'学生年级由五年级改为六年级。'},
      {time:time('10:20'),title:'调整意向科目',content:'意向科目由数学调整为数学、英语。'}
    );
  }else if(intent==='teacher'){
    records.push(
      {time:time('09:21'),title:'选择老师身份',content:'注册时选择老师身份，尚未提交老师资料。',status:'未提交'},
      {time:time('09:25'),title:'填写老师入驻资料',content:'已开始填写入驻资料，尚未提交。',status:'未提交'},
      {time:time('09:28'),title:'进入老师实名认证',content:'已进入实名认证页面，尚未完成认证。',status:'未完成'},
      {time:time('09:40'),title:'提交老师资料',content:'已提交老师入驻资料，等待审核。'},
      {time:time('11:10'),title:'审核通过',content:'老师入驻资料审核通过。'},
      {time:time('14:20'),title:'修改老师资料',content:'修改了辅导科目和个人简介。'}
    );
  }
  return records.slice(0,count).reverse();
}
// 回访示例按身份区分；列表摘要、详情及新增回访共用同一组记录。
function revisitDemoFields(item,index=0){
  const date=item.registerDate.replaceAll('-','.');
  const contents=!item.roles.length?(item.registeredIntent==='none'?[
    '已联系，用户暂未确定使用身份，已介绍家长和老师两种使用流程。',
    '用户暂时先了解平台，约定有需要时再联系。'
  ]:item.registeredIntent==='parent'?[
    '已联系，用户有找老师的意向，已说明完善家长资料的流程。',
    '已了解学生年级和意向科目，提醒补充所在区域。',
    '已发送资料填写指引，约定完善后再联系。'
  ]:[
    '已联系，用户有入驻老师的意向，已介绍入驻流程。',
    '已说明老师资料和实名认证要求，用户准备补充材料。',
    '已发送入驻指引，约定资料备齐后协助完成。'
  ]):item.roles.includes('teacher')?[
    '已联系老师，老师有接课意向，已介绍需求对接流程。',
    '已了解老师的辅导科目和教学经验，确认可辅导的年级。',
    '老师周末可授课，优先考虑距离较近的学生，已记录可授课时段。',
    '已与老师确认接课意向，后续有合适需求时再联系。'
  ]:[
    '已联系，家长有意向安排辅导，已了解学生年级和意向科目。',
    '家长反馈学生基础偏弱，希望老师重点巩固基础、讲解错题。',
    '已确认家长的上课时间和预算，家长希望先了解老师的教学经验。',
    '已向家长介绍合适的老师，家长希望进一步沟通上课安排。'
  ];
  const clocks=['09:35','10:20','11:10','13:43'];
  const revisitRecords=contents.slice(0,item.revisitCount??contents.length).map((content,index)=>({time:`${date} ${clocks[index]}`,content,meta:'跟进人：我'})).reverse();
  return {revisitRecords,followText:revisitRecords[0].content,followTime:revisitRecords[0].time};
}
members.forEach((item,index)=>Object.assign(item,memberLocationDemoFields(item,index),revisitDemoFields(item,index)));
const commissionRecords = [
  {type:'parent',user:'陈小满',phone:'13800138001',date:'2026.08.22 10:32',amount:'30',status:'settled',orderId:'XQ202608220032',lessonMethods:['在线辅导','学员上门','教员上门'],teacherName:'王教员',teacherPhone:'13900139001',salesOwner:'self'},
  {type:'parent',user:'赵一诺',phone:'13700137003',date:'2026.08.21 16:18',amount:'45',status:'pending',orderId:'XQ202608210041',lessonMethods:['教员上门'],teacherName:'张教员',teacherPhone:'13700137003',salesOwner:'992292'},
  {type:'parent',user:'郑雨桐',phone:'13500135005',date:'2026.08.20 14:06',amount:'30',status:'settled',orderId:'XQ202608200018',lessonMethods:['在线辅导','学员上门'],teacherName:'刘教员',teacherPhone:'13500135006',salesOwner:'self',teacherInviter:'992293'},
  {type:'parent',user:'周可欣',phone:'13600136005',date:'2026.08.19 17:20',amount:'35',status:'settled',orderId:'XQ202608190027',lessonMethods:['学员上门'],teacherName:'吴教员',teacherPhone:'13700137009',salesOwner:'992293',teacherInviter:'992293'},
  {type:'teacher',user:'王教员',phone:'13900139001',date:'2026.08.19 11:24',amount:'60',status:'settled',orderId:'XQ202608220032',lessonMethods:['在线辅导','学员上门','教员上门'],parentName:'王晓琳',parentPhone:'13900139002',salesOwner:'self'},
  {type:'teacher',user:'黄教员',phone:'13400134006',date:'2026.08.18 09:42',amount:'60',status:'settled',orderId:'XQ202608180056',lessonMethods:['学员上门','教员上门'],parentName:'孙可欣',parentPhone:'13600136004',salesOwner:'992292',parentInviter:'991108'},
  {type:'teacher',user:'何教员',phone:'13900139011',date:'2026.08.17 15:16',amount:'60',status:'pending',orderId:'XQ202608170006',lessonMethods:['在线辅导'],parentName:'王晓琳',parentPhone:'13900139002',salesOwner:'992292',parentInviter:'991108'},
  {type:'cooperation',user:'陈小满',phone:'13800138001',date:'2026.08.16 18:36',amount:'120',status:'settled',orderId:'XQ202608220032',lessonMethods:['在线辅导','学员上门','教员上门'],parentName:'陈小满',parentPhone:'13800138001',teacherName:'王教员',teacherPhone:'13900139001',salesOwner:'self'},
  {type:'cooperation',user:'郑雨桐',phone:'13500135005',date:'2026.08.15 16:12',amount:'120',status:'settled',orderId:'XQ202608200018',lessonMethods:['在线辅导','学员上门'],parentName:'郑雨桐',parentPhone:'13500135005',teacherName:'刘教员',teacherPhone:'13500135006',teacherInviter:'992293',salesOwner:'self'},
  {type:'cooperation',user:'王晓琳',phone:'13900139002',date:'2026.08.14 14:30',amount:'120',status:'settled',orderId:'XQ202608140022',lessonMethods:['在线辅导','教员上门'],parentName:'王晓琳',parentPhone:'13900139002',teacherName:'王教员',teacherPhone:'13900139001',parentInviter:'991108',salesOwner:'self'},
  {type:'cooperation',user:'孙可欣',phone:'13600136004',date:'2026.08.13 10:05',amount:'120',status:'settled',orderId:'XQ202608130014',lessonMethods:['在线辅导','学员上门','教员上门'],parentName:'孙可欣',parentPhone:'13600136004',teacherName:'黄教员',teacherPhone:'13400134006',parentInviter:'991108',teacherInviter:'992293',salesOwner:'992292'}
];
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
let commissionStatusFilter = 'all';
let billReturnScreen=overviewScreen;
const cumulativeIncomeTotal = '812,386.50';
let withdrawAvailable = 255386.50;
let withdrawCount = 0;
let withdrawTotal = 0;
let withdrawReturnScreen=overviewScreen;
let toastTimer;
const withdrawLimits = {min:10,max:2000,count:3,daily:3000};

function maskName(name){const chars=[...name];return chars.length===1?chars[0]:chars.length===2?`${chars[0]}*`:`${chars[0]}*${chars.at(-1)}`}
const phoneIcon = '<svg class="phone-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.8 9 3.2l2 5-1.7 1.4a14 14 0 0 0 5.1 5.1L15.8 13l5 2-.6 2.4c-.3 1.3-1.5 2.2-2.8 2.1A15.8 15.8 0 0 1 4.5 6.6c-.1-1.3.8-2.5 2.1-2.8Z"/></svg>';
function maskPhone(phone){return `${phone.slice(0,3)}****${phone.slice(-4)}`}
function commissionPhone(phone){return maskPhone(phone)}
function escapeHtml(text){const el=document.createElement('span');el.textContent=String(text??'');return el.innerHTML}
function roles(item){
  if(!item.roles.length)return '';
  // 列表、团队子列表和详情共用同一身份展示规则：老师身份优先。
  const visibleRoles=item.roles.includes('teacher')?['teacher']:item.roles;
  return visibleRoles.map(role=>{
    if(role!=='teacher')return '<span class="role-tag role-parent">家长</span>';
    const typeLabel={student:'大学生',professional:'专职老师'}[item.teacherType]||'老师类型未填写';
    const statusLabel={verified:'已认证',pending:'待审核'}[item.teacherVerification];
    return `<span class="role-tag role-teacher">${typeLabel}</span>${statusLabel?`<span class="role-tag teacher-status-${item.teacherVerification}">${statusLabel}</span>`:''}`;
  }).join('');
}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1500)}
function showScreen(screen){$$('.phone > .screen').forEach(el=>{const active=el===screen;el.classList.toggle('active',active);el.inert=!active});$('.phone').scrollLeft=0;overviewScreen.classList.toggle('leaving',screen!==overviewScreen);if(screen!==overviewScreen)screen.querySelector('.scroll')?.scrollTo(0,0)}

function memberPhone(item){return `<a class="phone-link" href="tel:${item.phone}" aria-label="拨打${maskName(item.name)}的电话 ${item.phone}"><span>${item.phone}</span>${phoneIcon}</a>`}
function memberRegion(item){return item.locationRegion||(item.roles.includes('teacher')?item.teacherRegion:item.roles.includes('parent')?item.region:'')||'未获取位置'}
function fullRegion(region){return region.replace(/^陕西·/,'陕西省·').replace(/·(西安|咸阳|宝鸡|渭南)·/,'·$1市·')}
function memberCardRoles(item){return item.roles.includes('parent')&&!item.roles.includes('teacher')?`<span class="parent-card-tags">${roles(item)}<span class="parent-grade" aria-label="学生年级">${escapeHtml(item.studentGrade||'未填写')}</span></span>`:roles(item)}
function memberIdentity(item,showProfit=true,inlineSubjects=false){const name=maskName(item.name);return `<div class="member-head"><span class="avatar">${item.name[0]}</span><div class="member-info"><div class="member-name">${inlineSubjects?`<span class="parent-card-name">${name}</span>`:name}${memberCardRoles(item)}${inlineSubjects?parentSubjectSummary(item):''}</div><div class="member-meta"><span>${escapeHtml(memberRegion(item))}</span>${memberPhone(item)}</div></div>${showProfit&&item.roles.length?`<div class="member-profit">累计推广收益<strong>${item.profit}</strong></div>`:''}</div>`;}
function parentSubjectSummary(item){
  const subjects=item.intendedSubjects||[],extra=subjects.length-3;
  return `<span class="parent-heading-subjects"><span class="parent-subject-divider" aria-hidden="true">｜</span><span class="parent-subject-value"><span class="parent-subjects" aria-label="意向科目" title="${escapeHtml(subjects.join('、')||'未填写')}">${escapeHtml(subjects.slice(0,3).join('、')||'未填写')}</span>${extra>0?`<span class="parent-subject-more" aria-label="另有${extra}个意向科目">+${extra}</span>`:''}</span></span>`;
}
function parentDemandSummary(item){
  if(!item.roles.includes('parent')||item.roles.includes('teacher'))return '';
  return `<div class="parent-demand-summary"><span class="parent-method-label">上课方式</span><span class="parent-method" aria-label="上课方式">${escapeHtml(item.lessonMethod||'未填写')}</span></div>`;
}
function teachingYearsLabel(item){return Number.isFinite(item.teachingYears)?`${item.teachingYears}年教龄`:'教龄未填写'}
function teacherSummary(item){
  if(!item.roles.includes('teacher'))return '';
  const subjects=item.tutoringSubjects||[];const extra=subjects.length-3;
  return `<div class="teacher-profile-summary"><div class="teacher-qualification"><span class="teacher-school">${escapeHtml([item.graduateSchool||'院校未填写',item.education||'学历未填写'].join(' '))}</span><span class="teacher-experience">${escapeHtml(teachingYearsLabel(item))}</span></div><div class="teacher-subject-summary"><span class="teacher-subject-label">辅导科目</span><span class="teacher-subjects">${escapeHtml(subjects.slice(0,3).join('、')||'未填写')}</span>${extra>0?`<span class="parent-subject-more" aria-label="另有${extra}个辅导科目">+${extra}</span>`:''}</div></div>`;
}
function renderMemberProfileFields(item){
  const panel=$('#memberProfileFields');const fields=[['所在位置',item.detailAddress||'未获取详细位置']];
  if(item.roles.includes('parent')&&!item.roles.includes('teacher')){
    fields.push(['意向科目',(item.intendedSubjects||[]).join('、')||'未填写'],['上课方式',item.lessonMethod||'未填写']);
  }
  if(item.roles.includes('teacher'))fields.push(['教龄',teachingYearsLabel(item)],['毕业院校',[item.graduateSchool||'院校未填写',item.education||'学历未填写'].join(' ')],['辅导科目',(item.tutoringSubjects||[]).join('、')||'未填写']);
  panel.hidden=!fields.length;
  panel.innerHTML=fields.map(([label,value])=>`<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  const parent=memberPrimaryIdentity(item)==='parent';
  detailScreen.classList.toggle('has-parent-profile',parent);
  const grade=$('#followRecordGrade');grade.hidden=!parent;grade.textContent=parent?(item.studentGrade||'未填写'):'';
  detailScreen.classList.toggle('has-teacher-profile',item.roles.includes('teacher'));
}
function canAddRevisit(item){return Boolean(item)&&!item.followTransferredOut}
function memberFollowMarkup(item,shortTime=false){const time=shortTime?item.followTime?.replace(/^\d{4}[.\/-]/,''):item.followTime;return `<div class="registered-member-follow"><div class="registered-follow-copy">${time?`<time class="registered-follow-time" title="${escapeHtml(item.followTime)}">${escapeHtml(time)}</time>`:''}<p>${escapeHtml(item.followText||'暂无跟进记录')}</p></div><button class="registered-follow-link" type="button" data-follow-record>回访记录<span aria-hidden="true">›</span></button></div>`}
function memberActivityMarkup(item){const latest=activityRecords(item)[0],time=latest?.time.replace(/^\d{4}[.\/-]/,'');return `<div class="registered-member-follow registered-member-activity"><div class="registered-follow-copy">${latest?`<time class="registered-follow-time" title="${escapeHtml(latest.time)}">${escapeHtml(time)}</time>`:''}<p>${escapeHtml(latest?.title||'暂无行动轨迹')}</p></div><button class="registered-follow-link" type="button" data-activity-record>行动轨迹<span aria-hidden="true">›</span></button></div>`}
function memberCard(item){const markup=memberCardContent(item);return window.teamTransfer?window.teamTransfer.decorateCard(item,markup):markup}
function memberCardContent(item){
  const name=maskName(item.name),identity=memberPrimaryIdentity(item),registered=identity==='registered';
  const summary=identity==='parent'?parentDemandSummary(item):identity==='teacher'?teacherSummary(item):'';
  const actions=`<div class="card-actions cols-1">${canAddRevisit(item)?'<button class="card-action revisit-action" type="button" data-open-revisit>添加回访</button>':''}</div>`;
  return `<article class="member-card compact-member-card ${identity==='registered'?'registered':identity}-member-card" data-phone="${item.phone}" tabindex="0" role="link" aria-label="查看${name}的成员详情">${memberIdentity(item,false,identity==='parent')}${summary}${registered?memberActivityMarkup(item):''}${memberFollowMarkup(item,true)}<div class="member-card-footer${registered?' actions-only':''}">${registered?'':`<div class="member-profit">累计推广收益<strong>${item.profit}</strong></div>`}${actions}</div></article>`;
}
let activeMemberLevel="all";
const teacherFilters={type:"all",verification:"all"};
function matchesTeacherFilters(item){return (teacherFilters.type==='all'||item.teacherType===teacherFilters.type)&&(teacherFilters.verification==='all'||item.teacherVerification===teacherFilters.verification)}
// 筛选与卡片采用同一主身份：老师优先，其次家长，仅注册成员无业务身份。
function memberPrimaryIdentity(item){return item.roles.includes('teacher')?'teacher':item.roles.includes('parent')?'parent':'registered'}
function matchesMemberIdentity(item,value){return value==='all'||memberPrimaryIdentity(item)===value}
function visibleTeamMembers(){
 const items=window.teamTransfer?window.teamTransfer.source():directoryMembers(activeMemberLevel);
 const filter=$('#identityField .identity-flat-option.active')?.dataset.identityValue||'all';
 return items.filter(item=>matchesMemberIdentity(item,filter)&&(filter!=='teacher'||matchesTeacherFilters(item)));
}
function findTeamMember(phone){return directoryMembers('all').find(item=>item.phone===phone)||window.teamTransfer?.incoming.find(item=>item.phone===phone)}
function renderMembers(){
 const items=directoryMembers('all');
 const rewardCount=$('#personalCreatorOpened .creator-reward-team strong');
 if(rewardCount)rewardCount.innerHTML=`${items.length}<small>人</small>`;
 const filter=$('#identityField .identity-flat-option.active')?.dataset.identityValue||'all';
 $('#teacherSecondaryFilters').hidden=filter!=='teacher';
 const visible=visibleTeamMembers();
 $('#myTeamTotal').textContent=items.length;
 $('#myTeamToday').textContent=items.filter(item=>item.registerDate===teamDate(0)).length;
 $$('#identityField .identity-flat-option').forEach(button=>button.textContent={all:'全部',registered:'注册',parent:'家长',teacher:'老师'}[button.dataset.identityValue]);
 $('#memberResultCount').textContent=`共 ${visible.length} 位成员`;
 window.teamTransfer?.beforeRender(visible);
 $('#memberList').innerHTML=visible.length?visible.map(memberCard).join(''):'<div class="empty-result">暂无符合当前筛选条件的成员<br>请调整筛选项后查看</div>';
 window.teamTransfer?.afterRender();
}
function followRecords(item){return item.revisitRecords||[]}
function orderRecords(item){if(!item.hasOrders)return[];return [
 {status:'待确认',time:'08.20 14:32',title:'高中·英语',schedule:'周六10:00-12:00',location:'西安市雁塔区盛岸广场3楼',orderId:'202608203286'},
 {status:'待支付',time:'07.16 16:08',title:'初中·数学',schedule:'周日14:00-16:00',location:'西安市碑林区长安路教学中心2楼',orderId:'202607163508'},
 {status:'进行中',time:'06.30 11:36',title:'小学·语文',schedule:'周三18:00-20:00',location:'西安市莲湖区丰庆路学习中心1楼',orderId:'202606301126'},
 {status:'已完成',time:'06.24 09:18',title:'高中·数学',schedule:'周六14:00-16:00',location:'西安市高新区科技路学习中心2楼',orderId:'202606241207'},
 {status:'已取消',time:'06.18 17:42',title:'初中·物理',schedule:'周日09:00-11:00',location:'西安市雁塔区小寨教学中心3楼',orderId:'202606181358'},
 {status:'已完成',time:'06.12 10:26',title:'小学·英语',schedule:'周五18:30-20:00',location:'西安市未央区凤城五路学习中心1楼',orderId:'202606121469'},
 {status:'已完成',time:'06.05 15:08',title:'初中·语文',schedule:'周六16:00-18:00',location:'西安市碑林区友谊路教学中心2楼',orderId:'202606051572'},
 {status:'已取消',time:'05.28 11:54',title:'高中·化学',schedule:'周日15:00-17:00',location:'西安市莲湖区大庆路学习中心3楼',orderId:'202605281683'},
 {status:'已完成',time:'05.21 16:36',title:'小学·数学',schedule:'周二18:00-19:30',location:'西安市灞桥区长乐东路教学中心2楼',orderId:'202605211794'},
 {status:'已完成',time:'05.14 13:20',title:'初中·英语',schedule:'周四19:00-21:00',location:'西安市雁塔区电子城学习中心1楼',orderId:'202605141805'},
 {status:'已取消',time:'05.07 09:46',title:'高中·生物',schedule:'周六09:00-11:00',location:'西安市未央区文景路教学中心2楼',orderId:'202605071916'},
 {status:'已完成',time:'04.29 18:12',title:'初中·化学',schedule:'周日16:30-18:30',location:'西安市长安区韦曲学习中心3楼',orderId:'202604292027'}
].map((record,index)=>{
  // 双身份成员按每笔订单中的角色展示交易对方，单身份成员展示对应一方。
  const asTeacher=item.roles.includes('teacher')&&(!item.roles.includes('parent')||index%2===1);
  const teachers=[['刘教员','13900139001'],['王教员','13800138002'],['黄教员','13400134006']];
  const parents=[['陈小满','13800138001'],['王晓琳','13900139002'],['孙可欣','13600136004']];
  const [counterpartyName,counterpartyPhone]=(asTeacher?parents:teachers)[index%3];
  return {...record,time:`2026.${record.time}`,schedule:['周六、周日','周三、周五晚间','周六下午'][index%3],fee:['¥120.00/小时','¥150.00/小时','¥180.00/小时'][index%3],counterpartyRole:asTeacher?'家长':'老师',counterpartyName,counterpartyPhone};
})}
function demandRecords(item){
  if(memberPrimaryIdentity(item)!=='parent'||item.hasDemands===false)return[];
  const subjects=item.intendedSubjects?.length?item.intendedSubjects:['未填写'];
  return [
    {demandId:`XQ202611020${item.phone.slice(-3)}`,time:'2026.11.02 10:30',subjects:subjects.slice(0,2),status:'进行中',acceptedCount:0,fee:'¥100–150/h',methods:['在线辅导','教员上门','学员上门'],schedule:'周六、周日',address:'长庆坊·玺岸'},
    {demandId:`XQ202610260${item.phone.slice(-3)}`,time:'2026.10.26 15:20',subjects:subjects.slice(0,1),status:'已完成',acceptedCount:1,fee:'¥120–180/h',methods:['教员上门'],schedule:'周三、周五晚间',address:'长安路附近'}
  ].map(record=>({...record,grade:item.studentGrade||'未填写',region:item.region||'未填写'}));
}
function demandRecordMarkup(record){const location=[record.region,record.address].filter(value=>value&&value!=='未填写').join(' · ')||'未填写';return `<article class="detail-record-card demand-order-record parent-demand-record"><div class="parent-demand-heading"><strong>${escapeHtml(record.grade)} · ${escapeHtml(record.subjects.join('、'))}</strong><span class="parent-demand-fee">${escapeHtml(record.fee)}</span></div><div class="parent-demand-progress"><span class="parent-demand-status ${record.status==='已完成'?'is-completed':'is-active'}">${escapeHtml(record.status)}</span><span>已接单 ${record.acceptedCount}</span></div><dl class="parent-demand-fields"><div><dt>地点</dt><dd>${escapeHtml(location)}</dd></div><div><dt>时间</dt><dd>${escapeHtml(record.schedule)}</dd></div></dl><div class="demand-order-footer parent-demand-footer"><span>需求编号 ${escapeHtml(record.demandId)}</span><time>${escapeHtml(record.time)}</time></div></article>`}
function orderStatusClass(status){return({'待确认':'is-pending-confirmation','待支付':'is-pending-payment','进行中':'is-in-progress','已完成':'is-completed','已取消':'is-cancelled'})[status]||'is-unknown'}
function orderRecordMarkup(record){return `<article class="detail-record-card demand-order-record service-order-record"><div class="demand-order-heading"><strong>${escapeHtml(record.title.replace('·',' · '))}</strong><span class="demand-order-status ${orderStatusClass(record.status)}">${escapeHtml(record.status)}</span></div><div class="service-order-summary"><span class="service-order-counterparty">${escapeHtml(record.counterpartyRole)} ${escapeHtml(maskName(record.counterpartyName))}（${escapeHtml(maskPhone(record.counterpartyPhone))}）</span><strong class="service-order-fee">${escapeHtml(record.fee)}</strong></div><dl class="service-order-fields"><div><dt>时间</dt><dd>${escapeHtml(record.schedule)}</dd></div><div><dt>地点</dt><dd>${escapeHtml(record.location)}</dd></div></dl><div class="demand-order-footer service-order-footer"><span>订单号 ${escapeHtml(record.orderId)}</span><time>${escapeHtml(record.time)}</time></div></article>`}
function activityRecords(item){return [...(item.activityRecords||[])].sort((a,b)=>b.time.localeCompare(a.time))}
function activityRecordMarkup(record){return `<article class="detail-record-card activity-record"><time class="detail-record-time">${escapeHtml(record.time)}</time><div class="activity-record-heading"><strong>${escapeHtml(record.title)}</strong></div><p class="detail-record-content">${escapeHtml(record.content)}</p></article>`}
const detailTabs={follow:['回访记录','暂无回访记录',followRecords],activity:['行动轨迹','暂无行动轨迹',activityRecords],demand:['需求记录','暂无需求记录',demandRecords],purchase:['订单记录','暂无订单记录',orderRecords]};
function renderDetailTab(tab){
  const identity=memberPrimaryIdentity(currentMember);
  const available=identity==='registered'?['follow','activity']:identity==='teacher'?['follow','purchase']:['follow','demand','purchase'];
  $('#memberDetailTablist').hidden=false;
  if(!available.includes(tab))tab='follow';
  $$('#memberDetailTablist [data-member-detail-tab]').forEach(button=>{const key=button.dataset.memberDetailTab;button.hidden=!available.includes(key);const active=key===tab;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
  const [title,empty,source]=detailTabs[tab]||detailTabs.follow;const records=source(currentMember);$('#memberDetailListTitle').textContent=`${records.length} 条${title}`;
  $('#followRecordList').innerHTML=records.length?records.map(record=>tab==='purchase'?orderRecordMarkup(record):tab==='demand'?demandRecordMarkup(record):tab==='activity'?activityRecordMarkup(record):`<article class="detail-record-card"><div class="detail-record-top">${record.kind?`<span class="detail-record-kind">${escapeHtml(record.kind)}</span>`:''}<time class="detail-record-time">${record.time}</time></div>${record.title?`<div class="detail-record-title">${escapeHtml(record.title)}</div>`:''}<p class="detail-record-content">${escapeHtml(record.content||'')}</p><div class="detail-record-meta"><span>${escapeHtml(record.meta||'')}</span>${record.amount?`<strong class="detail-record-amount">${record.amount}</strong>`:''}</div></article>`).join(''):`<div class="empty-result">${empty}<br>暂无可展示内容</div>`;
}
let memberReturnScreen=overviewScreen;
function openMember(item){$('#memberDetailTeam').hidden=true;if(item.level==='一星'){const team=ensureTeamMembers(item);$('#memberDetailTeamTotal').textContent=`${team.length}人`;$('#memberDetailTeamToday').textContent=`${team.filter(child=>child.registerDate===teamDate(0)).length}人`;}$('#memberDetailRevisit').hidden=!canAddRevisit(item);if(!detailScreen.classList.contains('active'))memberReturnScreen=$('.screen.active')||overviewScreen;currentMember=item;const owner=$('#memberDetailOwner');owner.hidden=true;owner.textContent=item.level==='二星'?`所属一星成员：${maskName(item.ownerName)} · ${maskPhone(item.ownerPhone)}`:'';$('#memberDetailLevel').parentElement.hidden=true;$('#memberDetailLevel').textContent=item.level;$('#memberDetailLevel').className=`team-level-tag ${item.level==='二星'?'level-two':'level-one'}`;$('#followRecordAvatar').textContent=item.name[0];$('#followRecordName').textContent=maskName(item.name);$('#followRecordRole').innerHTML=roles(item);$('#followRecordCity').textContent=memberRegion(item);const masked=false;const contact=$('#followRecordPhone');contact.classList.toggle('masked',masked);if(masked){contact.removeAttribute('href');contact.innerHTML=`<span>${maskPhone(item.phone)}</span>`}else{contact.href=`tel:${item.phone}`;contact.innerHTML=`<span>${item.phone}</span>${phoneIcon}`}renderMemberProfileFields(item);$('#memberDetailSummary').hidden=!item.roles.length;$('#memberDetailProfit').textContent=item.profit;renderDetailTab('follow');window.teamTransfer?.renderDetail(item);showScreen(detailScreen)}

const revisitSheet=$('#revisitSheet');const keyboard=$('#iphoneKeyboard');const revisitContent=$('#revisitContent');let revisitReturnFocus=null;let keyboardTimer;let keyboardShift=false;let keyboardLayout='letters';
function updateRevisit(){const length=revisitContent.value.length;$('#revisitCount').textContent=`${length}/200`;$('#revisitMessage').hidden=true;$('#submitRevisit').disabled=!revisitContent.value.trim()}
function renderKeyboard(){const symbols=['1','2','3','4','5','6','7','8','9','0','-','/',';',':','(',')','¥','&','@','"','.',',','?','!',"'",'_'];$$('#iphoneKeyboard [data-letter]').forEach((key,index)=>{const value=keyboardLayout==='letters'?key.dataset.letter:symbols[index];key.textContent=keyboardLayout==='letters'?(keyboardShift?value.toUpperCase():value):value;key.dataset.key=value});$('#iphoneKeyboardMode').textContent=keyboardLayout==='letters'?'123':'ABC';$('#iphoneKeyboard [data-keyboard-action="shift"]').classList.toggle('active',keyboardShift&&keyboardLayout==='letters')}
function showKeyboard(){if(revisitSheet.hidden)return;clearTimeout(keyboardTimer);keyboard.hidden=false;revisitSheet.classList.add('keyboard-open');requestAnimationFrame(()=>keyboard.classList.add('open'))}
function hideKeyboard(immediate=false){keyboard.classList.remove('open');revisitSheet.classList.remove('keyboard-open');clearTimeout(keyboardTimer);if(immediate)keyboard.hidden=true;else keyboardTimer=setTimeout(()=>keyboard.hidden=true,230)}
function insertText(text){const start=revisitContent.selectionStart??revisitContent.value.length;const end=revisitContent.selectionEnd??start;const insert=String(text).slice(0,Math.max(0,200-revisitContent.value.length+end-start));revisitContent.value=revisitContent.value.slice(0,start)+insert+revisitContent.value.slice(end);revisitContent.setSelectionRange(start+insert.length,start+insert.length);updateRevisit()}
function openRevisit(trigger,item){if(!canAddRevisit(item)){showToast('暂无该成员的回访权限');return}currentMember=item;revisitReturnFocus=trigger;$('#revisitMemberCard').innerHTML=memberIdentity(item);$('#revisitLatestText').textContent=item.followText||'暂无回访记录';revisitContent.value='';$('#revisitPhrases').hidden=true;hideKeyboard(true);keyboardLayout='letters';keyboardShift=false;renderKeyboard();updateRevisit();$('#revisitMask').hidden=false;revisitSheet.hidden=false;requestAnimationFrame(()=>{$('#revisitMask').classList.add('open');revisitSheet.classList.add('open')})}
function closeRevisit(){if(revisitSheet.hidden)return;$('#revisitMask').classList.remove('open');revisitSheet.classList.remove('open');hideKeyboard(true);$('#revisitPhrases').hidden=true;setTimeout(()=>{$('#revisitMask').hidden=true;revisitSheet.hidden=true;revisitReturnFocus?.focus({preventScroll:true});revisitReturnFocus=null},240)}
function saveRevisit(){if(!canAddRevisit(currentMember)){showToast('暂无该成员的回访权限');return}const content=revisitContent.value.trim().replace(/[<>]/g,'');if(!content){$('#revisitMessage').textContent='请输入跟进内容';$('#revisitMessage').hidden=false;return}const now=new Date();const pad=value=>String(value).padStart(2,'0');const time=`${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;currentMember.followText=content;currentMember.followTime=time;currentMember.revisitRecords.unshift({time,content,meta:'跟进人：我'});const inDetail=detailScreen.classList.contains('active');closeRevisit();setTimeout(()=>{renderMembers();['one','two'].forEach(renderDirectory);if(inDetail)renderDetailTab('follow');showToast(`已添加${maskName(currentMember.name)}的回访记录`)},250)}

function commissionIcon(type){const paths={parent:'<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0M18 5.5a3.5 3.5 0 0 1 0 6.8M19.5 15a6 6 0 0 1 2 4.5"/>',teacher:'<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 11.2V16c2.8 2.4 7.2 2.4 10 0v-4.8M21 9v6"/>',cooperation:'<path d="M8.5 14.5 6 17a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4.2 0M15.5 9.5 18 7a3 3 0 0 1 4 4l-4 4a3 3 0 0 1-4.2 0M8 16l8-8"/>'};return `<span class="commission-record-icon ${type}" aria-hidden="true"><svg viewBox="0 0 24 24">${paths[type]}</svg></span>`}
function commissionName(name){return `<span class="commission-record-name">${escapeHtml(maskName(name))}</span>`}
function commissionMarkup(item){
 const isParent=item.type==='parent';
 const title=isParent?'注册家长':item.type==='teacher'?'入驻老师':'签约';
 const parentName=item.type==='parent'?item.user:item.parentName;
 const parentPhone=item.type==='parent'?item.phone:item.parentPhone;
 const teacherName=item.type==='teacher'?item.user:item.teacherName;
 const teacherPhone=item.type==='teacher'?item.phone:item.teacherPhone;
 const description=isParent
  ? `注册家长${commissionName(item.user)}（${escapeHtml(commissionPhone(item.phone))}）发布需求订单，由老师${commissionName(item.teacherName)}（${escapeHtml(commissionPhone(item.teacherPhone))}）支付。`
  : item.type==='teacher'
   ? `入驻老师${commissionName(item.user)}（${escapeHtml(commissionPhone(item.phone))}），支付家长${commissionName(item.parentName)}（${escapeHtml(commissionPhone(item.parentPhone))}）发布的需求订单。`
   : `家长${commissionName(item.parentName)}（${escapeHtml(commissionPhone(item.parentPhone))}）与老师${commissionName(item.teacherName)}（${escapeHtml(commissionPhone(item.teacherPhone))}）达成签约，需求单已支付。`;
 const invitationAttribution='';
 const lessonMethods=[...new Set(item.lessonMethods||[])];
 const lessonMethodMarkup=`<div class="commission-record-methods"><span class="commission-method-label">上课方式</span><div class="commission-method-values">${lessonMethods.length?lessonMethods.map(method=>`<span class="commission-method-tag">${escapeHtml(method)}</span>`).join(''):'<span class="commission-method-empty">未填写</span>'}</div></div>`;
 return `<article class="bill-record-item commission-record-item commission-event-record"><div class="commission-record-result"><strong class="bill-record-money">+¥${escapeHtml(item.amount)}</strong><span class="bill-record-status ${item.status}">${item.status==='settled'?'已结算':'待结算'}</span></div><div class="commission-record-heading"><span class="bill-record-title">${title}</span></div><p class="commission-record-subtitle">${description}${invitationAttribution}</p>${lessonMethodMarkup}<div class="commission-record-footer"><span class="commission-record-order"><b>需求订单号</b><span>${escapeHtml(item.orderId)}</span></span><span class="commission-record-date"><time>${escapeHtml(item.date)}</time></span></div></article>`;
}
function renderCommissions(filter=commissionFilter){
 commissionFilter=filter;
 const start=$('#commissionDateStart').value;
 const end=$('#commissionDateEnd').value;
 const invalidRange=Boolean(start&&end&&start>end);
 const dateRecords=invalidRange?[]:commissionRecords.filter(item=>{
  const date=item.date.slice(0,10).replaceAll('.','-');
  return (!start||date>=start)&&(!end||date<=end)&&(commissionStatusFilter==='all'||item.status===commissionStatusFilter);
 });
 const visible=filter==='all'?dateRecords:dateRecords.filter(item=>item.type===filter);
 $$('[data-commission-label]').forEach(button=>{button.textContent=button.dataset.commissionLabel});
 $('#commissionResultCount').textContent=invalidRange?'':`共 ${visible.length} 条记录`;
 $('#commissionResultCount').hidden=invalidRange;
 ['#commissionDateStart','#commissionDateEnd'].forEach(selector=>$(selector).setAttribute('aria-invalid',String(invalidRange)));
 const content=visible.length?visible.map(commissionMarkup).join(''):invalidRange?'<div class="empty-result">开始日期不能晚于结束日期</div>':'<div class="empty-result">暂无符合筛选条件的分润明细</div>';
 $('#commissionList').innerHTML=content;
 $('#clearCommissionDates').disabled=!start&&!end;
}
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
function updateWithdraw(){const availableText=withdrawAvailable.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});$('#withdrawAvailable').textContent=availableText;$('#billAvailableTotal').textContent=`¥${availableText}`;$('#withdrawTodayUsage').textContent=`${withdrawCount} 次 · ¥${withdrawTotal.toFixed(2)}`;$('#withdrawAll').disabled=withdrawCount>=withdrawLimits.count||maxWithdrawable()<withdrawLimits.min}
function resetBill(){commissionStatusFilter='all';$('#promotionPendingFilter').hidden=true;$('#withdrawDetails').open=false;$('#withdrawAmount').value=maxWithdrawable().toFixed(2);clearWithdrawError();updateTax();updateWithdraw();$('#commissionDateStart').value='';$('#commissionDateEnd').value='';setCommissionFilter('all')}
function submitWithdraw(event){event.preventDefault();const input=$('#withdrawAmount');const value=Number(input.value);let message='';if(!savedBank)message='请先填写并保存收款银行卡';else if(!$('#bankEditor').hidden)message='请先保存银行卡修改，或取消修改';else if(!input.value||!Number.isFinite(value))message='请输入提现金额';else if(withdrawCount>=withdrawLimits.count)message='今日提现次数已达3次，请明日再试';else if(value<withdrawLimits.min)message='单笔提现金额不能低于10元';else if(value>withdrawLimits.max)message='单笔提现金额不能超过2000元';else if(value>withdrawAvailable)message='提现金额不能超过可提现佣金';else if(withdrawTotal+value>withdrawLimits.daily)message=`今日剩余可提现额度为¥${Math.max(0,withdrawLimits.daily-withdrawTotal).toFixed(2)}`;if(message){input.setAttribute('aria-invalid','true');$('#withdrawMessage').textContent=message;$('#withdrawMessage').hidden=false;input.focus();return}const amounts=calculateWithdrawal(value);const destination=savedBank.bank;withdrawAvailable=Math.round((withdrawAvailable-value)*100)/100;withdrawCount++;withdrawTotal=Math.round((withdrawTotal+value)*100)/100;withdrawRecords.unshift({bank:savedBank.bank,tail:savedBank.card.slice(-4),date:new Date().toLocaleString('zh-CN',{hour12:false}),amount:amounts.gross.toFixed(2),status:'审核中',tone:'reviewing'});renderWithdrawRecords();updateWithdraw();input.value=maxWithdrawable()>=withdrawLimits.min?maxWithdrawable().toFixed(2):'';updateTax();showToast(`已提交¥${amounts.gross.toFixed(2)}至${destination}`)}

function openWithdraw(){withdrawReturnScreen=$('.screen.active')||overviewScreen;resetBill();renderSavedBank();renderWithdrawRecords();showScreen($('#withdrawScreen'))}
function openBill(mode){if(mode==='withdraw'){openWithdraw();return}billReturnScreen=$('.screen.active')||overviewScreen;resetBill();if(mode==='pending'){commissionStatusFilter='pending';$('#promotionPendingFilter').hidden=false;setCommissionFilter('all')}$('#billIncomeTotal').textContent=`¥${cumulativeIncomeTotal}`;showScreen(billScreen)}
$('#billWithdrawToggle').addEventListener('click',openWithdraw);
$('#closeWithdraw').addEventListener('click',()=>showScreen(withdrawReturnScreen));
$('#saveBank').addEventListener('click',saveBank);
$('#editSavedBank').addEventListener('click',()=>renderSavedBank(true));
$('#cancelBankEdit').addEventListener('click',()=>renderSavedBank());
$('#closeBill').addEventListener('click',()=>showScreen(billReturnScreen));
$('#closeFollowRecord').addEventListener('click',()=>{showScreen(memberReturnScreen);if(detailScreen.dataset.fromTeam){delete detailScreen.dataset.fromTeam;if(teamFromDetail)openMember(teamOwner);openTeam(teamOwner)}});
$('#memberDetailTeam').addEventListener('click',()=>openTeam(currentMember));
$('#memberDetailRevisit').addEventListener('click',event=>openRevisit(event.currentTarget,currentMember));
$$('[data-member-detail-tab]').forEach(button=>button.addEventListener('click',()=>renderDetailTab(button.dataset.memberDetailTab)));
$$('#identityField .identity-flat-option').forEach(button=>button.addEventListener('click',()=>{$$('#identityField .identity-flat-option').forEach(option=>{const active=option===button;option.classList.toggle('active',active);option.setAttribute('aria-pressed',String(active))});renderMembers()}));
$$('#teacherSecondaryFilters select').forEach(select=>select.addEventListener('change',()=>{
  teacherFilters[select.dataset.teacherFilter]=select.value;
  select.classList.toggle('is-filtered',select.value!=='all');
  renderMembers();
}));
const teamMask=$('#teamMask');const teamSheet=$('#teamSheet');
let teamOwner=null,teamTrigger=null,teamItems=[],teamFromDetail=false;
function teamDate(days){const d=new Date();d.setDate(d.getDate()-days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function renderTeam(){
 const visible=teamItems;
 $('#teamMemberList').innerHTML=visible.length?visible.map(i=>`<article class="member-card team-detail-card"><div class="team-card-top"><span class="team-level-tag level-two">二星</span><button type="button" data-team-follow="${i.phone}">回访记录 ›</button></div><div class="member-head"><span class="avatar">${i.name[0]}</span><div class="member-info"><div class="member-name">${maskName(i.name)}${memberCardRoles(i)}</div><div class="member-meta team-contact"><span>${escapeHtml(memberRegion(i))}</span>${memberPhone(i)}</div><div class="team-register">注册于 ${i.registerDate.replaceAll('-','.')}</div></div><div class="member-profit">累计推广收益<strong>${i.profit}</strong></div></div><div class="trace"><div class="trace-row"><span>最近跟进</span><span class="trace-copy">${escapeHtml(i.followText)}</span><span class="trace-time">${i.followTime}</span></div></div></article>`).join(''):'<div class="empty-result">暂无团队成员</div>';
}
function ensureTeamMembers(item){
 if(!item.teamMembers){const names=['冯雪','潘莉','许宁','周敏','郑雨桐','吴思远','方晨曦','宋佳宁'];const profits=['825.62','617.96','300.70','61.54','198.00','96.00','188.00','174.29'];item.teamMembers=names.slice(0,item.teamCount).map((name,index)=>{const roles=index===2?['teacher','parent']:index%3===1?['teacher']:['parent'];return{name:roles.includes('teacher')?`${[...name][0]}教员`:name,level:'二星',phone:`12000000${405+members.indexOf(item)*10+index}`,roles,city:index===2?'陕西·咸阳':'陕西·西安',...(roles.includes('teacher')?teacherDemoFields(index,index===2?'陕西·咸阳':'陕西·西安'):{}),...(roles.includes('parent')?parentDemoFields(index,index===2?'陕西·咸阳':'陕西·西安'):{}),profit:`¥ ${profits[index]}`,hasOrders:index%2===0,registerDate:teamDate(index<item.teamToday?0:(index-item.teamToday+1)*4),followText:['已电话沟通，家长有意向上课','已发送课程资料，等待进一步回复','已完成教师入驻资料确认'][index%3],followTime:index<2?'今天 13:43':'昨天 11:05',revisitRecords:[]}})}
 item.teamMembers.forEach((child,index)=>{if(!child.revisitDemoSeeded){Object.assign(child,memberLocationDemoFields(child,index),revisitDemoFields(child,index));child.revisitDemoSeeded=true}child.ownerName=item.name;child.ownerPhone=item.phone});return item.teamMembers;
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
$('#memberList').addEventListener('click',event=>{const card=event.target.closest('.member-card');if(!card||event.target.closest('.phone-link'))return;const item=findTeamMember(card.dataset.phone);if(event.target.closest('[data-team-summary]'))openTeam(item);else if(event.target.closest('[data-open-revisit]'))openRevisit(event.target,item);else {openMember(item);if(event.target.closest('[data-activity-record]'))renderDetailTab('activity')}});
$('#teamMask').addEventListener('click',closeTeam);$('#teamSheetClose').addEventListener('click',closeTeam);
$('#memberList').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('.member-card')){event.preventDefault();openMember(findTeamMember(event.target.dataset.phone))}});
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
['#commissionDateStart','#commissionDateEnd'].forEach(selector=>$(selector).addEventListener('change',()=>renderCommissions()));
$('#clearCommissionDates').addEventListener('click',()=>{$('#commissionDateStart').value='';$('#commissionDateEnd').value='';renderCommissions()});
$('#withdrawAll').addEventListener('click',()=>{$('#withdrawAmount').value=maxWithdrawable().toFixed(2);clearWithdrawError();updateTax()});
$('#withdrawAmount').addEventListener('input',event=>{const parts=event.target.value.replace(/[^\d.]/g,'').split('.');event.target.value=parts.length>1?`${parts.shift()}.${parts.join('').slice(0,2)}`:parts[0];clearWithdrawError();updateTax()});
$('#withdrawForm').addEventListener('submit',submitWithdraw);
document.addEventListener('keydown',event=>{if(event.key!=='Escape'||$('#promotionDialog').open)return;if(!keyboard.hidden)hideKeyboard();else if(!revisitSheet.hidden)closeRevisit();else if(!teamSheet.hidden)closeTeam();else if(detailScreen.classList.contains('active'))$('#closeFollowRecord').click();else if($('#withdrawScreen').classList.contains('active'))$('#closeWithdraw').click();else if(billScreen.classList.contains('active'))$('#closeBill').click();else if($('.team-directory-screen.active'))showScreen(overviewScreen);else if(overviewScreen.classList.contains('active'))$('#backToPersonal').click();else if($('#promotionHomeScreen').classList.contains('active'))showScreen($('#personalScreen'))});
renderMembers();renderCommissions();renderWithdrawRecords();updateWithdraw();

function directoryMembers(level){return level==='all'?[...members,...members.flatMap(ensureTeamMembers)]:level==='one'?members:members.flatMap(ensureTeamMembers)}
function renderDirectory(level){
 const items=directoryMembers(level),filters=$(`#${level}TeamFilters`);
 const selected=filters.querySelector('.active')?.dataset.directoryIdentity||'all';
 filters.querySelectorAll('button').forEach(button=>{const value=button.dataset.directoryIdentity;const count=items.filter(item=>matchesMemberIdentity(item,value)).length;button.textContent=`${{all:'全部',teacher:'老师',parent:'家长'}[value]} ${count}`});
 const visible=items.filter(item=>matchesMemberIdentity(item,selected));
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

let myTeamReturnScreen;
function openMyTeam(){
 myTeamReturnScreen=$('.screen.active')||$('#promotionHomeScreen');
 $('#backToPersonal').setAttribute('aria-label',myTeamReturnScreen.id==='personalScreen'?'返回个人中心':'返回推广中心');
 showScreen(overviewScreen);
}
$('#backToPersonal').addEventListener('click',()=>showScreen(myTeamReturnScreen||$('#promotionHomeScreen')));

$('#personalBack').addEventListener('click',()=>showScreen($('#promotionHomeScreen')));
function setCreatorDemoOpened(opened){
 $('#creatorDemoToggle').setAttribute('aria-checked',String(opened));
 $('#personalScreen').classList.toggle('personal-screen-open',opened);
 $('#personalCreatorLocked').hidden=opened;
 $('#personalCreatorOpened').hidden=!opened;
 setTimeout(()=>$('#personalScreen .personal-design-scroll')?.scrollTo(0,0),0);
}
const initialCreatorState=new URLSearchParams(location.search).get('creator');
setCreatorDemoOpened(initialCreatorState!=='closed');
$('#creatorDemoToggle').addEventListener('click',()=>setCreatorDemoOpened($('#creatorDemoToggle').getAttribute('aria-checked')!=='true'));
$('#personalOpenCreator').addEventListener('click',()=>setCreatorDemoOpened(true));
$('#personalOpenTeam').addEventListener('click',openMyTeam);
$('#personalOpenIncome').addEventListener('click',()=>openBill('income'));
$('#personalEnterCreator').addEventListener('click',()=>showScreen($('#promotionHomeScreen')));
showScreen($('#personalScreen'));
