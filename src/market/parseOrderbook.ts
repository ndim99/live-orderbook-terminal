import type { NormalizedOrderbook, OrderbookRow } from './types';

function numberFromUnknown(value: unknown): number | null {
  const n = Number.parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function rowFromUnknown(entry: unknown): OrderbookRow | null {
  if (!entry || typeof entry !== 'object') return null;
  const o = entry as Record<string, unknown>;
  const price = o.price ?? o.p ?? o[0];
  const size = o.size ?? o.quantity ?? o.shares ?? o.q ?? o[1];
  const rawTotal = o.total ?? o.volume ?? o.cumulative;
  if (price === undefined || size === undefined) return null;
  const priceNumber = numberFromUnknown(price);
  const sizeNumber = numberFromUnknown(size);
  const total =
    rawTotal ??
    (priceNumber != null && sizeNumber != null ? String(priceNumber * sizeNumber) : undefined);
  return {
    price: String(price),
    shares: String(size),
    ...(total !== undefined ? { total: String(total) } : {}),
  };
}

function rowsFromList(list: unknown): OrderbookRow[] {
  if (!Array.isArray(list)) return [];
  return list.map(rowFromUnknown).filter((r): r is OrderbookRow => r !== null);
}

export function tryNormalizeOrderbookPayload(parsed: unknown): NormalizedOrderbook | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const root = parsed as Record<string, unknown>;
  const data = root.data ?? root.payload ?? root;
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const bids = rowsFromList(d.bids ?? d.buy);
  const asks = rowsFromList(d.asks ?? d.sell);
  if (!bids.length && !asks.length) return null;
  return { bids, asks };
}

export function midFromBook(book: NormalizedOrderbook): number {
  const bestBid = book.bids[0] ? Number.parseFloat(book.bids[0].price) : NaN;
  const bestAsk = book.asks[0] ? Number.parseFloat(book.asks[0].price) : NaN;
  if (Number.isFinite(bestBid) && Number.isFinite(bestAsk)) return (bestBid + bestAsk) / 2;
  if (Number.isFinite(bestBid)) return bestBid;
  if (Number.isFinite(bestAsk)) return bestAsk;
  return 0.5;
}
