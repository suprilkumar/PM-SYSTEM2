// src/core/api/vault-handler.js
import { getCurrentUser } from "@/core/auth/session";
import { isVaultVerified } from "@/core/auth/vault-session";
import { unauthorized, serverError } from "./response";

export function withVault(handler) {
  return async (req, ctx = {}) => {
    try {
      console.log("[withVault] incoming:", req.method, req.nextUrl?.pathname);

      const user = await getCurrentUser();
      if (!user?.id) {
        console.log("[withVault] NO USER");
        return unauthorized("Not signed in");
      }

      console.log("[withVault] user:", user.id);

      const verified = await isVaultVerified(user.id);
      if (!verified) {
        console.log("[withVault] NOT VERIFIED — returning 401");
        return unauthorized("Vault locked");
      }

      console.log("[withVault] verified — calling handler");
      return await handler(req, ctx, user);
    } catch (err) {
      console.error("[vault-api] ERROR:", err);
      return serverError(err.message);
    }
  };
}