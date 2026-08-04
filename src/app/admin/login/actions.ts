"use server";

import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, expectedAdminCookieValue } from "@/lib/adminAuth";

export async function loginAdmin(password: string) {
  const expected = await expectedAdminCookieValue();
  if (!expected) {
    return { success: false, error: "ADMIN_PASSWORD is not configured on the server." };
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
