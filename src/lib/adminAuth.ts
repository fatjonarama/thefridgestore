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

export { COOKIE_NAME as ADMIN_COOKIE_NAME };
