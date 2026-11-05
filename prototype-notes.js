/* 说明默认收起；数据与独立开发文档共用 prototype-spec.js。只观察业务状态，不修改业务数据。 */
(() => {
  'use strict';
  const spec=window.PROMOTION_PROTOTYPE_SPEC;
  if(!spec)return;
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const byId=new Map(spec.sections.map(section=>[section.id,section]));
  const style=document.createElement('style');
  style.textContent=`.prototype-notes{position:fixed;left:calc(50% + 220px);right:16px;top:76px;max-height:calc(100vh - 100px);overflow:auto;z-index:1;padding:18px;background:#fff;border:1px solid #dce8e2;border-radius:12px;color:#465a50;font:13px/1.8 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;box-sizing:border-box}.prototype-notes>summary{display:flex;align-items:center;justify-content:space-between;gap:16px;cursor:pointer;list-style:none;font-size:15px;font-weight:600;color:#253c35}.prototype-notes>summary::-webkit-details-marker{display:none}.prototype-notes>summary::after{content:'展开';color:#007c6b;font-size:12px;font-weight:400}.prototype-notes[open]>summary{margin-bottom:12px}.prototype-notes[open]>summary::after{content:'收起'}.prototype-notes:not([open]){left:auto;width:max-content;padding:10px 14px}.prototype-note-state{margin-bottom:10px;padding:8px 10px;border-radius:7px;background:#edf7f2;color:#007c6b;font-weight:600}.prototype-note-links{display:flex;flex-wrap:wrap;gap:4px 12px;margin-bottom:14px}.prototype-notes a{color:#007c6b;font-size:12px}.prototype-notes h2{margin:18px 0 5px;font-size:15px;color:#253c35}.prototype-notes h3{margin:12px 0 5px;font-size:13px;color:#007c6b}.prototype-notes p{margin:0 0 7px}.prototype-notes dl{margin:0}.prototype-notes dt{font-weight:600;color:#314c40;margin-top:9px}.prototype-notes dd{margin:2px 0 0;overflow-wrap:anywhere}.prototype-notes ul{margin:6px 0;padding-left:19px}.prototype-notes li{margin:6px 0}.prototype-note-hint{color:#687e72;font-size:12px}.prototype-note-context{color:#687e72;font-size:12px;margin-top:4px}@media(max-width:1150px){.prototype-notes{position:relative;inset:auto;width:calc(100% - 32px);max-width:760px;margin:0 auto 24px;max-height:none}.prototype-notes:not([open]){margin:0 16px 24px auto}}`;
  document.head.append(style);
  const panel=document.createElement('details');
  panel.className='prototype-notes';panel.setAttribute('aria-label','原型说明');
  panel.innerHTML='<summary>原型说明</summary><div class="prototype-note-state"></div><nav class="prototype-note-links" aria-label="开发说明入口"></nav><p class="prototype-note-hint">以下按当前页面、身份和操作更新；未实现及待确认的规则会明确标注。</p><div class="prototype-note-body"></div>';
  document.body.append(panel);
  let previous='';
  const visible=selector=>{const el=document.querySelector(selector);return Boolean(el)&&!el.hidden};
  function currentContext(){
    const active=document.querySelector('.screen.active')?.id;
    if(visible('#teamTransferSheet'))return{ids:['transfer'],label:document.querySelector('#teamTransferTitle').textContent};
    if(visible('#revisitSheet'))return{ids:['revisit'],label:visible('#revisitPhrases')?'添加回访 · 常用语':'添加回访'};
    if(document.querySelector('#promotionDialog')?.open)return{ids:['invite'],label:'邀请好友 · 分享海报'};
    if(active==='transferRecordScreen')return{ids:['transferRecords'],label:'转移记录 · '+(document.querySelector('[data-transfer-direction].active')?.textContent||'')};
    if(active==='personalScreen')return{ids:['personal'],label:'个人中心 · '+(document.querySelector('#creatorDemoToggle').getAttribute('aria-checked')==='true'?'已开通':'未开通')};
    if(active==='promotionHomeScreen')return{ids:['home'],label:'推广中心首页'};
    if(active==='billScreen')return{ids:['bill'],label:'我的账单 · '+(document.querySelector('[data-commission-filter].active')?.textContent||'全部')};
    if(active==='withdrawScreen')return{ids:['withdraw','bank','withdrawHistory'],label:'收益提现 · '+(visible('#bankEditor')?'银行卡填写／修改':'已保存银行卡')};
    if(active==='followRecordScreen'){
      const tab=document.querySelector('[data-member-detail-tab].active')?.dataset.memberDetailTab||'follow';
      const identity=typeof currentMember!=='undefined'&&currentMember?memberPrimaryIdentity(currentMember):'registered';
      const current={follow:'follow',activity:'activity',demand:'demand',purchase:'order'}[tab];
      return{ids:['memberDetail',current],label:({registered:'注册',parent:'家长',teacher:'老师'}[identity])+'成员详情 · '+({follow:'回访记录',activity:'行动轨迹',demand:'需求记录',purchase:'订单记录'}[tab])};
    }
    return{ids:visible('#teamBatchBar')?['batch','team']:['team','memberCards'],label:'我的团队 · '+(visible('#teamBatchBar')?'批量选择':document.querySelector('[data-team-scope].active')?.textContent||'团队成员')};
  }
  function markup(section){
    return `<section><h2>${escape(section.title)}</h2><p>${escape(section.summary)}</p>${section.actions.length?'<h3>点击、跳转与返回</h3><dl>'+section.actions.map(([entry,trigger,result])=>`<dt>${escape(entry)} · ${escape(trigger)}</dt><dd>${escape(result)}</dd>`).join('')+'</dl>':''}${section.fields.length?'<h3>字段与约束</h3><dl>'+section.fields.map(([field,rule])=>`<dt>${escape(field)}</dt><dd>${escape(rule)}</dd>`).join('')+'</dl>':''}${section.rules.length?'<h3>联动与边界</h3><ul>'+section.rules.map(rule=>`<li>${escape(rule)}</li>`).join('')+'</ul>':''}</section>`;
  }
  function refresh(){
    const context=currentContext(),key=JSON.stringify(context);
    if(previous===key)return;previous=key;
    panel.querySelector('.prototype-note-state').textContent=context.label;
    const anchor=context.ids[0];
    panel.querySelector('.prototype-note-links').innerHTML=`<a href="docs/推广中心开发说明.html?v=${escape(spec.version)}#${anchor}" target="_blank" rel="noopener">完整开发说明 ↗</a><a href="docs/推广中心开发说明.html?v=${escape(spec.version)}#pending" target="_blank" rel="noopener">正式接入待确认 ↗</a>`;
    panel.querySelector('.prototype-note-body').innerHTML=context.ids.map(id=>byId.get(id)).filter(Boolean).map(markup).join('');
  }
  new MutationObserver(refresh).observe(document.querySelector('.stage'),{subtree:true,attributes:true,attributeFilter:['class','hidden','aria-checked','aria-selected','open']});
  refresh();
})();
