import { getCurrentUser } from "@/lib/auth";

/**
 * Defense-in-depth check for Route Handlers: the proxy already gates
 * /admin/:path*, but API routes re-verify independently rather than relying
 * solely on the proxy having run.
 */
export async function isAdminRequestAuthorized() {
  const user = await getCurrentUser();
  return Boolean(user?.isAdmin);
}
