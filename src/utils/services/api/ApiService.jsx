import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/**
 * POST auth/employee/login — `{ email, password, device? }` → `{ data, status }` or `{ message, response }` on failure.
 * `device`: `{ device_id }`. A known `device_id` signs in directly; otherwise the
 * response is `{ otp_required: true, otp: { otp_token, email_hint, expires_at } }` and an OTP is emailed.
 */
export function employeeLogin({ email, password, device }) {
  return ApiRequestHandler({
    method: "POST",
    endpoint: "auth/employee/login",
    data: { email, password, device },
  });
}

/** POST auth/employee/login/verify-otp — `{ otp_token, otp }` → token plus a `device_id` to keep. */
export function verifyEmployeeLoginOtp({ otp_token, otp }) {
  return ApiRequestHandler({
    method: "POST",
    endpoint: "auth/employee/login/verify-otp",
    data: { otp_token, otp },
  });
}
