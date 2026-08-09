const COOKIE_NAME = "fridge_admin";

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedAdminCookieValue() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return sha256(password);
}

/**
 * Defense-in-depth check for Route Handlers: middleware already gates
 * /admin/:path*, but API routes re-verify independently rather than relying
 * solely on middleware having run.
 */
export async function isAdminRequestAuthorized() {
  const { cookies } = await import("next/headers");
  const expected = await expectedAdminCookieValue();
  if (!expected) return false;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === expected;
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };
