import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type UserRow } from "@/db/schema";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "@/lib/session";

export type PublicUser = Omit<UserRow, "passwordHash">;

function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const uid = verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!uid) return null;

  const rows = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  return rows[0] ? toPublicUser(rows[0]) : null;
}
