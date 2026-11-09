import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

export function getPayoutMethods(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString();
  return ApiRequestHandler({ method: "GET", endpoint: `admin/payout-methods${query ? `?${query}` : ""}`, includeAuth: true });
}

export function createPayoutMethod(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/payout-methods", includeAuth: true, data: body });
}
