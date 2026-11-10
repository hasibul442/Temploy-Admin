import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Withdrawals (staff token required): freelancers taking money out of their wallet.
 * PENDING → APPROVED → (PROCESSING) → PAID, or REJECTED / FAILED / CANCELLED (the amount goes back to the balance).
 * Resolves to `{ data, status }`, or `{ message, response }` on failure (409 when the status no longer allows it).
 */

/**
 * GET admin/withdrawals → `data.data`, `data.pagination` and `data.summary`: `byStatus` ({ PENDING: 3, … }, ignores
 * `status`) and `totals` (per currency: count, amountCents, feeCents, netPayoutCents; rejected/failed/cancelled left out).
 * Rows carry `actions` ({ approve, reject, paid, failed }: which ones the status allows) and `user.isKycVerified`.
 * Only pending/approved/processing → oldest first; otherwise newest first.
 * params: `page`, `limit` (max 100), `status` (comma-separated), `search`, `method_type` (bank|wallet), `currency`,
 * `user_id`, `from`, `to`.
 */
export function getWithdrawals(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return ApiRequestHandler({ method: "GET", endpoint: `admin/withdrawals${query ? `?${query}` : ""}`, includeAuth: true });
}

/**
 * GET admin/withdrawals/:id → `data.data`: the row plus the full `payoutMethod` (to send the money by hand),
 * `balances` (the user's available balance per currency), `actions` and `history` (staff actions, oldest first).
 */
export function getWithdrawal(id) {
  return ApiRequestHandler({ method: "GET", endpoint: `admin/withdrawals/${encodeURIComponent(id)}`, includeAuth: true });
}

const act = (id, action, data) =>
  ApiRequestHandler({ method: "POST", endpoint: `admin/withdrawals/${encodeURIComponent(id)}/${action}`, data, includeAuth: true });

/** POST …/approve — optional `note`. Resolves to the updated details. */
export const approveWithdrawal = (id, note) => act(id, "approve", { note });
/** POST …/reject — `note` required (3–500 chars, shown to the user). */
export const rejectWithdrawal = (id, note) => act(id, "reject", { note });
/** POST …/paid — optional `reference` from the bank or wallet transfer. */
export const markWithdrawalPaid = (id, reference) => act(id, "paid", { reference });
/** POST …/failed — optional `reason`. */
export const markWithdrawalFailed = (id, reason) => act(id, "failed", { reason });
