// src/core/config/site.js
export const SITE = {
  name: "Personal Suite",
  tagline: "Your notes, finance, fitness — one private workspace",
  description:
    "A privacy-first productivity suite. Notes, finance tracking, and fitness analytics — all in one place, all yours alone.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  email: "hello@personalsuite.app",
};