import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  LineSeries,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';

export default function OddsChart({
  polymarket,
  kalshi,
}: {
  polymarket: number;
  kalshi: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const polySeries = useRef<ISeriesApi<'Line'> | null>(null);
  const limSeries = useRef<ISeriesApi<'Line'> | null>(null);
  const tRef = useRef(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!hostRef.current) return;
    const theme = getComputedStyle(document.documentElement);
    const token = (name: string) => theme.getPropertyValue(name).trim();
    const chart = createChart(hostRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: token('--color-text-secondary'),
        fontFamily: token('--font-mono'),
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      height: 320,
    });
    chartRef.current = chart;
    polySeries.current = chart.addSeries(LineSeries, {
      color: token('--color-accent'),
      lineWidth: 2,
      priceLineVisible: false,
    });
    limSeries.current = chart.addSeries(LineSeries, {
      color: token('--color-yes'),
      lineWidth: 2,
      priceLineVisible: false,
    });

    const ro = new ResizeObserver(() => {
      if (!hostRef.current) return;
      chart.applyOptions({ width: hostRef.current.clientWidth });
    });
    ro.observe(hostRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    tRef.current += 1;
    const t = tRef.current as unknown as LineData['time'];
    polySeries.current?.update({ time: t, value: polymarket });
    limSeries.current?.update({ time: t, value: kalshi });
  }, [polymarket, kalshi]);

  return (
    <div className="w-full rounded-2xl border border-border bg-bg-secondary p-2">
      <div ref={hostRef} className="w-full" />
      <div className="flex items-center gap-4 px-2 pt-1 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" />
          Polymarket
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-yes" />
          Kalshi
        </span>
      </div>
    </div>
  );
}
