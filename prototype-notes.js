(() => {
  'use strict';
  const sections = {
    personal: ['个人中心', [
      ['页面内容', '创客中心开通后，用户信息下方展示团队成员、累计收益和进入创客中心入口。人数与我的团队总人数一致，累计收益与创客中心、账单一致。'],
      ['操作', '点击进入创客中心查看团队及收益。原型外的演示开通开关切换已开通与未开通状态；未开通时点击申请开通直接演示开通结果，不代表实际审批流程。'],
      ['演示范围', '其他服务入口仅按设计稿展示，未实现对应业务。人数、收益和记录为模拟数据，回访、提现操作只在当前页面会话中生效，刷新后恢复；收款银行卡保存在当前浏览器本地，刷新后保留。'],
      ['核对重点', '切换开通状态后入口正确；长金额完整显示；个人中心与内部页面的同名指标一致。']]],
    team: ['创客中心 · 我的团队', [
      ['页面内容', '顶部展示累计收益和可提现金额，下方统一展示我的团队，不再按一星、二星分组。成员卡片展示姓名、老师／家长身份、城市、电话、累计分润和最近跟进。'],
      ['人数与筛选', '团队总人数合并当前演示的两类成员；今日新增按演示成员注册日期是否为今天统计。身份筛选为全部、老师、家长，多身份成员可出现在两个身份分类中，因此两个身份人数不能直接相加。筛选只改变列表，不改变团队总人数。'],
      ['交互', '点击成员卡片或回访记录查看成员详情；所有团队成员均可填写回访。查看收益明细进入账单，立即提现进入独立的收益提现页面。'],
      ['回访与电话', '所有团队成员均可添加回访，列表与详情入口保持一致。所有团队成员的电话统一完整显示，配电话图标并支持点击拨打，列表、详情及回访弹窗保持一致。'],
      ['核对重点', '不同身份及多身份筛选、空结果、长姓名和金额；列表与详情信息一致；所有成员电话完整且可拨打，均可从列表和详情添加回访。']]],
    detail: ['成员详情', [
      ['页面内容', '展示当前成员的姓名、身份、城市、电话和累计分润，不再展示星级、所属一星或二星团队入口。下方仅可切换回访记录、订单记录，成员详情不再展示分润明细。订单记录展示年级·科目和上课地点，右上方用不同颜色的标签区分待确认、待支付、进行中、已完成、已取消五种状态，底部展示订单号和订单时间；演示数据覆盖全部五种状态。'],
      ['操作与联动', '详情电话及回访权限与列表一致。添加回访成功后更新最近跟进及回访记录；返回回到来源页面。切换记录标签查看对应内容，无记录时展示空态。'],
      ['演示边界', '部分业务记录为演示生成内容，不能据此认定真实订单、分润归属或统计口径。'],
      ['核对重点', '从不同成员进入不串人；仅显示回访记录、订单记录两个标签；订单状态、无记录状态、添加回访后的同步，以及返回路径。']]],
    revisit: ['添加回访', [
      ['页面内容', '弹窗展示当前成员信息、最近跟进、跟进内容输入、字数提示、常用语及提交按钮。'],
      ['操作', '填写内容后提交；纯空格不能保存。常用语用于快速填写。成功后关闭弹窗，并同步更新成员卡片的最近跟进与详情中的回访记录；取消不新增记录。'],
      ['核对重点', '空内容、纯空格、长度上限、换行、常用语替换、取消再打开及重复点击；从列表和详情进入应指向同一个成员。刷新页面会恢复演示记录。']]],
    bill: ['我的账单 · 分润明细', [
      ['页面内容', '顶部保留累计收益，下方展示分润明细和业务筛选。分润明细统一在我的账单查看；提现记录仅在收益提现页面中查看。'],
      ['分润筛选', '全部、注册家长、入驻老师、签约可与开始日期、结束日期叠加筛选，分类数量随日期范围更新。按明细卡片的时间筛选，包含开始和结束当天；可只填一侧日期，清空恢复全部日期，重新进入账单时恢复全部分类和日期。开始日期晚于结束日期时显示提示。分润明细使用一句话描述业务关系，不展示签约方式标签或协助签约用户编号。姓名脱敏，老师和家长手机号按前三位****后四位脱敏。需求单号与带年份的时间放在卡片底部同一行，三类记录均展示金额及结算状态。'],
      ['业务文案', '注册家长：注册家长发布需求订单，由老师支付；入驻老师：入驻老师支付家长发布的需求订单；签约：家长与老师达成签约，需求单已支付。三类卡片分别记录对应分润，同一需求订单可产生多类分润记录。签约卡片不展示家长或老师的邀请人。'],
      ['统计口径', '筛选统计记录笔数，不是人数或去重后的需求订单数，筛选不改变累计收益。当前为演示数据，明细是否完整覆盖累计收益、退款如何影响收益、按何时计入收益仍需业务确认。'],
      ['核对重点', '各业务筛选的记录数与列表一致；姓名脱敏、手机号前三位****后四位及带年份时间正确；不显示自／协标签、签约方式文案和协助签约用户编号；零记录与长金额正常展示。']]],
    withdraw: ['收益提现', [
      ['页面内容', '标题栏居中显示“收益提现”，左侧返回；标题栏不放提现记录入口。页面展示可提现金额、提现金额、银行卡信息、预计到账和可展开的规则与税费。提现记录直接显示在提现表单下方。收款方式仅支持银行卡；首次提现需填写开户银行、开户人姓名及银行卡号并保存。银行卡保存在当前浏览器本地，刷新后保留，可通过修改入口调整。'],
      ['提现记录', '卡片左侧展示银行名称、卡号尾号、申请时间、提现金额和税费；右侧展示预计／实际到账金额及状态。驳回记录展示未到账，驳回原因默认收起并可展开。'],
      ['演示限制', '单笔10～2000元，每日最多3次、累计最多3000元。全部提现取余额、单笔上限和当天剩余额度中的最小值。演示税费为单次超过800元按全额8%扣除，800元不扣；此为原型规则，正式税费需财务确认。'],
      ['提交结果', '提交成功新增审核中的提现记录，记录保存申请时的银行名称和卡号尾号，扣减可提现余额并更新今日使用额度；提交不等于到账。刷新后恢复初始模拟数据。'],
      ['待确认事项', '审核或付款失败如何退回余额及次数、已提现按申请还是到账统计、跨日统计和小数位校验，尚需确定。待结算和已提现当前为固定演示值。'],
      ['核对重点', '银行卡必填、卡号16–19位、修改后取消／保存、开户人信息掩码；9.99／10元、800／800.01元、2000／2000.01元，第3／4次与日累计3000元边界。']]],
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
    if(active==='withdrawScreen')key='withdraw';
    if(active==='billScreen')key='bill';
    if(revisit&&!revisit.hidden)key='revisit';
    if(key===previous)return;previous=key;
    const [title,rows]=sections[key];
    panel.querySelector('.prototype-note-state').textContent=title;
    panel.querySelector('.prototype-note-body').innerHTML=rows.map(([heading,body])=>`<h3>${heading}</h3><p>${body}</p>`).join('');
  }
  new MutationObserver(refresh).observe(document.querySelector('.stage'),{subtree:true,attributes:true,attributeFilter:['class','hidden']});
  refresh();
})();
