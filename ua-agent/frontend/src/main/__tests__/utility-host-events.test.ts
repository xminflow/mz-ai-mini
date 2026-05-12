/**
 * Streaming-event fan-out test for the utility-host (Decision 8).
 *
 * The real `UtilityHost` imports from `electron`, which is unavailable in
 * vitest. We model the topic-subscriber wiring inline and assert messages
 * with `{type:"event"}` are delivered to all registered subscribers.
 */

import { describe, expect, it } from "vitest";

interface UtilityEvent { type: "event"; topic: string; payload: unknown }
interface RpcResponse { id: number; ok: boolean; result?: unknown }
type Message = UtilityEvent | RpcResponse;

class TopicHost {
  private topicSubscribers = new Map<string, Set<(payload: unknown) => void>>();
  // simulate pending RPCs
  private pending = new Map<number, (value: unknown) => void>();

  ingest(message: Message): void {
    if ("type" in message && message.type === "event") {
      const subs = this.topicSubscribers.get(message.topic);
      if (subs === undefined) return;
      for (const cb of subs) cb(message.payload);
      return;
    }
    if ("id" in message) {
      const resolver = this.pending.get(message.id);
      if (resolver !== undefined) {
        this.pending.delete(message.id);
        resolver(message.result);
      }
    }
  }

  subscribe(topic: string, cb: (payload: unknown) => void): () => void {
    let subs = this.topicSubscribers.get(topic);
    if (subs === undefined) {
      subs = new Set();
      this.topicSubscribers.set(topic, subs);
    }
    subs.add(cb);
    return () => {
      subs!.delete(cb);
      if (subs!.size === 0) this.topicSubscribers.delete(topic);
    };
  }
}

describe("utility-host streaming events", () => {
  it("delivers {type:event} messages to subscribed callbacks", () => {
    const host = new TopicHost();
    const a: unknown[] = [];
    const b: unknown[] = [];
    host.subscribe("keyword:batch:event", (p) => a.push(p));
    host.subscribe("keyword:batch:event", (p) => b.push(p));
    host.ingest({ type: "event", topic: "keyword:batch:event", payload: { phase: "batch-started" } });
    host.ingest({ type: "event", topic: "keyword:batch:event", payload: { phase: "progress" } });
    expect(a).toHaveLength(2);
    expect(b).toHaveLength(2);
  });

  it("delivers messages only to subscribers of the matching topic", () => {
    const host = new TopicHost();
    const matching: unknown[] = [];
    const other: unknown[] = [];
    host.subscribe("keyword:batch:event", (p) => matching.push(p));
    host.subscribe("other:topic", (p) => other.push(p));
    host.ingest({ type: "event", topic: "keyword:batch:event", payload: { x: 1 } });
    expect(matching).toHaveLength(1);
    expect(other).toHaveLength(0);
  });

  it("unsubscribe cleans up", () => {
    const host = new TopicHost();
    const seen: unknown[] = [];
    const unsub = host.subscribe("keyword:batch:event", (p) => seen.push(p));
    host.ingest({ type: "event", topic: "keyword:batch:event", payload: { x: 1 } });
    unsub();
    host.ingest({ type: "event", topic: "keyword:batch:event", payload: { x: 2 } });
    expect(seen).toHaveLength(1);
  });

  it("simulates main → renderer fan-out across multiple webContents", () => {
    const host = new TopicHost();
    const win1: unknown[] = [];
    const win2: unknown[] = [];
    const win3: unknown[] = [];
    // Main wires one subscriber that itself fans out:
    host.subscribe("keyword:batch:event", (payload) => {
      for (const w of [win1, win2, win3]) w.push(payload);
    });
    host.ingest({ type: "event", topic: "keyword:batch:event", payload: { phase: "batch-ended" } });
    expect(win1).toHaveLength(1);
    expect(win2).toHaveLength(1);
    expect(win3).toHaveLength(1);
  });
});
