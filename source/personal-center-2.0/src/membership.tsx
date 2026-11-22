import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import {
  CheckCircledIcon, ChevronRightIcon, ChatBubbleIcon,
  Share1Icon, SketchLogoIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, MobileScroll } from "./mobile";
import { InvitationProgress } from "./invitations";
import { useInvitation } from "./invitation-context";
import { promotionRules } from "./promotion-data";
import { useGuideScene } from "./prototype-guide-context";
import { membershipDays, membershipExpiry, membershipHasExpired } from "./membership-rules";

export type Plan = "month" | "year";
type Membership = { status: "inactive" | "active" | "expired"; expiresAt: number | null };
type Sheet = "purchase" | "support" | "success" | null;
type MemberContext = {
  membership: Membership; plan: Plan; setPlan: (plan: Plan) => void;
  showSheet: (sheet: Sheet) => void;
};
const MemberContext = createContext<MemberContext | null>(null);
export const plans = {
  month: { title: "月度会员", price: "19.9", unit: "月", days: membershipDays.month },
  year: { title: "年度会员", price: "99.9", unit: "年", days: membershipDays.year },
};

function initialMembership(): Membership {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("member");
  return {
    status: status === "active" || status === "expired" ? status : "inactive",
    expiresAt: status === "active" ? membershipExpiry(Date.now(), null, membershipDays.month) : status === "expired" ? Date.now() - 86400000 : null,
  };
}
export function dateLabel(value: number | null) {
  return value ? new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(value).replaceAll("/", ".") : "";
}
export function useMembership() {
  const value = useContext(MemberContext);
  if (!value) throw new Error("MembershipProvider is required");
  return value;
}
export function MemberBadge({ compact = false }: { compact?: boolean }) {
  return <span className={`member-badge${compact ? " is-compact" : ""}`}><SketchLogoIcon aria-hidden="true" />会员</span>;
}

export function MembershipProvider({ children }: PropsWithChildren) {
  const [membership, setMembership] = useState<Membership>(initialMembership);
  const [plan, setPlan] = useState<Plan>("month");
  const [sheet, showSheet] = useState<Sheet>(null);
  useEffect(() => {
    if (membership.status !== "active" || membership.expiresAt === null) return;
    const expiresAt = membership.expiresAt;
    let timer: number;
    const refresh = () => {
      window.clearTimeout(timer);
      const now = Date.now();
      if (membershipHasExpired(expiresAt, now)) {
        setMembership(current => current.status === "active" && current.expiresAt === expiresAt ? { ...current, status: "expired" } : current);
      } else timer = window.setTimeout(refresh, Math.min(expiresAt - now, 2147483647));
    };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [membership.status, membership.expiresAt]);
  const choice = plans[plan];
  const active = membership.status === "active";
  useGuideScene(sheet === "success" ? "purchase-success" : sheet === "support" ? "support" : "purchase", sheet !== null, { 所选方案: choice.title, 价格: `¥${choice.price}/${choice.unit}`, 会员状态: membership.status, 有效期: dateLabel(membership.expiresAt) || "尚未开通", 支付方式: "仅本地模拟，无真实扣费" }, "overlay");
  const simulatePurchase = () => {
    setMembership(current => ({ status: "active", expiresAt: membershipExpiry(Date.now(), current.status === "active" ? current.expiresAt : null, choice.days) }));
    showSheet("success");
  };
  const title = sheet === "purchase" ? "确认开通会员" : sheet === "support" ? "专属 1v1 客服" : "会员已开通";
  return <MemberContext.Provider value={{ membership, plan, setPlan, showSheet }}>
    {children}
    <BottomSheet open={sheet !== null} onOpenChange={(open) => { if (!open) showSheet(null); }} title={title} description={sheet === "purchase" ? "确认会员方案与权益" : undefined} snap={0.48}>
      <div className="member-sheet-content">
        {sheet === "purchase" && <>
          <div className="checkout-plan"><span>{choice.title}</span><strong>¥{choice.price}<small> / {choice.unit}</small></strong></div>
          <div className="checkout-benefits"><span><CheckCircledIcon />发布定向需求</span><span><CheckCircledIcon />专属 1v1 客服</span></div>
          <p>单次购买，到期不自动续费。{active ? "当前会员有效期将顺延。" : "开通后立即生效。"}</p>
          <p className="prototype-notice">原型演示：模拟开通不会真实扣费，状态仅在本次预览中生效。</p>
          <button className="member-primary" onClick={simulatePurchase}>模拟开通 · ¥{choice.price}</button>
          <button className="member-text-button" onClick={() => showSheet(null)}>暂不开通</button>
        </>}
        {sheet === "success" && <div className="membership-success">
          <CheckCircledIcon className="success-icon" /><h2>会员已开通</h2><p>有效期至 {dateLabel(membership.expiresAt)}</p>
          <p className="prototype-notice">本次为原型模拟开通，未发生真实支付。</p>
          <button className="member-primary" onClick={() => showSheet(null)}>查看我的权益</button>
        </div>}
        {sheet === "support" && <>
          <div className="invite-sheet-icon"><ChatBubbleIcon /></div><h2>有问题，专人帮你跟进</h2>
          <p>会员可享专属 1v1 客服，协助解答问题、跟进服务。</p>
          <p className="prototype-notice">服务时间与联系入口待确认，本页暂不发起真实客服会话。</p>
          <button className="member-primary" onClick={() => showSheet(null)}>我知道了</button>
        </>}
      </div>
    </BottomSheet>
  </MemberContext.Provider>;
}

export function ProfileMembership({ onOpen }: { onOpen: () => void }) {
  const { membership } = useMembership();
  return <div className="profile-membership-status">
      {membership.status === "active"
        ? <><button className="profile-member-badge" onClick={onOpen} aria-label="查看会员中心"><MemberBadge compact /></button><span>有效期至 {dateLabel(membership.expiresAt)}</span></>
        : <><span>{membership.status === "expired" ? "会员已到期" : "未开通会员"}</span><button onClick={onOpen}>{membership.status === "expired" ? "立即续费" : "立即开通"}<ChevronRightIcon /></button></>}
    </div>;
}
export function MemberCenter({ onRewards, isCurrent = true }: { onRewards: () => void; isCurrent?: boolean }) {
  const { membership, plan, setPlan, showSheet } = useMembership();
  const { openPoster, eligibleCount } = useInvitation();
  const active = membership.status === "active";
  useGuideScene(`membership-${membership.status}`, isCurrent, { 会员状态: membership.status, 所选方案: plans[plan].title, 价格: `¥${plans[plan].price}/${plans[plan].unit}`, 邀请人数: eligibleCount, 邀请进度: `${eligibleCount % promotionRules.membershipInviteTarget}/${promotionRules.membershipInviteTarget}`, 有效期: dateLabel(membership.expiresAt) || "未开通" });
  return <MobileScroll className="member-scroll">
    <main className="member-center-content" aria-hidden={!isCurrent} inert={!isCurrent}>
      <section className="member-introduction" aria-label="会员介绍与专属权益">
        <div className="member-identity">
          <h2 className="member-identity-name"><SketchLogoIcon aria-hidden="true" />领榜会员 · 专属权益</h2>
          {membership.status !== "inactive" && <div className="member-identity-status">{active ? <><MemberBadge compact /><span>有效期至 {dateLabel(membership.expiresAt)}</span></> : <span className="member-inactive-label">会员已到期</span>}</div>}
        </div>
        <div className="member-benefits-panel">
          <div className="member-benefit-row"><span className="member-benefit-icon"><img src="/assets/membership/targeted-demand.svg" alt="" draggable={false} /></span><div><h3>发布定向需求</h3><p>指定心仪老师，直接向其发送需求</p></div></div>
          <div className="member-benefit-row"><span className="member-benefit-icon"><img src="/assets/membership/customer-service.svg" alt="" draggable={false} /></span><div><h3>专属 1v1 客服</h3><p>专人协助解答问题、跟进服务</p></div>{active && <button className="member-inline-button" onClick={() => showSheet("support")}>联系<ChevronRightIcon /></button>}</div>
        </div>
      </section>

      <section className="member-panel member-acquisition" aria-labelledby="member-acquisition-title">
        <div className="member-section-heading"><h2 id="member-acquisition-title">{active ? "续享会员" : "开通会员"}</h2></div>
        <section className="member-acquisition-method" aria-labelledby="member-purchase-method">
          <div className="member-method-heading"><h3 id="member-purchase-method">直接购买</h3></div>
          <div className="member-plan-grid" role="radiogroup" aria-label="选择会员时长">
            {(["month", "year"] as Plan[]).map((key) => <button key={key} className={`member-plan${plan === key ? " is-selected" : ""}`} role="radio" aria-checked={plan === key} onClick={() => setPlan(key)}>
              <span className="member-plan-title">{plans[key].title}</span><strong><small>¥</small>{plans[key].price}<em>/{plans[key].unit}</em></strong>
              {plan === key && <CheckCircledIcon className="member-plan-check" />}
            </button>)}
          </div>
          <MembershipPurchaseAction />
        </section>
        <div className="member-method-divider" aria-hidden="true"><span>或</span></div>
        <section className="member-acquisition-method member-invite-method" aria-labelledby="member-invite-method">
          <div className="member-method-heading"><h3 id="member-invite-method">邀请好友</h3><button className="member-text-button" onClick={onRewards}>奖励记录<ChevronRightIcon /></button></div>
          <p>累计邀请 <strong>{promotionRules.membershipInviteTarget} 位</strong>有效新用户，免费得 <strong>{promotionRules.membershipMonths} 个月会员</strong></p>
          <InvitationProgress />
          <button className="member-invite-button" onClick={() => openPoster()}><Share1Icon />邀请好友，免费得会员</button>
        </section>
      </section>
    </main>
  </MobileScroll>;
}

function MembershipPurchaseAction() {
  const { plan, showSheet, membership } = useMembership();
  return <div className="member-purchase-action"><button className="member-primary" onClick={() => showSheet("purchase")}>¥{plans[plan].price}/{plans[plan].unit} · {membership.status === "active" ? "立即续费" : "立即开通"}</button></div>;
}

