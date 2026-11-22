import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileTextIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { FlowStack, MobileScroll, useKeyboard, type FlowControls, type FlowScreen } from "./mobile";
import { MemberCenter, MembershipProvider, ProfileMembership, useMembership, dateLabel } from "./membership";
import { InvitationProvider, PersonalInvitationEntries, PromotionCenter, PromotionEntry } from "./invitations";
import { VoucherHistory } from "./vouchers";
import { CreatorApplication, CreatorApplicationProvider } from "./creator-application";
import { PrototypeGuideProvider } from "./prototype-guide";
import { useGuideScene } from "./prototype-guide-context";

const asset = (name: string) => `/assets/invitation/${name}.svg`;
// Preview state only; applying for affiliation does not activate this state.
const CreatorPreviewContext = createContext(false);
const sections: { image: string; label: string; title?: string }[] = [
  { image: 'services', title: '我的服务', label: '我的服务：我的需求，我的订单，我的收藏' },
  { image: 'creator', title: '创客中心', label: '创客中心，加入团队，解锁更多收益；申请加盟' },
  { image: 'settings', label: '修改资料，帮助中心，联系客服，清除缓存，关于领榜' },
  { image: 'logout', label: '退出登录' },
];
function Navigation({ title, onBack }: { title?: string; onBack?: () => void }) {
  return <div className={`wechat-navigation${title ? " member-navigation" : ""}`} aria-label={title ?? "个人中心"}>
    {onBack && <button className="member-back" onClick={onBack} aria-label="返回上一页"><ChevronLeftIcon /></button>}
    {title ? <h1 className="page-title member-page-title">{title}</h1> : <img className="page-title" src={asset('page-title')} alt="个人中心" draggable={false} />}
    <img className="wechat-capsule" src={asset('miniprogram-capsule')} alt="微信小程序胶囊" draggable={false} />
  </div>;
}
function BottomNavigation() {
  return <nav className="bottom-navigation" aria-label="首页，订单，消息，我的；我的已选中">
    <img src={asset('bottom-tabs')} alt="" aria-hidden="true" draggable={false} />
    <div className="bottom-order-item" aria-hidden="true"><FileTextIcon className="bottom-order-icon" /><span>订单</span></div>
  </nav>;
}
function CreatorOpenedCard({ onOpen }: { onOpen: () => void }) {
  return <section className="personal-center-card creator-opened-card" aria-labelledby="creator-opened-title">
    <h2 className="personal-card-title" id="creator-opened-title"><button type="button" className="personal-center-heading creator-opened-entry" onClick={onOpen}><img src="/assets/personal-centers/card-team-green.png" alt="" draggable={false} />创客中心<ChevronRightIcon className="creator-entry-chevron" aria-hidden="true" /></button></h2>
    <dl className="creator-opened-stats">
      <div><dt>团队成员</dt><dd>87<small>人</small></dd></div>
      <div className="creator-income-stat"><dt>累计收益</dt><dd>¥812,386.50</dd></div>
    </dl>
  </section>;
}
const membershipScreen: FlowScreen = {
  id: "membership", headerHeight: 44,
  header: (flow) => <Navigation title="会员中心" onBack={() => flow.canGoBack ? flow.pop() : flow.replace(homeScreen)} />,
  render: (flow) => <MemberCenter onRewards={() => flow.push(rewardsScreen)} isCurrent={flow.current.id === "membership"} />,
};
function createPromotionScreen(initialTab: "users" | "rewards"): FlowScreen {
  return {
    id: "promotion", headerHeight: 44,
    header: (flow) => <Navigation title="推广中心" onBack={() => flow.canGoBack ? flow.pop() : flow.replace(homeScreen)} />,
    render: (flow) => <PromotionCenter initialTab={initialTab} isCurrent={flow.current.id === "promotion"} onVoucherHistory={() => flow.push(voucherHistoryScreen)} />,
  };
}
const promotionScreen = createPromotionScreen("users");
const rewardsScreen = createPromotionScreen("rewards");
const voucherHistoryScreen: FlowScreen = {
  id: "voucher-history", headerHeight: 44,
  header: (flow) => <Navigation title="历史抵用券" onBack={() => flow.canGoBack ? flow.pop() : flow.replace(rewardsScreen)} />,
  render: (flow) => <VoucherHistory isCurrent={flow.current.id === "voucher-history"} />,
};
const creatorApplicationScreen: FlowScreen = {
  id: "creator-application", headerHeight: 44,
  header: (flow) => <Navigation title="申请加盟" onBack={() => flow.pop()} />,
  render: (flow) => <CreatorApplication isCurrent={flow.current.id === "creator-application"} onBack={() => flow.pop()} />,
};
const homeScreen: FlowScreen = {
  id: "personal", headerHeight: 44, footerHeight: 96,
  header: () => <Navigation />,
  footer: () => <BottomNavigation />,
  render: (flow) => <PersonalHome flow={flow} />,
};
function PersonalHome({ flow }: { flow: FlowControls }) {
  const creatorOpened = useContext(CreatorPreviewContext);
  const { membership } = useMembership();
  useGuideScene(creatorOpened ? "personal-open" : "personal-closed", flow.current.id === "personal", { 会员状态: membership.status, 有效期: dateLabel(membership.expiresAt) || "未开通", 创客状态: creatorOpened ? "已开通（演示）" : "未开通", 底部导航: "我的已选中" });
  const [creatorNotice, setCreatorNotice] = useState(0);
  useEffect(() => {
    if (!creatorNotice) return;
    const timer = window.setTimeout(() => setCreatorNotice(0), 2400);
    return () => window.clearTimeout(timer);
  }, [creatorNotice]);
  return <><MobileScroll className="personal-scroll">
    <main className="personal-content" aria-hidden={flow.current.id !== "personal"} inert={flow.current.id !== "personal"}>
      <section className="source-section source-profile" aria-label="唐小小，家长">
        <img src={asset('profile')} alt="唐小小，家长；邀请码，切换" draggable={false} />
        <ProfileMembership onOpen={() => flow.push(membershipScreen)} />
      </section>
      {creatorOpened ? <div className="personal-centers-grid" aria-label="创客中心与推广中心">
        <CreatorOpenedCard onOpen={() => setCreatorNotice(current => current + 1)} />
        <PromotionEntry paired onOpen={() => flow.push(promotionScreen)} onUsers={() => flow.push(promotionScreen)} onRewards={() => flow.push(rewardsScreen)} />
      </div> : <PromotionEntry onOpen={() => flow.push(promotionScreen)} onUsers={() => flow.push(promotionScreen)} onRewards={() => flow.push(rewardsScreen)} />}
      <PersonalInvitationEntries />
      {sections.filter(section => !creatorOpened || section.image !== "creator").map(({ image, label, title }) => <section className={`source-section source-${image}`} key={image} aria-label={label}>{title && <h2 className="personal-card-title source-card-title">{title}</h2>}<img src={asset(image)} alt={label} draggable={false} />{image === "creator" && <button className="creator-apply-entry" type="button" aria-label="申请加盟" onClick={() => flow.push(creatorApplicationScreen)} />}</section>)}
    </main>
  </MobileScroll>
    {creatorNotice > 0 && creatorOpened && flow.current.id === "personal" && <div className="invitation-toast" role="status">进入创客中心</div>}
  </>;
}
export default function Prototype() {
  const [creatorOpened, setCreatorOpened] = useState(() => new URLSearchParams(window.location.search).get("creator") === "open");
  const keyboard = useKeyboard();
  const toggleCreator = () => {
    keyboard.hide();
    const next = !creatorOpened;
    const url = new URL(window.location.href);
    url.searchParams.set("creator", next ? "open" : "closed");
    window.history.replaceState(window.history.state, "", url);
    setCreatorOpened(next);
  };
  return <PrototypeGuideProvider><CreatorPreviewContext.Provider value={creatorOpened}>
    {createPortal(<aside className="creator-demo-controls" aria-label="演示设置">
      <span className="creator-demo-label">演示</span>
      <button type="button" className="creator-demo-switch" role="switch" aria-label="演示创客中心开通状态" aria-checked={creatorOpened} onClick={toggleCreator}>
        <span>创客中心</span><span className="creator-demo-state">{creatorOpened ? "已开通" : "未开通"}</span><span className="creator-demo-track" aria-hidden="true"><span /></span>
      </button>
    </aside>, document.body)}
    <div className="invitation-screen" aria-label="领榜个人中心原型"><InvitationProvider><MembershipProvider><CreatorApplicationProvider><FlowStack initial={homeScreen} /></CreatorApplicationProvider></MembershipProvider></InvitationProvider></div>
  </CreatorPreviewContext.Provider></PrototypeGuideProvider>;
}
