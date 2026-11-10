import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Transactions (staff token required): the users' wallet ledger, read-only.
 * type: EARNING (+, from an approved booking) | WITHDRAWAL (-, to a payout method) | ADJUSTMENT (+/-).
 * Withdrawals are approved / rejected / paid through /admin/withdrawals, not here.
 * Resolves to `{ data, status }`, or `{ message, response }` on failure.
 */

/**
 * GET admin/transactions → `data.data` (newest first), `data.pagination` and `data.summary`:
 * `byType` ({ EARNING: 2, … }, ignores `type`), `byStatus` (ignores `status`) and `totals` (per currency: count,
 * earningsCents, withdrawalsCents, withdrawalFeesCents, adjustmentsCents; rejected/failed/cancelled left out).
 * Rows add `direction` (credit|debit), `netPayoutCents` (withdrawals) and `booking` ({ id, status, title, currency, agreedCents, employerFeeCents,
 * employerPaysCents, commissionCents, freelancerGetsCents, platformEarnsCents }).
 * params: `page`, `limit` (max 100), `type` / `status` (comma-separated), `search`, `currency`, `user_id`,
 * `booking_id`, `from`, `to`.
 */
export function getTransactions(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return ApiRequestHandler({ method: "GET", endpoint: `admin/transactions${query ? `?${query}` : ""}`, includeAuth: true });
}

/** GET admin/transactions/:id → `data.data`: the row plus `payoutMethod` (account number masked), `processedBy`, `adminNote`, `payoutBatchId`. */
export function getTransaction(id) {
  return ApiRequestHandler({ method: "GET", endpoint: `admin/transactions/${encodeURIComponent(id)}`, includeAuth: true });
}
