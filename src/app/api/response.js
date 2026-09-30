// src/core/api/response.js — add a helper
export const okCached = (data, { seconds = 30 } = {}) =>
  NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": `private, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`,
    },
  });