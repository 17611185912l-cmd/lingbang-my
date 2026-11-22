import { useId, useState } from "react";
import { MobileScroll } from "./mobile";
import { useInvitation } from "./invitation-context";
import { useGuideScene } from "./prototype-guide-context";
import { getVoucherStatus, promotionTimestamp, voucherDateLabel, voucherStatusLabels, voucherUsageLabels, type VoucherReward, type VoucherStatus } from "./promotion-data";

type HistoricalVoucherStatus = Exclude<VoucherStatus, "unused">;
const statuses: HistoricalVoucherStatus[] = ["used", "expired"];

export function VoucherList({ vouchers, emptyStatus = "unused" }: { vouchers: VoucherReward[]; emptyStatus?: VoucherStatus }) {
  const { now } = useInvitation();
  return vouchers.length ? <ul className="voucher-list">{vouchers.map((voucher) => {
    const status = getVoucherStatus(voucher, now);
    return <li key={voucher.id} className={`voucher-card is-${status}`}>
          <div className="voucher-card-main">
            <div className="voucher-value"><strong><small>¥</small>{voucher.amount}</strong><span>订单抵用券</span></div>
            <div className="voucher-card-info">
              <div><h3>邀请好友奖励</h3><span className="voucher-status-label">{voucherStatusLabels[status]}</span></div>
              <p>{voucherUsageLabels[status]}</p>
              <p className="voucher-validity">有效期 <time dateTime={new Date(promotionTimestamp(voucher.issuedAt)).toISOString()}>{voucher.issuedAt}</time> - <time dateTime={new Date(voucher.expiresAt).toISOString()}>{voucherDateLabel(voucher.expiresAt)}</time></p>
              {voucher.usedAt !== undefined && <p className="voucher-used-at">使用时间 <time dateTime={new Date(voucher.usedAt).toISOString()}>{voucherDateLabel(voucher.usedAt)}</time></p>}
            </div>
          </div>
        </li>;
  })}</ul> : <div className="voucher-empty"><h3>{emptyStatus === "unused" ? "暂无可用抵用券" : `暂无${voucherStatusLabels[emptyStatus]}的抵用券`}</h3><p>{emptyStatus === "unused" ? "邀请好友注册，即可获得抵用券" : `${voucherStatusLabels[emptyStatus]}的抵用券将显示在这里`}</p></div>;
}

export function VoucherHistory({ isCurrent = true }: { isCurrent?: boolean }) {
  const { vouchers, voucherSummary, now } = useInvitation();
  const [activeStatus, setActiveStatus] = useState<HistoricalVoucherStatus>("used");
  const tabId = useId();
  const visibleVouchers = vouchers.filter((voucher) => getVoucherStatus(voucher, now) === activeStatus)
    .sort((a, b) => activeStatus === "used" ? b.usedAt! - a.usedAt! : b.expiresAt - a.expiresAt);
  useGuideScene(activeStatus === "used" ? "voucher-history-used" : "voucher-history-expired", isCurrent, { 当前Tab: voucherStatusLabels[activeStatus], 已使用: `${voucherSummary.used}张`, 已过期: `${voucherSummary.expired}张`, 当前列表: `${visibleVouchers.length}条` });

  return <main className="voucher-history-content" aria-hidden={!isCurrent} inert={!isCurrent}>
    <div className="voucher-status-tabs" role="tablist" aria-label="历史抵用券状态">
      {statuses.map((status) => <button key={status} id={`${tabId}-${status}`} role="tab" type="button" aria-selected={activeStatus === status} aria-controls={`${tabId}-panel`} tabIndex={activeStatus === status ? 0 : -1} onClick={() => setActiveStatus(status)} onKeyDown={(event) => {
        const index = statuses.indexOf(status);
        const next = event.key === "ArrowRight" ? statuses[(index + 1) % statuses.length] : event.key === "ArrowLeft" ? statuses[(index + statuses.length - 1) % statuses.length] : event.key === "Home" ? statuses[0] : event.key === "End" ? statuses[statuses.length - 1] : null;
        if (next) { event.preventDefault(); setActiveStatus(next); document.getElementById(`${tabId}-${next}`)?.focus(); }
      }}>{voucherStatusLabels[status]}<span>{voucherSummary[status]}</span></button>)}
    </div>
    <MobileScroll key={activeStatus} className="voucher-list-scroll">
      <div className="voucher-tab-panel" id={`${tabId}-panel`} role="tabpanel" aria-labelledby={`${tabId}-${activeStatus}`}>
        <VoucherList vouchers={visibleVouchers} emptyStatus={activeStatus} />
      </div>
    </MobileScroll>
  </main>;
}
