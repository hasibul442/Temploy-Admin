"use server";

import { cookies } from "next/headers";

const TOKEN_COOKIE = "token";

// Not HttpOnly yet: browser code still reads the token to send `Authorization: Bearer`.
export async function setTokenCookie(token, remember) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: 30 * 24 * 60 * 60 } : {}),
  });
}

export async function clearTokenCookie() {
  (await cookies()).delete(TOKEN_COOKIE);
}
