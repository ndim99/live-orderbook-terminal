import { useSyncExternalStore } from 'react';
import { midFromBook } from './parseOrderbook';
import { addVenueSubscription, subscribeHubMessages, subscribeHubStatus } from './streamHub';
import type { HubStatus, MarketStreamState, NormalizedOrderbook, VenueId } from './types';

const emptyBook: NormalizedOrderbook = { bids: [], asks: [] };

const snapshots = new Map<VenueId, MarketStreamState>();
const listeners = new Map<VenueId, Set<() => void>>();
const releases = new Map<VenueId, () => void>();

function ensure(venue: VenueId) {
  if (!snapshots.has(venue)) {
    snapshots.set(venue, {
      status: 'idle',
      book: emptyBook,
      lastUpdateAt: 0,
      midPrice: 0.5,
    });
  }
  if (!listeners.has(venue)) listeners.set(venue, new Set());
}

function emit(venue: VenueId) {
  for (const l of listeners.get(venue) ?? []) l();
}

function readSnapshot(venue: VenueId): MarketStreamState {
  ensure(venue);
  return snapshots.get(venue)!;
}

const snapshotGetters = new Map<VenueId, () => MarketStreamState>();

function getSnapshot(venue: VenueId): () => MarketStreamState {
  let getter = snapshotGetters.get(venue);
  if (getter) return getter;
  getter = () => readSnapshot(venue);
  snapshotGetters.set(venue, getter);
  return getter;
}

const subscribes = new Map<VenueId, (onStoreChange: () => void) => () => void>();

function subscribeVenue(venue: VenueId): (onStoreChange: () => void) => () => void {
  let subscribe = subscribes.get(venue);
  if (subscribe) return subscribe;
  subscribe = (onStoreChange) => {
    ensure(venue);
    const set = listeners.get(venue)!;
    set.add(onStoreChange);
    if (!releases.has(venue)) {
      releases.set(venue, addVenueSubscription(venue));
    }
    return () => {
      set.delete(onStoreChange);
      if (set.size === 0) {
        releases.get(venue)?.();
        releases.delete(venue);
      }
    };
  };
  subscribes.set(venue, subscribe);
  return subscribe;
}

let hubWired = false;
function wireHub() {
  if (hubWired) return;
  hubWired = true;
  subscribeHubStatus((status: HubStatus) => {
    for (const venue of snapshots.keys()) {
      const prev = snapshots.get(venue)!;
      if (prev.status === status) continue;
      snapshots.set(venue, { ...prev, status });
      emit(venue);
    }
  });
  subscribeHubMessages((venue, book) => {
    ensure(venue);
    snapshots.set(venue, {
      status: 'open',
      book,
      lastUpdateAt: Date.now(),
      midPrice: midFromBook(book),
    });
    emit(venue);
  });
}

export function useVenueBook(venue: VenueId): MarketStreamState {
  wireHub();
  ensure(venue);

  return useSyncExternalStore(subscribeVenue(venue), getSnapshot(venue), getSnapshot(venue));
}
