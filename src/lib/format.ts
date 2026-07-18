export const yen = (n: number, digits = 0) =>
  !isFinite(n) ? "—" : n.toLocaleString("ja-JP", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const usd = (n: number, digits = 2) =>
  !isFinite(n) ? "—" : n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.max(1, Math.floor((now - ts) / 1000));
  if (s < 60) return `${s}秒前`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  const d = Math.floor(h / 24);
  return `${d}日前`;
}
