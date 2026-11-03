/* 推广中心首页交互。邀请参数仅用于原型展示，正式注册归因待业务接口接入。 */
(() => {
  'use strict';
  const home = $('#promotionHomeScreen');
  const dialog = $('#promotionDialog');
  const content = $('#promotionDialogContent');
  const inviteUrl = new URL('index.html', location.href);
  inviteUrl.searchParams.set('ref', 'LB10001');
  inviteUrl.searchParams.set('creator', 'closed');
  const qr = window.qrcode(0, 'M');
  qr.addData(inviteUrl.href, 'Byte');
  qr.make();
  const count = qr.getModuleCount(), cell = 6;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = (count + 8) * cell;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#172f29';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) context.fillRect((col + 4) * cell, (row + 4) * cell, cell, cell);
    }
  }
  const qrImage = canvas.toDataURL('image/png');
  $('#promotionQr').src = qrImage;
  function refreshHome() {
    $('#promotionTotal').textContent = cumulativeIncomeTotal;
    $('#promotionTeamTotal').textContent = directoryMembers('all').length;
    // 概览沿用现有固定演示汇总；本月收益按当前演示明细的发生月份计算。
    $('#promotionPendingTotal').textContent = $('.withdraw-balance-details .number').textContent;
    const today = new Date();
    const month = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}`;
    const monthly = commissionRecords.filter(item => item.date.startsWith(month)).reduce((sum, item) => sum + Number(item.amount), 0);
    $('#promotionMonth').textContent = monthly.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
  function openDialog(title, body) {
    $('#promotionDialogTitle').textContent = title;
    content.innerHTML = body;
    dialog.showModal();
  }
  let posterImage;
  function invitationPoster() {
    if (posterImage) return posterImage;
    posterImage = new Promise(resolve => {
      const logo = new Image();
      logo.onload = () => {
        const poster = document.createElement('canvas');
        poster.width = 750;
        poster.height = 1088;
        const ctx = poster.getContext('2d');
        ctx.fillStyle = '#00a68f';
        ctx.fillRect(0, 0, 750, 1088);
        ctx.drawImage(logo, 302, 34, 46, 46);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = '600 36px system-ui, sans-serif';
        ctx.fillText('领榜', 360, 70);
        ctx.textAlign = 'center';
        ctx.font = '700 49px system-ui, sans-serif';
        ctx.fillText('邀请好友注册领榜', 375, 171);
        ctx.fillStyle = '#fff1b7';
        ctx.font = '700 49px system-ui, sans-serif';
        ctx.fillText('领取奖励', 375, 245);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect(70, 310, 610, 715, 28);
        ctx.fill();
        ctx.drawImage(canvas, 171, 348, 408, 408);
        ctx.strokeStyle = '#9cdcd0';
        ctx.lineWidth = 3;
        ctx.setLineDash([3, 12]);
        ctx.beginPath(); ctx.moveTo(112, 802); ctx.lineTo(638, 802); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#172f29';
        ctx.font = '600 34px system-ui, sans-serif';
        ctx.fillText('【唐小小】', 375, 878);
        ctx.font = '30px system-ui, sans-serif';
        ctx.fillText('邀请您注册领榜平台', 375, 941);
        resolve(poster.toDataURL('image/png'));
      };
      logo.src = 'assets/personal/activity/lingbang-logo.svg';
    });
    return posterImage;
  }
  function positionInviteDialog() {
    if (!dialog.classList.contains('is-invite')) return;
    const rect = $('.phone').getBoundingClientRect();
    Object.assign(dialog.style, {left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`});
    dialog.style.setProperty('--invite-poster-width', `${Math.max(160, Math.min(rect.width - 68, (rect.height - 220) * 750 / 1088))}px`);
  }
  dialog.addEventListener('close', () => { dialog.classList.remove('is-invite'); dialog.removeAttribute('style'); });
  window.addEventListener('resize', positionInviteDialog);
  $('#promotionHomeBack').addEventListener('click', () => showScreen($('#personalScreen')));
  $('#promotionTeam').addEventListener('click', openMyTeam);
  $('#promotionIncome').addEventListener('click', () => openBill('income'));
  $('#promotionPending').addEventListener('click', () => openBill('pending'));
  $('#promotionShowAllIncome').addEventListener('click', () => {
    commissionStatusFilter = 'all';
    $('#promotionPendingFilter').hidden = true;
    renderCommissions();
  });
  $('#promotionInvite').addEventListener('click', async () => {
    const image = await invitationPoster();
    dialog.classList.add('is-invite');
    positionInviteDialog();
    openDialog('邀请好友', `
      <img class="promotion-poster-image" src="${image}" alt="领榜邀请海报：邀请好友注册领榜，领取奖励；唐小小邀请您注册领榜平台，含专属邀请二维码">
      <div class="promotion-share-to">分享至</div>
      <div class="promotion-share-actions"><button type="button" id="promotionCopyInvite"><span><img src="assets/promotion/wechat.svg" alt=""></span>微信</button><a href="${image}" download="领榜邀请海报.png" id="promotionSavePoster"><span><img src="assets/promotion/download.svg" alt=""></span>保存图片</a></div>
      <p class="promotion-share-status" id="promotionShareStatus" role="status"></p>`);
  });
  content.addEventListener('click', async event => {
    if (event.target.closest('#promotionCopyInvite')) {
      const status = $('#promotionShareStatus');
      try {
        await navigator.clipboard.writeText(inviteUrl.href);
        status.textContent = '邀请链接已复制，可在微信中发送';
      } catch {
        status.innerHTML = `请复制链接后在微信发送<input class="promotion-share-link" aria-label="专属邀请链接" readonly value="${escapeHtml(inviteUrl.href)}">`;
        status.querySelector('input').select();
      }
    }
    if (event.target.closest('#promotionSavePoster')) $('#promotionShareStatus').textContent = '如未下载，可长按海报保存图片';
  });
  $('#promotionDialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if ((dialog.classList.contains('is-invite') && (event.target === dialog || event.target === content)) || (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom))) dialog.close();
  });
  new MutationObserver(() => { if (home.classList.contains('active')) refreshHome(); }).observe(home, {attributes: true, attributeFilter: ['class']});
  refreshHome();
})();
