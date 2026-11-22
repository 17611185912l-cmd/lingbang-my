export const membershipDays = { month: 30, year: 365 } as const;
const dayMilliseconds = 24 * 60 * 60 * 1000;

// Payment and invitation grants use elapsed days, including across leap years.
export function membershipExpiry(now: number, previousExpiry: number | null, days: number) {
  return Math.max(now, previousExpiry ?? now) + days * dayMilliseconds;
}

export function membershipHasExpired(expiresAt: number, now: number) {
  return now >= expiresAt;
}
