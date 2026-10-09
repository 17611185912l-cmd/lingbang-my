(() => {
  'use strict';
  const sections = {
    personal: ['个人中心', [
      ['页面内容', '创客中心开通后，用户信息下方展示团队成员、累计收益和进入创客中心入口。人数与我的团队总人数一致，累计收益与创客中心、账单一致。'],
      ['操作', '点击进入创客中心查看团队及收益。原型外的演示开通开关切换已开通与未开通状态；未开通时点击申请开通直接演示开通结果，不代表实际审批流程。'],
      ['演示范围', '其他服务入口目前仅展示操作提示。人数、收益和记录为模拟数据，回访、提现操作只在当前页面会话中生效，刷新后恢复。'],
      ['核对重点', '切换开通状态后入口正确；长金额完整显示；个人中心与内部页面的同名指标一致。']]],
    team: ['创客中心 · 我的团队', [
      ['页面内容', '顶部展示累计收益和可提现金额，下方统一展示我的团队，不再按一星、二星分组。成员卡片展示姓名、老师／家长身份、城市、电话、累计分润和最近跟进。'],
      ['人数与筛选', '团队总人数合并当前演示的两类成员；今日新增按演示成员注册日期是否为今天统计。身份筛选为全部、老师、家长，多身份成员可出现在两个身份分类中，因此两个身份人数不能直接相加。筛选只改变列表，不改变团队总人数。'],
      ['交互', '点击成员卡片或跟进记录查看成员详情；所有团队成员均可填写回访。查看收益明细进入账单并收起提现区域，立即提现进入同一账单并展开提现区域。'],
      ['回访与电话', '所有团队成员均可添加回访，列表与详情入口保持一致。所有团队成员的电话统一完整显示，配电话图标并支持点击拨打，列表、详情及回访弹窗保持一致。'],
      ['核对重点', '不同身份及多身份筛选、空结果、长姓名和金额；列表与详情信息一致；所有成员电话完整且可拨打，均可从列表和详情添加回访。']]],
    detail: ['成员详情', [
      ['页面内容', '展示当前成员的姓名、身份、城市、电话和累计分润，不再展示星级、所属一星或二星团队入口。下方可切换跟进记录、浏览记录、订单记录、分润明细。'],
      ['操作与联动', '详情电话及回访权限与列表一致。添加回访成功后更新最近跟进及跟进记录；返回回到来源页面。切换记录标签查看对应内容，无记录时展示空态。'],
      ['演示边界', '部分业务记录为演示生成内容，不能据此认定真实订单、分润归属或统计口径。'],
      ['核对重点', '从不同成员进入不串人；各标签、无记录状态、添加回访后的同步，以及返回路径。']]],
    revisit: ['添加回访', [
      ['页面内容', '弹窗展示当前成员信息、最近跟进、跟进内容输入、字数提示、常用语及提交按钮。'],
      ['操作', '填写内容后提交；纯空格不能保存。常用语用于快速填写。成功后关闭弹窗，并同步更新成员卡片的最近跟进与详情中的跟进记录；取消不新增记录。'],
      ['核对重点', '空内容、纯空格、长度上限、换行、常用语替换、取消再打开及重复点击；从列表和详情进入应指向同一个成员。刷新页面会恢复演示记录。']]],
    bill: ['我的账单 · 分润明细', [
      ['页面内容', '累计收益始终展示；提现区域可展开或收起。分润明细和提现记录可切换。'],
      ['分润筛选', '全部、邀请家长、邀请老师、促成合作展示对应笔数与记录；笔数是记录数，不是成员数。记录包含业务名称、时间、来源成员、脱敏电话、金额及结算状态。'],
      ['统计口径', '筛选不改变累计收益。当前为演示数据，明细是否完整覆盖累计收益、退款如何影响收益、按何时计入收益仍需业务确认。'],
      ['核对重点', '两个收益入口的展开状态不同，但累计收益和可提现数据一致；分类人数不能替代记录笔数；零记录与长金额正常展示。']]],
    withdraw: ['我的账单 · 提现', [
      ['页面内容', '展开后展示可提现佣金、待结算、已提现、金额输入、全部提现、微信零钱／银行卡、预计到账及可展开的规则与税费。'],
      ['演示限制', '单笔10～2000元，每日最多3次、累计最多3000元。全部提现取余额、单笔上限和当天剩余额度中的最小值。演示税费为单次超过800元按全额8%扣除，800元不扣；此为原型规则，正式税费需财务确认。'],
      ['提交结果', '提交成功新增审核中的提现记录，扣减可提现余额并更新今日使用额度；提交不等于到账。刷新后恢复初始模拟数据。'],
      ['待确认事项', '审核或付款失败如何退回余额及次数、已提现按申请还是到账统计、跨日统计和小数位校验，尚需确定。待结算和已提现当前为固定演示值。'],
      ['核对重点', '9.99／10元、800／800.01元、2000／2000.01元，余额不足，第3／4次、日累计3000元边界；非数字、负数、多位小数、重复提交和方式切换。']]],
    records: ['我的账单 · 提现记录', [
      ['页面内容', '展示提现方式、申请时间、金额和处理状态。提交新的提现申请后，记录出现在列表顶部，状态为审核中。'],
      ['核对重点', '收款方式、申请金额与提交内容一致；审核中不等于已到账。当前不模拟完整审核及付款流程。']]]
  };
  const style = document.createElement('style');
  style.textContent = `.prototype-notes{position:fixed;left:calc(50% + 240px);right:20px;top:96px;max-height:calc(100vh - 120px);overflow:auto;padding:20px;background:#fff;border:1px solid #dce4ef;border-radius:14px;color:#465467;font:13px/1.75 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;box-sizing:border-box}.prototype-notes h2{margin:0 0 12px;font-size:19px;color:#26384b}.prototype-notes h3{margin:16px 0 5px;font-size:14px;color:#326aa6}.prototype-notes p{margin:0}.prototype-note-state{padding:9px 12px;background:#eef4fc;border-radius:8px;font-weight:600;color:#326aa6}@media(max-width:1150px){.prototype-notes{position:relative;inset:auto;width:calc(100% - 32px);max-width:760px;margin:0 auto 24px;max-height:none}}`;
  document.head.append(style);
  const panel = document.createElement('aside');
  panel.className='prototype-notes';panel.setAttribute('aria-label','原型说明');
  panel.innerHTML='<h2>原型说明</h2><div class="prototype-note-state"></div><div class="prototype-note-body"></div>';
  document.body.append(panel);
  let previous='';
  function refresh(){
    const active=document.querySelector('.screen.active')?.id;
    const revisit=document.querySelector('#revisitSheet');
    let key=active==='personalScreen'?'personal':active==='followRecordScreen'?'detail':'team';
    if(active==='billScreen')key=!document.querySelector('#billWithdrawCard').hidden?'withdraw':!document.querySelector('#withdrawPanel').hidden?'records':'bill';
    if(revisit&&!revisit.hidden)key='revisit';
    if(key===previous)return;previous=key;
    const [title,rows]=sections[key];
    panel.querySelector('.prototype-note-state').textContent=title;
    panel.querySelector('.prototype-note-body').innerHTML=rows.map(([heading,body])=>`<h3>${heading}</h3><p>${body}</p>`).join('');
  }
  new MutationObserver(refresh).observe(document.querySelector('.stage'),{subtree:true,attributes:true,attributeFilter:['class','hidden']});
  refresh();
})();
