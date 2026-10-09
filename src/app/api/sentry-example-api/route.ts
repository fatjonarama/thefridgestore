// Temporary verification route, paired with /sentry-example-page.
// Delete both once Sentry setup is confirmed working.
export async function GET() {
  throw new Error("Sentry server-side test error");
}
