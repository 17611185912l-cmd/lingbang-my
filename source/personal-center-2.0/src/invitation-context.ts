import { createContext, useContext } from "react";
import type { InvitedUser, PromotionReward, VoucherReward, summarizeVouchers } from "./promotion-data";

export type InvitationType = "parent" | "teacher" | "partner";
type InvitationState = {
  selected: InvitationType;
  select: (type: InvitationType) => void;
  eligibleCount: number;
  invitedUsers: InvitedUser[];
  rewards: PromotionReward[];
  rewardMonths: number;
  voucherAmount: number;
  vouchers: VoucherReward[];
  voucherSummary: ReturnType<typeof summarizeVouchers>;
  now: number;
  openPoster: (type?: InvitationType) => void;
  shareMiniProgram: () => void;
  savePoster: () => Promise<void>;
  saving: boolean;
};

// Keep shared context outside component refresh boundaries so all screens use
// the same provider when the local preview updates.
export const InvitationContext = createContext<InvitationState | null>(null);
export function useInvitation() {
  const context = useContext(InvitationContext);
  if (!context) throw new Error("InvitationProvider is required");
  return context;
}
