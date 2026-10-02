import OddsChart from '~/components/OddsChart';
import OrderbookLadder from '~/components/OrderbookLadder';
import { formatPrice } from '~/lib/utils';
import { useVenueBook } from '~/market/useVenueBook';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-secondary px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="font-mono text-lg">{value}</p>
    </div>
  );
}

export default function App() {
  const poly = useVenueBook('polymarket');
  const kalshi = useVenueBook('kalshi');

  return (
    <div className="mx-auto flex min-h-full max-w-384 flex-col gap-4 p-4 lg:p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Live Orderbook Terminal</h1>
        <p className="text-sm text-text-secondary">
          Multi-venue depth ladders driven by a shared in-tab stream hub with refcounted
          subscriptions, reconnect backoff, and a stale-connection watchdog.
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-3">
        <Stat label="Polymarket mid" value={formatPrice(poly.midPrice)} />
        <Stat label="Kalshi mid" value={formatPrice(kalshi.midPrice)} />
        <Stat
          label="Hub"
          value={poly.status === 'open' || kalshi.status === 'open' ? 'open' : poly.status}
        />
      </div>

      <OddsChart polymarket={poly.midPrice} kalshi={kalshi.midPrice} />

      <div className="grid gap-4 lg:grid-cols-2">
        <OrderbookLadder title="Polymarket" book={poly.book} status={poly.status} />
        <OrderbookLadder title="Kalshi" book={kalshi.book} status={kalshi.status} />
      </div>
    </div>
  );
}
