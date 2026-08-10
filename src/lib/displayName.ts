export function displayName(user: { name: string | null; email: string }) {
  if (user.name) return user.name.split(" ")[0];
  return user.email.split("@")[0];
}
