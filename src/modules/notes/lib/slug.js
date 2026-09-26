// src/modules/notes/lib/slug.js
import { nanoid } from "nanoid";
export const generateSlug = () => nanoid(12);