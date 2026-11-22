import test from 'node:test';
import assert from 'node:assert/strict';
import { membershipDays, membershipExpiry, membershipHasExpired } from '../src/membership-rules.ts';
import { buildPromotionPreview, examplePromotionData } from '../src/promotion-data.ts';

const timestamp = value => Date.parse(value);
const day = 86400000;
const user = (id, phoneIdentity, registeredAt, phone = '138****1234') => ({ id, phoneIdentity, registeredAt, phone, name: '测试用户' });

test('monthly period crosses month end by exactly 30 days', () => {
  const start = timestamp('2027-01-31T10:00:00+08:00');
  const end = membershipExpiry(start, null, membershipDays.month);
  assert.equal(end, timestamp('2027-03-02T10:00:00+08:00'));
  assert.equal(end - start, 30 * day);
});

test('annual period stays 365 elapsed days across leap day', () => {
  for (const [start, expected] of [
    ['2027-03-01T10:00:00+08:00', '2028-02-29T10:00:00+08:00'],
    ['2028-02-29T10:00:00+08:00', '2029-02-28T10:00:00+08:00'],
  ]) assert.equal(membershipExpiry(timestamp(start), null, membershipDays.year), timestamp(expected));
});

test('renewal preserves remaining time while expired membership starts now', () => {
  const now = timestamp('2026-11-22T10:00:00+08:00');
  const future = now + 5 * day;
  assert.equal(membershipExpiry(now, future, membershipDays.month), now + 35 * day);
  assert.equal(membershipExpiry(now, now - day, membershipDays.month), now + 30 * day);
  assert.equal(membershipExpiry(now, null, membershipDays.month), now + 30 * day);
  assert.equal(membershipDays.year - 12 * membershipDays.month, 5);
});

test('the exact expiry instant is expired, regardless of display date', () => {
  const end = timestamp('2026-12-22T10:00:00+08:00');
  assert.equal(membershipHasExpired(end, end - 1), false);
  assert.equal(membershipHasExpired(end, end), true);
  assert.equal(membershipHasExpired(end, end + 1), true);
});

test('same verified phone under different IDs counts once, preserving first registration', () => {
  const data = buildPromotionPreview([
    user('later', 'phone-a', '2026.11.19 12:00'),
    user('earlier', 'phone-a', '2026.11.18 10:00'),
  ]);
  assert.equal(data.invitedUsers.length, 1);
  assert.equal(data.invitedUsers[0].id, 'earlier');
  assert.equal(data.rewards.length, 1);
  assert.equal(data.voucherAmount, 2);
});

test('masked phone collision is not identity; missing identity must not count', () => {
  const data = buildPromotionPreview([
    user('a', 'phone-a', '2026.11.18 10:00'),
    user('b', 'phone-b', '2026.11.18 11:00'),
    user('c', '', '2026.11.18 12:00'),
  ]);
  assert.equal(data.invitedUsers.length, 2);
  assert.equal(data.voucherAmount, 4);
});

test('duplicates around the tenth phone do not duplicate either reward', () => {
  const users = Array.from({ length: 10 }, (_, index) => user(`u${index}`, `phone-${index}`, `2026.11.18 ${String(index + 10).padStart(2, '0')}:00`));
  const data = buildPromotionPreview([...users, { ...users[9], id: 'another-account' }]);
  assert.equal(data.invitedUsers.length, 10);
  assert.equal(data.rewardMonths, 1);
  assert.equal(data.rewards.filter(reward => reward.type === 'voucher').length, 10);
  assert.equal(data.voucherAmount, 20);
});

test('current visible preview totals remain consistent', () => {
  assert.equal(examplePromotionData.invitedUsers.length, 12);
  assert.equal(examplePromotionData.rewardMonths, 1);
  assert.equal(examplePromotionData.voucherAmount, 24);
});
