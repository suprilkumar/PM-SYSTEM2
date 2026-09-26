import { getCurrentUser } from "@/core/auth/session";
import { unauthorized, serverError } from "./response";

export function withAuth(handler) {
  return async (req, ctx = {}) => {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return unauthorized();
      return await handler(req, ctx, user);
    } catch (err) {
      console.error("[api]", err);
      return serverError(err.message);
    }
  };
}