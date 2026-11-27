import { type PropsWithChildren, useEffect, useId, useRef, useState } from "react";
import { ChevronRightIcon, Cross2Icon, DownloadIcon, PersonIcon, Share1Icon } from "@radix-ui/react-icons";
import { BottomSheet, MobileScroll } from "./mobile";
import { examplePromotionData, getVoucherStatus, membershipInviteProgress, promotionRules, summarizeVouchers, type InvitedUser, type PromotionReward, type VoucherReward } from "./promotion-data";
import { InvitationContext, useInvitation, type InvitationType } from "./invitation-context";
import { VoucherList } from "./vouchers";
import { useGuideScene } from "./prototype-guide-context";

function GiftIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14" /><path d="M12 7H8a2.5 2.5 0 1 1 2.5-2.5L12 7Zm0 0h4a2.5 2.5 0 1 0-2.5-2.5L12 7Z" /></svg>;
}

const invitations = {
  parent: { tab: "家长报名", name: "家长", title: "邀请家长报名", poster: "/assets/invitations/parent.svg", icon: "/assets/personal-invitations/parent.png" },
  teacher: { tab: "老师入驻", name: "老师", title: "邀请老师入驻", poster: "/assets/invitations/teacher.svg", icon: "/assets/personal-invitations/teacher.png" },
  partner: { tab: "合伙人招募", name: "合伙人", title: "邀请合伙人", poster: "/assets/invitations/partner.svg", icon: "/assets/personal-centers/partner.png" },
};
export function InvitationProvider({ children }: PropsWithChildren) {
  const [selected, select] = useState<InvitationType>("parent");
  const [posterOpen, setPosterOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { invitedUsers, rewards, rewardMonths, voucherAmount } = examplePromotionData;
  const [now, setNow] = useState(Date.now);
  const vouchers = rewards.filter((reward): reward is VoucherReward => reward.type === "voucher");
  const voucherSummary = summarizeVouchers(vouchers, now);
  // Refresh all coupon screens at the next deadline or when the tab resumes.
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const nextExpiry = Math.min(...rewards.filter((reward): reward is VoucherReward => reward.type === "voucher" && reward.usedAt === undefined && reward.expiresAt > now).map((voucher) => voucher.expiresAt));
    const timer = Number.isFinite(nextExpiry) ? window.setTimeout(refresh, Math.min(Math.max(0, nextExpiry - Date.now()) + 1, 2147483647)) : undefined;
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [now, rewards]);
  const savingRef = useRef(false);
  const current = invitations[selected];
  useGuideScene(`poster-${selected}`, posterOpen, { 邀请对象: current.tab, 生成状态: saving ? "生成中，保存按钮禁用" : "可保存", 操作反馈: message || "尚无反馈", 分享方式: "直接微信聊天转发（网页演示）" }, "overlay");
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);
  const openPoster = (type?: InvitationType) => {
    if (type) select(type);
    setPosterOpen(true);
  };
  const shareMiniProgram = () => {
    // This browser prototype cannot invoke WeChat's native mini-program forwarding.
    // Model the direct action without another channel picker or a false send success.
    setMessage(`原型演示：分享${current.name}邀请小程序到微信聊天`);
  };
  const savePoster = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const picture = new Image();
      picture.src = current.poster;
      await picture.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 990;
      canvas.height = 1260;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(picture, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image unavailable")), "image/png"));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `领榜-${current.title}-演示海报.png`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      setMessage("已发起海报下载");
    } catch {
      setMessage("海报保存失败，请重试");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  return <InvitationContext.Provider value={{ selected, select, eligibleCount: invitedUsers.length, invitedUsers, rewards, rewardMonths, voucherAmount, vouchers, voucherSummary, now, openPoster, shareMiniProgram, savePoster, saving }}>
    {children}
    {message && <div className="invitation-toast" role="status">{message}</div>}
    <BottomSheet open={posterOpen} onOpenChange={setPosterOpen} title="选择邀请海报" snap={0.82}>
      <button className="invitation-sheet-close" aria-label="关闭邀请弹窗" onClick={() => setPosterOpen(false)}><Cross2Icon /></button>
      <div className="member-sheet-content invitation-sheet-content">
        <InvitationPosterPicker />
      </div>
    </BottomSheet>
  </InvitationContext.Provider>;
}

export function InvitationProgress() {
  const { eligibleCount } = useInvitation();
  const { current, remaining } = membershipInviteProgress(eligibleCount);
  return <div className="member-invite-progress">
    <div className="member-invite-progress-heading"><span>邀请进度</span><span className="member-invite-remaining">再邀请 <strong>{remaining} 人</strong>，可得 {promotionRules.membershipMonths} 个月会员</span><span><b>{current}</b> / {promotionRules.membershipInviteTarget} 人</span></div>
    <div className="member-progress-track" role="progressbar" aria-label="邀请进度" aria-valuemin={0} aria-valuemax={promotionRules.membershipInviteTarget} aria-valuenow={current}><span style={{ width: `${current / promotionRules.membershipInviteTarget * 100}%` }} /></div>
  </div>;
}

export function PersonalInvitationEntries() {
  const { openPoster } = useInvitation();
  return <section className="personal-invitation-entries" aria-label="邀请好友">
    {([
      { type: "teacher", label: "邀请老师" },
      { type: "parent", label: "邀请家长" },
      { type: "partner", label: "邀请合伙人" },
    ] as const).map(({ type, label }) => <button type="button" key={type} onClick={() => openPoster(type)}><img src={invitations[type].icon} alt="" draggable={false} /><span>{label}</span></button>)}
  </section>;
}

export function PromotionEntry({ paired = false, onOpen, onUsers, onRewards }: { paired?: boolean; onOpen: () => void; onUsers: () => void; onRewards: () => void }) {
  const { eligibleCount, rewardMonths, voucherAmount } = useInvitation();
  return <section className={`promotion-entry-section${paired ? " is-paired" : ""}`} aria-label="推广中心">
    <div className="promotion-entry-card">
      <div className="promotion-entry-title"><button className="promotion-entry-heading" onClick={onOpen}>{paired && <img className="personal-center-icon" src={invitations.partner.icon} alt="" draggable={false} />}<strong className="personal-card-title">推广中心</strong><ChevronRightIcon className="promotion-entry-chevron" aria-hidden="true" /></button></div>
      <div className="promotion-entry-stats">
        <button onClick={onUsers}><span>邀请人数</span><strong>{eligibleCount}<small>人</small></strong></button>
        <button onClick={onRewards}><span>累计会员奖励</span><strong>{rewardMonths}<small>个月</small></strong></button>
        <button onClick={onRewards}><span>累计抵用券</span><strong>{voucherAmount}<small>元</small></strong></button>
      </div>
    </div>
  </section>;
}

function InvitedUserRows({ users }: { users: InvitedUser[] }) {
  return <ul className="promotion-user-list">{users.map((user) => <li key={user.id}>
    <div className="promotion-user-info"><div><strong>{user.name}</strong><span>{user.phone}</span></div><p>注册时间 {user.registeredAt}</p></div>
  </li>)}</ul>;
}

function MembershipRewardRows({ rewards }: { rewards: Extract<PromotionReward, { type: "membership" }>[] }) {
  return <ul className="promotion-reward-list">{rewards.map((reward) => <li key={reward.id}>
    <span className="promotion-reward-icon"><GiftIcon /></span>
    <div className="promotion-reward-info">
      <div><strong>月度会员</strong><span>+{reward.months}<small>个月</small></span></div>
      <p>{reward.reason}<em>已发放</em></p>
      <time>发放时间 {reward.issuedAt}</time>
    </div>
  </li>)}</ul>;
}

function PromotionEmpty({ type }: { type: "users" | "rewards" }) {
  return <div className="promotion-empty">
    {type === "users" ? <PersonIcon /> : <GiftIcon />}
    <h3>{type === "users" ? "还没有邀请用户" : "还没有获得会员奖励"}</h3>
    <p>{type === "users" ? "好友通过你的邀请注册后，将显示在这里" : "每累计邀请10位有效新用户，可获得1个月会员"}</p>
  </div>;
}

type PromotionCenterProps = {
  isCurrent?: boolean;
  initialTab?: "users" | "rewards";
  onVoucherHistory: () => void;
};

export function PromotionCenter({ isCurrent = true, initialTab = "users", onVoucherHistory }: PromotionCenterProps) {
  const { eligibleCount, rewardMonths, voucherAmount, voucherSummary, vouchers, now, invitedUsers, rewards, openPoster } = useInvitation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabId = useId();
  const isUsers = activeTab === "users";
  const membershipRewards = rewards.filter((reward) => reward.type === "membership");
  const availableVouchers = vouchers.filter((voucher) => getVoucherStatus(voucher, now) === "unused").sort((a, b) => a.expiresAt - b.expiresAt);
  const visibleRewardCount = membershipRewards.length + availableVouchers.length;
  useGuideScene(isUsers ? "promotion-users" : "promotion-rewards", isCurrent, { 当前Tab: isUsers ? "我邀请的用户" : "我获得的奖励", 累计邀请: eligibleCount, 会员累计: `${rewardMonths}个月`, 券历史累计: `${voucherAmount}元`, 可用券: `${voucherSummary.unused}张`, 奖励Tab记录数: visibleRewardCount });
  return <main className="promotion-center-content" aria-hidden={!isCurrent} inert={!isCurrent}>
    <section className="promotion-overview" aria-label="推广数据总览">
      <div className="promotion-overview-stats">
        <button onClick={() => setActiveTab("users")}><span>累计邀请</span><strong>{eligibleCount}<small>人</small></strong></button>
        <button onClick={() => setActiveTab("rewards")}><span>累计会员奖励</span><strong>{rewardMonths}<small>个月</small></strong></button>
        <button onClick={() => setActiveTab("rewards")}><span>累计抵用券</span><strong>{voucherAmount}<small>元</small></strong></button>
      </div>
    </section>
    <button className="promotion-invite-entry" onClick={() => openPoster()}>
      <span className="promotion-invite-icon"><GiftIcon /></span>
      <span><strong>邀请好友，双重奖励</strong><small>每满 {promotionRules.membershipInviteTarget} 位有效新用户，得 {promotionRules.membershipMonths} 个月会员<br />每邀请 1 人，得 {promotionRules.voucherAmount} 元抵用券</small></span>
      <em>去邀请<ChevronRightIcon /></em>
    </button>
    <div className="promotion-record-tabs" role="tablist" aria-label="推广明细">
      {(["users", "rewards"] as const).map((tab) => <button key={tab} id={`${tabId}-${tab}`} type="button" role="tab" aria-selected={activeTab === tab} aria-controls={`${tabId}-panel`} tabIndex={activeTab === tab ? 0 : -1} onClick={() => setActiveTab(tab)} onKeyDown={(event) => {
        const next = event.key === "ArrowRight" || event.key === "ArrowLeft" ? tab === "users" ? "rewards" : "users" : event.key === "Home" ? "users" : event.key === "End" ? "rewards" : null;
        if (next) { event.preventDefault(); setActiveTab(next); document.getElementById(`${tabId}-${next}`)?.focus(); }
      }}>{tab === "users" ? "我邀请的用户" : "我获得的奖励"}<span>{tab === "users" ? eligibleCount : visibleRewardCount}</span></button>)}
    </div>
    <MobileScroll key={activeTab} className="promotion-list-scroll">
      <div className="promotion-tab-panel" id={`${tabId}-panel`} role="tabpanel" aria-labelledby={`${tabId}-${activeTab}`}>
        {isUsers ? <section className="promotion-record-card" aria-label="全部邀请用户">{invitedUsers.length ? <InvitedUserRows users={invitedUsers} /> : <PromotionEmpty type="users" />}</section> : <>
          <section className="promotion-membership-rewards" aria-label="会员奖励">
            <div className="promotion-reward-section-heading"><h2>会员</h2><span>累计 {rewardMonths} 个月</span></div>
            <div className="promotion-record-card">{membershipRewards.length ? <MembershipRewardRows rewards={membershipRewards} /> : <PromotionEmpty type="rewards" />}</div>
          </section>
          <section className="promotion-available-vouchers" aria-label="可用抵用券">
            <div className="promotion-reward-section-heading"><div><h2>抵用券</h2><span>{voucherSummary.unused} 张可用</span></div><button onClick={onVoucherHistory}>历史抵用券<ChevronRightIcon /></button></div>
            <VoucherList vouchers={availableVouchers} />
          </section>
        </>}
      </div>
    </MobileScroll>
  </main>;
}

function InvitationPosterPicker() {
  const { selected, select, shareMiniProgram, savePoster, saving } = useInvitation();
  const current = invitations[selected];
  const tabId = useId();
  return <section className="invitation-poster-picker" aria-label="选择邀请海报">
      <div className="invitation-target-tabs" role="tablist" aria-label="邀请对象">
        {(Object.keys(invitations) as InvitationType[]).map((type) => <button key={type} id={`${tabId}-${type}`} type="button" role="tab" aria-selected={type === selected} aria-controls={`${tabId}-panel`} tabIndex={type === selected ? 0 : -1} className={type === selected ? "is-selected" : ""} onClick={() => select(type)} onKeyDown={(event) => {
          const types = Object.keys(invitations) as InvitationType[];
          const index = types.indexOf(type);
          const next = event.key === "ArrowRight" ? types[(index + 1) % types.length] : event.key === "ArrowLeft" ? types[(index + types.length - 1) % types.length] : event.key === "Home" ? types[0] : event.key === "End" ? types[types.length - 1] : null;
          if (next) { event.preventDefault(); select(next); document.getElementById(`${tabId}-${next}`)?.focus(); }
        }}>{invitations[type].tab}</button>)}
      </div>
      <div id={`${tabId}-panel`} role="tabpanel" aria-labelledby={`${tabId}-${selected}`}>
        <div className="invitation-picker-preview"><img src={current.poster} alt={`${current.title}海报`} draggable={false} /></div>
      </div>
      <div className="invitation-picker-actions"><button className="invitation-save-button" disabled={saving} onClick={savePoster}><DownloadIcon />{saving ? "生成中…" : "保存海报"}</button><button className="member-primary" onClick={shareMiniProgram} aria-label={`分享${current.name}邀请小程序到微信聊天`}><Share1Icon />分享给好友</button></div>
  </section>;
}
