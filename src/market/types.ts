export type VenueId = 'polymarket' | 'kalshi';

export type OrderbookRow = {
  price: string;
  shares: string;
  total?: string;
};

export type NormalizedOrderbook = {
  bids: OrderbookRow[];
  asks: OrderbookRow[];
};

export type HubStatus = 'idle' | 'connecting' | 'open' | 'closed';

export type MarketStreamState = {
  status: HubStatus;
  book: NormalizedOrderbook;
  lastUpdateAt: number;
  midPrice: number;
};
