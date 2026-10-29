import * as Sentry from "@sentry/nextjs";

type OrderNotification = {
  orderId: number;
  customerName: string;
  phone: string;
  country: string;
  address: string;
  totalCents: number;
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Pings the store owner's Telegram as soon as an order is placed, so she
// doesn't have to keep checking /admin/orders manually. Both env vars are
// optional -- if they're not set (e.g. in local dev), this is a silent
// no-op rather than an error.
export async function notifyNewOrder(order: OrderNotification): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    `🧊 <b>New order #${order.orderId}</b>`,
    "",
    `Customer: ${escapeHtml(order.customerName)}`,
    `Phone: ${escapeHtml(order.phone)}`,
    `Total: ${formatCents(order.totalCents)}`,
    `Country: ${escapeHtml(order.country)}`,
    `Address: ${escapeHtml(order.address)}`,
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!response.ok) {
      throw new Error(`Telegram API responded with ${response.status}: ${await response.text()}`);
    }
  } catch (error) {
    // A failed notification must never fail the order -- the customer's
    // order is already saved either way. Report it to Sentry so the
    // failure isn't silent, but swallow it here.
    Sentry.captureException(error);
  }
}
