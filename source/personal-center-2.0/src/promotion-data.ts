export type InvitedUser = {
  id: string;
  // Opaque server key for the full verified phone; never the masked display value.
  phoneIdentity: string;
  name: string;
  phone: string;
  registeredAt: string;
};

type RewardBase = {
  id: string;
  issuedAt: string;
  reason: string;
};
export type VoucherReward = RewardBase & {
  type: "voucher";
  amount: number;
  expiresAt: number;
  usedAt?: number;
};
export type PromotionReward = (RewardBase & { type: "membership"; months: number }) | VoucherReward;
export type VoucherStatus = "unused" | "used" | "expired";
export const voucherStatusLabels: Record<VoucherStatus, string> = {
  unused: "未使用", used: "已使用", expired: "已过期",
};
export const voucherUsageLabels: Record<VoucherStatus, string> = {
  unused: "下单支付时可抵扣", used: "已用于订单支付抵扣", expired: "已过期，不可使用",
};

export const promotionRules = {
  membershipInviteTarget: 10,
  membershipMonths: 1,
  voucherAmount: 2,
  voucherValidityDays: 30,
} as const;

// Existing invitation labels use China time. Do not parse them in the host timezone.
export function promotionTimestamp(value: string) {
  return Date.parse(`${value.replaceAll(".", "-").replace(" ", "T")}:00+08:00`);
}

export function voucherDateLabel(value: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(value).replaceAll("/", ".");
}

export function getVoucherStatus(voucher: VoucherReward, now: number): VoucherStatus {
  if (voucher.usedAt !== undefined) return "used";
  return voucher.expiresAt <= now ? "expired" : "unused";
}

export function summarizeVouchers(vouchers: VoucherReward[], now: number) {
  const summary = { unused: 0, used: 0, expired: 0 };
  for (const voucher of vouchers) {
    const status = getVoucherStatus(voucher, now);
    summary[status]++;
  }
  return summary;
}

// Build consistent preview records only; this never issues a real reward.
export function buildPromotionPreview(users: InvitedUser[], usedVouchers: Record<string, string> = {}) {
  const byFirstRegistration = [...users].sort((a, b) => a.registeredAt.localeCompare(b.registeredAt) || a.id.localeCompare(b.id));
  const byPhone = new Map<string, InvitedUser>();
  for (const user of byFirstRegistration) {
    if (user.phoneIdentity && !byPhone.has(user.phoneIdentity)) byPhone.set(user.phoneIdentity, user);
  }
  const invitedUsers = [...byPhone.values()]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  const rewards: PromotionReward[] = [];
  [...invitedUsers].reverse().forEach((user, index) => {
    const voucherId = `voucher-${user.id}`;
    rewards.push({
      id: voucherId, type: "voucher", amount: promotionRules.voucherAmount,
      issuedAt: user.registeredAt, reason: `邀请 ${user.name} 注册`,
      expiresAt: promotionTimestamp(user.registeredAt) + promotionRules.voucherValidityDays * 86400000,
      usedAt: usedVouchers[voucherId] ? promotionTimestamp(usedVouchers[voucherId]) : undefined,
    });
    if ((index + 1) % promotionRules.membershipInviteTarget === 0) {
      rewards.push({
        id: `membership-${user.id}`, type: "membership", months: promotionRules.membershipMonths,
        issuedAt: user.registeredAt, reason: `累计邀请满 ${index + 1} 人`,
      });
    }
  });
  rewards.reverse();
  return {
    invitedUsers, rewards,
    rewardMonths: rewards.reduce((total, reward) => total + (reward.type === "membership" ? reward.months : 0), 0),
    voucherAmount: rewards.reduce((total, reward) => total + (reward.type === "voucher" ? reward.amount : 0), 0),
  };
}

export function membershipInviteProgress(eligibleCount: number) {
  const current = eligibleCount % promotionRules.membershipInviteTarget;
  return { current, remaining: promotionRules.membershipInviteTarget - current };
}

// Explicit preview fixtures only. No real invitation or reward is generated.
export const exampleInvitedUsers: InvitedUser[] = [
  { id: "example-user-1", phoneIdentity: "demo-phone-1", name: "林*", phone: "138****2601", registeredAt: "2026.11.18 10:26" },
  { id: "example-user-2", phoneIdentity: "demo-phone-2", name: "陈*安", phone: "156****7328", registeredAt: "2026.11.17 16:42" },
  { id: "example-user-3", phoneIdentity: "demo-phone-3", name: "周*", phone: "189****5196", registeredAt: "2026.11.16 09:15" },
  { id: "example-user-4", phoneIdentity: "demo-phone-4", name: "李*宁", phone: "137****6842", registeredAt: "2026.11.15 14:38" },
  { id: "example-user-5", phoneIdentity: "demo-phone-5", name: "王*", phone: "159****2075", registeredAt: "2026.11.13 11:07" },
  { id: "example-user-6", phoneIdentity: "demo-phone-6", name: "赵*悦", phone: "186****9413", registeredAt: "2026.11.12 18:20" },
  { id: "example-user-7", phoneIdentity: "demo-phone-7", name: "孙*", phone: "135****3680", registeredAt: "2026.11.10 15:36" },
  { id: "example-user-8", phoneIdentity: "demo-phone-8", name: "吴*然", phone: "158****8127", registeredAt: "2026.11.08 10:52" },
  { id: "example-user-9", phoneIdentity: "demo-phone-9", name: "郑*", phone: "139****4268", registeredAt: "2026.11.07 13:24" },
  { id: "example-user-10", phoneIdentity: "demo-phone-10", name: "许*晴", phone: "157****3916", registeredAt: "2026.11.06 10:18" },
  { id: "example-user-11", phoneIdentity: "demo-phone-11", name: "何*", phone: "188****6520", registeredAt: "2026.10.17 16:35" },
  { id: "example-user-12", phoneIdentity: "demo-phone-12", name: "沈*言", phone: "136****9043", registeredAt: "2026.10.15 09:42" },
];

// Preview-only redemption examples; no order or payment is created.
export const examplePromotionData = buildPromotionPreview(exampleInvitedUsers, {
  "voucher-example-user-6": "2026.11.13 14:20",
  "voucher-example-user-8": "2026.11.10 10:35",
});
