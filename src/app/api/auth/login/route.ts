import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/db/userMutations";
import { verifyPassword } from "@/lib/passwords";
import {
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
  createSessionCookieValue,
} from "@/lib/session";

// A well-formed but unusable hash, so a login attempt for an unknown email
// still runs the same scrypt work as a real one instead of returning early
// and leaking which emails have accounts via response timing.
const DUMMY_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionCookieValue(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}
