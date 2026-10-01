// src/core/utils/events.js
"use client";

/**
 * Lightweight cross-component event bus.
 * Use sparingly — prefer props/context for short-range communication.
 */
const listeners = new Map();

export function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  for (const fn of set) fn(payload);
}

export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => listeners.get(event)?.delete(handler);
}