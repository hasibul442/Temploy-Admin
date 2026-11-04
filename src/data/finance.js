/**
 * Mock finance data (transactions, withdrawals).
 * Deterministic (index-based) so server and client renders match.
 */
import { PEOPLE, CLIENTS, daysAgo } from "./marketplace";

const pick = (arr, i) => arr[i % arr.length];

// ---------------------------------------------------------------- Transactions
export const TXN_TYPES = ["Payment", "Payout", "Refund", "Fee", "Deposit"];
export const TXN_METHODS = ["Card", "bKash", "Nagad", "PayPal", "Bank transfer", "Wallet"];
const TXN_STATUSES = ["Completed", "Completed", "Completed", "Pending", "Completed", "Failed", "Completed"];

export const transactions = Array.from({ length: 50 }, (_, i) => {
  const type = pick(TXN_TYPES, i * 3);
  const base = 20 + ((i * 263) % 1800);
  // Sign from the platform's point of view: money in is positive, money out negative.
  const amount =
    type === "Payment" || type === "Deposit" ? base : type === "Fee" ? Math.round(base * 0.1) : -base;
  const isClientSide = type === "Payment" || type === "Deposit" || type === "Refund";
  return {
    id: `TXN-${88420 - i}`,
    user: isClientSide ? pick(CLIENTS, i) : pick(PEOPLE, i * 5),
    type,
    method: type === "Fee" ? "Wallet" : pick(TXN_METHODS, i * 7),
    amount,
    reference: type === "Deposit" ? "—" : `ORD-${10482 - ((i * 3) % 44)}`,
    date: daysAgo(Math.floor(i / 2)),
    status: pick(TXN_STATUSES, i * 5),
  };
});

// ---------------------------------------------------------------- Withdrawals
export const WD_METHODS = ["Bank transfer", "bKash", "PayPal", "Payoneer"];
const WD_STATUSES = ["Pending", "Paid", "Approved", "Paid", "Pending", "Rejected", "Paid", "Pending"];

export const withdrawals = Array.from({ length: 30 }, (_, i) => {
  const amount = 50 + ((i * 317) % 2400);
  return {
    id: `WD-${3310 - i}`,
    freelancer: pick(PEOPLE, i * 3),
    amount,
    balance: amount + ((i * 191) % 1500),
    method: pick(WD_METHODS, i),
    account: `•••• ${String(1000 + ((i * 7919) % 9000)).slice(-4)}`,
    requested: daysAgo(i),
    status: pick(WD_STATUSES, i),
  };
});
