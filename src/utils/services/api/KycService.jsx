import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * KYC documents (staff token required). Resolves to `{ data, status }`, or `{ message, response }` on failure.
 * One document per user; a user's re-upload replaces it and puts it back to PENDING.
 */

/**
 * GET admin/kyc → `data.data` (documents with `user` and `review`), `data.counts` ({ all, pending, approved, rejected })
 * and `data.pagination`. params: `status` (pending|approved|rejected), `search`, `document_type`, `role`, `page`, `limit` (max 100).
 */
export function getKycDocuments(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return ApiRequestHandler({ method: "GET", endpoint: `admin/kyc${query ? `?${query}` : ""}`, includeAuth: true });
}

/** GET admin/kyc/:id — document, user, latest `review` and `history`. */
export function getKycDocument(id) {
  return ApiRequestHandler({ method: "GET", endpoint: `admin/kyc/${encodeURIComponent(id)}`, includeAuth: true });
}

/** POST admin/kyc/:id/approve — pending only (409 once reviewed); the user becomes KYC verified. */
export function approveKyc(id) {
  return ApiRequestHandler({ method: "POST", endpoint: `admin/kyc/${encodeURIComponent(id)}/approve`, includeAuth: true });
}

/** POST admin/kyc/:id/reject — `{ note }` (3–500 chars) is shown to the user. Pending only. */
export function rejectKyc(id, note) {
  return ApiRequestHandler({ method: "POST", endpoint: `admin/kyc/${encodeURIComponent(id)}/reject`, includeAuth: true, data: { note } });
}
