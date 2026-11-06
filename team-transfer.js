/* 跟进转移原型：只改变跟进权限，邀请归属、团队总数与收益保持原口径；刷新恢复演示数据。 */
window.teamTransfer = (() => {
  'use strict';
  const phone = $('.phone');
  const recipients = [
    {id:'LB10002',name:'李明',phone:'13900001002',region:'陕西省·西安市·雁塔区'},
    {id:'LB10003',name:'周敏',phone:'13900001003',region:'陕西省·西安市·碑林区'},
    {id:'LB10004',name:'吴晓',phone:'13900001004',region:'陕西省·咸阳市·秦都区'}
  ];
  const dateTime = (days,clock='10:30') => `${teamDate(days).replaceAll('-','.')} ${clock}`;
  const incoming = [
    ['杨子涵','12000000601','parent',0],['何教员','12000000602','teacher',1],
    ['苏雨','12000000603','registered',2],['汪教员','12000000604','teacher',3],
    ['程悦','12000000605','parent',4],['陆晨','12000000606','registered',5]
  ].map(([name,memberPhone,role,days],index) => {
    const sender=recipients[index%recipients.length];
    const item={name,phone:memberPhone,roles:role==='registered'?[]:[role],level:'一星',city:'陕西·西安',
      transferredFollow:true,sender,receivedAt:dateTime(days),registerDate:teamDate(days+3),
      registeredIntent:index%2?'teacher':'parent',profit:['¥ 3,680.00','¥ 1,280.00','¥ 0.00'][index%3],
      hasOrders:role!=='registered',hasDemands:role==='parent',teamCount:0,teamToday:0,
      ...(role==='teacher'?teacherDemoFields(index):role==='parent'?parentDemoFields(index):{})};
    Object.assign(item,memberLocationDemoFields(item,index),revisitDemoFields(item,index));
    // 接收后产生的人工回访与接收前的历史回访一起保留。
    item.revisitRecords.unshift({time:dateTime(days,'14:20'),content:role==='teacher'?'已联系老师，确认可接课科目和时间，后续匹配合适需求。':role==='parent'?'已接手跟进，家长有上课意向，约定进一步确认学生学习情况。':'已接手联系，向用户说明资料完善流程，约定后续协助。',meta:'跟进人：我'});
    item.followText=item.revisitRecords[0].content;item.followTime=item.revisitRecords[0].time;
    if(role==='registered')item.activityRecords=registeredActivityDemo(item.registeredIntent,item.registerDate,3);
    return item;
  });
  const records=incoming.map((item,index)=>({id:`received-${index}`,direction:'in',time:item.receivedAt,
    member:{name:item.name,phone:item.phone},sender:item.sender,receiver:{name:'我',phone:''},batchId:''}));
  // 已转出演示：覆盖三种身份及单人、批量交接，与成员的跟进权限同步。
  [
    ['12000000104',0,1,'16:20',''],['12000000106',1,2,'11:45',''],
    ['12000000105',2,3,'15:10','demo-batch-1'],['12000000108',2,3,'15:10','demo-batch-1'],
    ['12000000211',0,4,'09:30','demo-batch-2'],['12000000212',0,4,'09:30','demo-batch-2']
  ].forEach(([memberPhone,receiverIndex,days,clock,batchId])=>{
    const item=members.find(member=>member.phone===memberPhone),recipient=recipients[receiverIndex];
    const time=dateTime(days,clock);
    item.followTransferredOut=true;item.followReceiver={...recipient};item.transferredAt=time;
    records.push({id:`demo-out-${memberPhone}`,direction:'out',time,member:{name:item.name,phone:item.phone},sender:{name:'我',phone:''},receiver:{...recipient},batchId});
  });
  let scope='own',batch=false,selected=new Set(),visible=[],recordFilter='out';
  let targets=[],receiver=null,returnFocus=null,backgroundScreen=null,recordReturnScreen=overviewScreen;
  const canTransfer=item=>Boolean(item)&&!item.transferredFollow&&!item.followTransferredOut;
  const source=()=>scope==='received'?incoming:directoryMembers('all');
  const personName=person=>person.name==='我'?'我':maskName(person.name);
  const senderLabel=person=>`${personName(person)}${person.phone?' '+maskPhone(person.phone):''}`;

  $('.my-team-heading').insertAdjacentHTML('beforebegin',`<div class="team-scope-tabs" role="group" aria-label="成员来源"><button type="button" class="active" data-team-scope="own" aria-pressed="true">团队成员</button><button type="button" data-team-scope="received" aria-pressed="false">转跟进成员</button></div>`);
  $('#memberResultCount').outerHTML=`<div class="team-list-tools"><div class="member-result-count" id="memberResultCount" role="status" aria-live="polite"></div><div class="team-list-actions"><button type="button" id="openTransferRecords">转移记录</button><button type="button" id="startTeamBatch">批量转移</button></div></div><div class="team-batch-bar" id="teamBatchBar" hidden><label><input type="checkbox" id="selectVisibleMembers">全选</label><span id="teamBatchCount" aria-live="polite">已选 0 人</span><button type="button" id="cancelTeamBatch">取消</button><button type="button" id="submitTeamBatch" disabled>转移</button></div>`;
  $('#memberDetailRevisit').insertAdjacentHTML('beforebegin','<p class="team-transfer-notice" id="detailTransferNotice" hidden></p><div class="detail-transfer-actions" id="detailTransferActions"><button type="button" id="memberDetailTransfer">转移跟进</button></div>');
  $('#detailTransferActions').append($('#memberDetailRevisit'));

  phone.insertAdjacentHTML('beforeend',`<section class="screen" id="transferRecordScreen" aria-label="转移记录" inert>${overviewScreen.querySelector('.statusbar').outerHTML}<header class="navbar"><button class="back" type="button" id="closeTransferRecords" aria-label="返回我的团队"></button><strong class="navbar-title">转移记录</strong>${overviewScreen.querySelector('.capsule').outerHTML}</header><div class="scroll transfer-record-scroll"><div class="transfer-record-filters" role="group" aria-label="转移方向"><button type="button" class="active" data-transfer-direction="out" aria-pressed="true">我转出的</button><button type="button" data-transfer-direction="in" aria-pressed="false">我接收的</button></div><p id="transferRecordCount" role="status"></p><div id="transferRecordList"></div></div></section>
    <div class="team-transfer-mask" id="teamTransferMask" hidden></div>
    <section class="team-transfer-sheet" id="teamTransferSheet" role="dialog" aria-modal="true" aria-labelledby="teamTransferTitle" hidden>
      <header><div><h2 id="teamTransferTitle">转移跟进</h2><p>选择接收人，交接成员跟进</p></div><button type="button" id="closeTeamTransfer" aria-label="关闭转移跟进">×</button></header>
      <div class="team-transfer-body"><div class="transfer-target-summary"><span id="transferTargetLabel"></span><strong id="transferTargetNames"></strong><details id="transferTargetDetails" hidden><summary>查看所选成员</summary><div id="transferTargetList"></div></details></div>
      <label class="transfer-search-label" for="transferReceiverSearch">接收人</label><input type="search" id="transferReceiverSearch" placeholder="输入接收人完整手机号" inputmode="tel" autocomplete="off" maxlength="11"><div class="transfer-recipient-list" id="transferReceiverList" role="group" aria-label="可选接收人"></div>
      <p class="transfer-effect" id="transferEffect">仅交接跟进权限，团队归属与收益不变。</p><p class="transfer-form-error" id="transferFormError" role="alert" hidden></p></div>
      <footer><button type="button" id="cancelTeamTransfer">取消</button><button type="button" id="confirmTeamTransfer" disabled>确认转移</button></footer>
    </section>`);
  const sheet=$('#teamTransferSheet'),mask=$('#teamTransferMask'),recordScreen=$('#transferRecordScreen');
  const search=$('#transferReceiverSearch');

  function decorateCard(item,markup){
    const selecting=batch&&scope==='own'&&visible.includes(item);
    const eligible=canTransfer(item);
    const selection=selecting?`<label class="team-member-select${eligible?'':' is-disabled'}"><input type="checkbox" data-select-transfer="${item.phone}" aria-label="选择${maskName(item.name)}" ${selected.has(item.phone)?'checked':''} ${eligible?'':'disabled'}><span>${eligible?'选择成员':'已转出'}</span></label>`:'';
    const notice=item.followTransferredOut?`<div class="card-transfer-info">已转交 ${escapeHtml(personName(item.followReceiver))} 跟进</div>`:'';
    let result=markup.replace(/(<article\b[^>]*>)/,`$1${selection}${notice}`);
    if(eligible&&!selecting){
      const action='<button class="card-action" type="button" data-transfer-member>转移跟进</button>';
      result=result.replace('<div class="card-actions cols-1">',`<div class="card-actions cols-1">${action}`);
    }
    if(selecting)result=result.replace('class="member-card','class="member-card transfer-selecting'+(selected.has(item.phone)?' transfer-selected':''));
    return result;
  }
  function beforeRender(items){
    visible=items;
    // 换筛选后清除不可见项，避免误转移屏幕外的成员。
    selected=new Set([...selected].filter(memberPhone=>items.some(item=>item.phone===memberPhone&&canTransfer(item))));
  }
  function afterRender(){
    $('.my-team-heading').hidden=scope!=='own';
    $('#startTeamBatch').hidden=scope!=='own'||batch;
    $('#startTeamBatch').disabled=!visible.some(canTransfer);
    $('#teamBatchBar').hidden=!batch;
    $('#teamBatchCount').textContent=`已选 ${selected.size} 人`;
    $('#submitTeamBatch').disabled=!selected.size;
    const eligible=visible.filter(canTransfer),all=$('#selectVisibleMembers');
    all.checked=eligible.length>0&&selected.size===eligible.length;
    all.indeterminate=selected.size>0&&selected.size<eligible.length;
    all.disabled=!eligible.length;
  }
  function renderDetail(item){
    const notice=$('#detailTransferNotice');
    notice.hidden=!item.transferredFollow&&!item.followTransferredOut;
    notice.textContent=item.followTransferredOut?`已转交 ${personName(item.followReceiver)} 跟进 · ${item.transferredAt}`:item.transferredFollow?`${senderLabel(item.sender)} 转入 · ${item.receivedAt}`:'';
    $('#memberDetailTransfer').hidden=!canTransfer(item);
    $('#detailTransferActions').hidden=!canTransfer(item)&&!canAddRevisit(item);
    $('#detailTransferActions').classList.toggle('single',!canTransfer(item));
  }
  function setBatch(value){batch=value;selected.clear();renderMembers()}
  function renderRecipients(){
    const query=search.value.trim();
    const list=$('#transferReceiverList');
    list.hidden=!/^\d{11}$/.test(query);
    if(list.hidden){list.innerHTML='';return}
    const matches=recipients.filter(person=>person.phone===query);
    $('#transferReceiverList').innerHTML=matches.length?matches.map(person=>`<button type="button" class="transfer-recipient${receiver?.id===person.id?' selected':''}" data-transfer-receiver="${person.id}" aria-pressed="${receiver?.id===person.id}"><span class="avatar">${person.name[0]}</span><span class="transfer-recipient-copy"><strong>${maskName(person.name)}<small>${person.phone}</small></strong><span>${person.region}</span></span><span class="transfer-radio" aria-hidden="true">${receiver?.id===person.id?'✓':''}</span></button>`).join(''):'<div class="transfer-no-result">未找到可接收的用户<br>请核对手机号</div>';
  }
  function openTransfer(items,trigger){
    targets=items.filter(canTransfer);
    if(!targets.length){showToast('当前没有可转移的成员');return}
    receiver=null;search.value='';returnFocus=trigger;
    $('#teamTransferTitle').textContent=targets.length>1?'批量转移跟进':'转移跟进';
    $('#transferTargetLabel').textContent=targets.length>1?`已选 ${targets.length} 位成员`:'当前转移成员';
    $('#transferTargetNames').textContent=targets.length===1?`${maskName(targets[0].name)}　${targets[0].phone}`:targets.slice(0,3).map(item=>maskName(item.name)).join('、')+(targets.length>3?' 等':'');
    $('#transferTargetDetails').hidden=targets.length<2;$('#transferTargetDetails').open=false;
    $('#transferTargetList').innerHTML=targets.map(item=>`<p>${maskName(item.name)}<span>${item.phone}</span></p>`).join('');
    $('#transferEffect').textContent='仅交接跟进权限，团队归属与收益不变。';
    $('#transferFormError').hidden=true;$('#confirmTeamTransfer').disabled=true;
    $('#confirmTeamTransfer').textContent=targets.length>1?`确认转移 ${targets.length} 人`:'确认转移';
    renderRecipients();
    backgroundScreen=$('.screen.active');if(backgroundScreen)backgroundScreen.inert=true;
    mask.hidden=false;sheet.hidden=false;$('#closeTeamTransfer').focus();
  }
  function closeTransfer(){
    if(sheet.hidden)return;
    sheet.hidden=true;mask.hidden=true;
    if(backgroundScreen)backgroundScreen.inert=false;
    if(returnFocus?.isConnected&&!returnFocus.hidden)returnFocus.focus({preventScroll:true});
    else $('#openTransferRecords').focus({preventScroll:true});
    targets=[];receiver=null;
  }
  function confirmTransfer(){
    if(sheet.hidden||!receiver||!recipients.includes(receiver))return;
    const valid=targets.filter(canTransfer);
    if(valid.length!==targets.length||!valid.length){$('#transferFormError').textContent='成员跟进状态已变化，请关闭后重新选择。';$('#transferFormError').hidden=false;return}
    const time=new Date().toLocaleString('sv-SE').slice(0,16).replaceAll('-','.');
    const batchId=valid.length>1?`batch-${Date.now()}`:'';
    valid.forEach(item=>{
      item.followTransferredOut=true;item.followReceiver={...receiver};item.transferredAt=time;
      records.unshift({id:`out-${item.phone}-${Date.now()}`,direction:'out',time,member:{name:item.name,phone:item.phone},sender:{name:'我',phone:''},receiver:{...receiver},batchId});
    });
    const wasDetail=detailScreen.classList.contains('active'),destination=personName(receiver);
    closeTransfer();batch=false;selected.clear();renderMembers();['one','two'].forEach(renderDirectory);
    if(wasDetail){$('#memberDetailRevisit').hidden=true;renderDetail(currentMember)}
    showToast(`已将 ${valid.length} 位成员转交${destination}跟进`);
  }
  function renderRecords(){
    const items=records.filter(record=>record.direction===recordFilter);
    $$('#transferRecordScreen [data-transfer-direction]').forEach(button=>{const active=button.dataset.transferDirection===recordFilter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
    $('#transferRecordCount').textContent=`共 ${items.length} 条转移记录`;
    $('#transferRecordList').innerHTML=items.length?items.map(record=>`<article class="team-transfer-record"><div class="transfer-record-heading"><time>${record.time}</time><span>${record.batchId?'批量转出':record.direction==='out'?'转出':'转入'}</span></div><div class="transfer-record-member"><strong>${maskName(record.member.name)}</strong><span>${record.member.phone}</span></div><div class="transfer-record-route"><div><small>转出人</small><span>${personName(record.sender)}</span>${record.sender.phone?`<small>${record.sender.phone}</small>`:''}</div><span class="transfer-route-arrow" aria-hidden="true">→</span><div><small>接收人</small><span>${personName(record.receiver)}</span>${record.receiver.phone?`<small>${record.receiver.phone}</small>`:''}</div></div></article>`).join(''):'<div class="empty-result">暂无转出记录<br>转移成员后，可在这里查看交接信息</div>';
  }

  $$('[data-team-scope]').forEach(button=>button.addEventListener('click',()=>{
    scope=button.dataset.teamScope;batch=false;selected.clear();
    $$('[data-team-scope]').forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active))});
    renderMembers();
  }));
  $('#startTeamBatch').addEventListener('click',()=>setBatch(true));
  $('#cancelTeamBatch').addEventListener('click',()=>setBatch(false));
  $('#selectVisibleMembers').addEventListener('change',event=>{selected=new Set(event.target.checked?visible.filter(canTransfer).map(item=>item.phone):[]);renderMembers()});
  $('#submitTeamBatch').addEventListener('click',event=>openTransfer(visible.filter(item=>selected.has(item.phone)),event.currentTarget));
  $('#memberDetailTransfer').addEventListener('click',event=>openTransfer([currentMember],event.currentTarget));
  // 捕获新增操作，避免触发原有整卡跳转；批量模式整卡只做勾选。
  function handleCardEvent(event){
    const card=event.target.closest('.member-card');if(!card)return;
    const item=findTeamMember(card.dataset.phone);if(!item)return;
    if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
    if(event.type==='keydown'&&event.target!==card)return;
    if(batch&&card.closest('#memberList')){
      if(event.target.closest('.team-member-select')&&!event.target.matches('input'))return;
      event.preventDefault();event.stopImmediatePropagation();
      if(!canTransfer(item))return;
      selected.has(item.phone)?selected.delete(item.phone):selected.add(item.phone);
      renderMembers();$(`#memberList [data-phone="${item.phone}"]`)?.focus({preventScroll:true});
    }else if(event.target.closest('[data-transfer-member]')){
      event.preventDefault();event.stopImmediatePropagation();openTransfer([item],event.target.closest('button'));
    }
  }
  ['memberList','oneTeamList','twoTeamList'].forEach(id=>{
    $(`#${id}`).addEventListener('click',handleCardEvent,true);
    $(`#${id}`).addEventListener('keydown',handleCardEvent,true);
  });
  search.addEventListener('input',()=>{receiver=null;$('#confirmTeamTransfer').disabled=true;$('#transferEffect').textContent='仅交接跟进权限，团队归属与收益不变。';renderRecipients()});
  $('#transferReceiverList').addEventListener('click',event=>{
    const button=event.target.closest('[data-transfer-receiver]');if(!button)return;
    receiver=recipients.find(person=>person.id===button.dataset.transferReceiver);
    renderRecipients();$('#confirmTeamTransfer').disabled=!receiver;
    $('#transferEffect').textContent=`确认后由${personName(receiver)}（${receiver.phone}）跟进，您将不能继续添加回访或再次转移。团队归属与收益不变。`;
    $(`[data-transfer-receiver="${receiver.id}"]`)?.focus({preventScroll:true});
  });
  ['closeTeamTransfer','cancelTeamTransfer','teamTransferMask'].forEach(id=>$(`#${id}`).addEventListener('click',closeTransfer));
  $('#confirmTeamTransfer').addEventListener('click',confirmTransfer);
  $('#openTransferRecords').addEventListener('click',()=>{recordReturnScreen=$('.screen.active');recordFilter=scope==='received'?'in':'out';renderRecords();showScreen(recordScreen)});
  $('#closeTransferRecords').addEventListener('click',()=>showScreen(recordReturnScreen));
  $$('[data-transfer-direction]').forEach(button=>button.addEventListener('click',()=>{recordFilter=button.dataset.transferDirection;renderRecords()}));
  document.addEventListener('keydown',event=>{
    if(!sheet.hidden){
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeTransfer()}
      if(event.key==='Tab'){
        const focusable=[...sheet.querySelectorAll('button:not(:disabled),input,summary')].filter(node=>!node.closest('[hidden]')&&node.getClientRects().length);
        const first=focusable[0],last=focusable.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
      }
    }else if(event.key==='Escape'&&recordScreen.classList.contains('active')){event.preventDefault();event.stopImmediatePropagation();showScreen(recordReturnScreen)}
    else if(event.key==='Escape'&&batch&&overviewScreen.classList.contains('active')){event.preventDefault();event.stopImmediatePropagation();setBatch(false)}
  },true);
  return {incoming,source,decorateCard,beforeRender,afterRender,renderDetail};
})();
renderMembers();
