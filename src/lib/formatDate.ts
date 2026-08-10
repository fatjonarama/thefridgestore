// Kosovo, Albania, and North Macedonia all share the Europe/Belgrade UTC
// offset. Dates are formatted with an explicit timeZone (rather than the
// runtime default) so server-rendered and client-hydrated output always
// match, regardless of which timezone the server process happens to run in.
const TIME_ZONE = "Europe/Belgrade";

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("en-GB", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
