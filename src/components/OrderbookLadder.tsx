import { cn, formatPrice, formatUsd } from '~/lib/utils';
import type { NormalizedOrderbook, OrderbookRow } from '~/market/types';

function priceOf(row: OrderbookRow) {
  return Number.parseFloat(row.price);
}

function DepthRows({
  rows,
  tone,
  wash,
  reverse,
}: {
  rows: OrderbookRow[];
  tone: string;
  wash: string;
  reverse?: boolean;
}) {
  const sorted = [...rows].sort((a, b) =>
    reverse ? priceOf(a) - priceOf(b) : priceOf(b) - priceOf(a),
  );
  const totals = sorted.map((r) => Number.parseFloat(r.total ?? '0'));
  const max = Math.max(...totals, 1);

  return (
    <div className={cn('flex flex-col max-h-40 overflow-y-auto', reverse && 'flex-col-reverse')}>
      {sorted.map((row, i) => {
        const total = Number.parseFloat(row.total ?? '0');
        const width = Math.max(8, (total / max) * 100);
        return (
          <div
            key={`${row.price}-${i}`}
            className="relative grid h-8 shrink-0 grid-cols-3 items-center px-2 font-mono text-xs"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0"
              style={{ width: `${width}%`, backgroundColor: wash }}
            />
            <span className="relative z-10" style={{ color: tone }}>
              {formatPrice(priceOf(row))}
            </span>
            <span className="relative z-10 text-center text-text-secondary">{row.shares}</span>
            <span className="relative z-10 text-right text-text-secondary">
              {formatUsd(row.total)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderbookLadder({
  title,
  book,
  status,
}: {
  title: string;
  book: NormalizedOrderbook;
  status: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-bg-secondary overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-3 py-2">
        <h2 className="text-sm font-medium">{title}</h2>
        <span className="text-xs uppercase tracking-wide text-text-muted">{status}</span>
      </header>
      <div className="grid grid-cols-3 px-2 py-2 text-xs uppercase tracking-wide text-text-muted">
        <span>Price</span>
        <span className="text-center">Size</span>
        <span className="text-right">Total</span>
      </div>
      <DepthRows rows={book.asks} tone="var(--color-no)" wash="var(--color-bg-no)" reverse />
      <div className="flex h-8 shrink-0 items-center justify-center border-y border-border px-3 font-mono text-sm text-text-secondary">
        spread
      </div>
      <DepthRows rows={book.bids} tone="var(--color-yes)" wash="var(--color-bg-yes)" />
    </section>
  );
}
