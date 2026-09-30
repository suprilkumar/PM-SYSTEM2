// src/core/api/response.js
import { NextResponse } from "next/server";

export const ok = (data, init = {}) =>
  NextResponse.json(data, { status: 200, ...init });

export const created = (data) =>
  NextResponse.json(data, { status: 201 });

export const badRequest = (message = "Bad Request", details) =>
  NextResponse.json({ error: message, details }, { status: 400 });

export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export const notFound = () =>
  NextResponse.json({ error: "Not Found" }, { status: 404 });

export const serverError = (message = "Server Error") =>
  NextResponse.json({ error: message }, { status: 500 });

/**
 * Same as `ok()` but sends HTTP cache headers so the browser can reuse the
 * response briefly. Use ONLY on read-only GET endpoints — never on
 * mutations or endpoints that must reflect a just-completed write.
 */
export const okCached = (data, { seconds = 30 } = {}) =>
  NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": `private, max-age=${seconds}, stale-while-revalidate=${
        seconds * 2
      }`,
    },
  });