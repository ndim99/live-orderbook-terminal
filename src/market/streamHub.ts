/**
 * Single in-tab market stream hub with refcounted subscriptions,
 * reconnect/backoff, and a stale-connection watchdog.
 * Mirrors the production WebSocket hub pattern used for multi-venue books.
 */

import { midFromBook, tryNormalizeOrderbookPayload } from './parseOrderbook';
import type { HubStatus, NormalizedOrderbook, VenueId } from './types';

type MessageListener = (venue: VenueId, book: NormalizedOrderbook) => void;
type StatusListener = (status: HubStatus) => void;

const messageListeners = new Set<MessageListener>();
const statusListeners = new Set<StatusListener>();
const subscribed = new Set<VenueId>();

let status: HubStatus = 'idle';
let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let tickTimer: ReturnType<typeof setInterval> | undefined;
let watchdogTimer: ReturnType<typeof setInterval> | undefined;
let lastFrameAt = 0;
let running = false;

const STALE_MS = 8_000;
const TICK_MS = 900;

function emitStatus(next: HubStatus) {
  status = next;
  for (const l of statusListeners) l(next);
}

function emitBook(venue: VenueId, book: NormalizedOrderbook) {
  lastFrameAt = Date.now();
  for (const l of messageListeners) l(venue, book);
}

function randomWalk(base: number, spread = 0.012): NormalizedOrderbook {
  const mid = Math.min(0.92, Math.max(0.08, base + (Math.random() - 0.5) * 0.01));
  const bids = Array.from({ length: 8 }, (_, i) => {
    const price = mid - spread / 2 - i * 0.004;
    const shares = 120 + Math.random() * 900 + i * 40;
    return {
      price: price.toFixed(3),
      shares: shares.toFixed(2),
      total: (price * shares).toFixed(2),
    };
  });
  const asks = Array.from({ length: 8 }, (_, i) => {
    const price = mid + spread / 2 + i * 0.004;
    const shares = 120 + Math.random() * 900 + i * 40;
    return {
      price: price.toFixed(3),
      shares: shares.toFixed(2),
      total: (price * shares).toFixed(2),
    };
  });
  return { bids, asks };
}

const seeds: Record<VenueId, number> = {
  polymarket: 0.54,
  kalshi: 0.51,
};

function pushFrames() {
  for (const venue of subscribed) {
    seeds[venue] = midFromBook(randomWalk(seeds[venue]));
    const book = randomWalk(seeds[venue], venue === 'polymarket' ? 0.01 : 0.016);
    const normalized = tryNormalizeOrderbookPayload({ data: book }) ?? book;
    emitBook(venue, normalized);
  }
}

function stopTimers() {
  if (tickTimer) clearInterval(tickTimer);
  if (watchdogTimer) clearInterval(watchdogTimer);
  if (reconnectTimer) clearTimeout(reconnectTimer);
  tickTimer = undefined;
  watchdogTimer = undefined;
  reconnectTimer = undefined;
}

function startPipeline() {
  if (running) return;
  running = true;
  emitStatus('connecting');
  reconnectTimer = setTimeout(
    () => {
      emitStatus('open');
      reconnectAttempt = 0;
      lastFrameAt = Date.now();
      pushFrames();
      tickTimer = setInterval(pushFrames, TICK_MS);
      watchdogTimer = setInterval(() => {
        if (status === 'open' && Date.now() - lastFrameAt > STALE_MS) {
          forceReconnect();
        }
      }, 2_000);
    },
    350 + reconnectAttempt * 200,
  );
}

function forceReconnect() {
  stopTimers();
  running = false;
  emitStatus('closed');
  reconnectAttempt += 1;
  const delay = Math.min(4_000, 400 * 2 ** reconnectAttempt);
  reconnectTimer = setTimeout(() => {
    if (subscribed.size > 0) startPipeline();
  }, delay);
}

function connectionDesired() {
  return subscribed.size > 0;
}

export function subscribeHubMessages(listener: MessageListener): () => void {
  messageListeners.add(listener);
  return () => messageListeners.delete(listener);
}

export function subscribeHubStatus(listener: StatusListener): () => void {
  listener(status);
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

export function addVenueSubscription(venue: VenueId): () => void {
  subscribed.add(venue);
  if (connectionDesired()) startPipeline();
  return () => {
    subscribed.delete(venue);
    if (!connectionDesired()) {
      stopTimers();
      running = false;
      emitStatus('idle');
    }
  };
}

export function getHubStatus(): HubStatus {
  return status;
}
