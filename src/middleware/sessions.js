import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
import * as csrf from "./accessories/csrf.js";

const debug = Debug("app:Sessions");

const MAX_AGE = 60 * 60 * 1000; //3.600.000 ms - one hour

// 360.000 6 minuten
//1.800.000 ms - half hour
//900 000 ms - 15 minutes

export function getSession(ctx) {
  // const sessionKey = ctx.token.get("session-key") ?? "";
  ctx.sessionId = ctx.cookies.get("session-key") ?? undefined;
  ctx.session = ctx.sessionStore.get(ctx.sessionId, MAX_AGE) ?? {};

  // debug("@getSession.---------- ctx.cookies.get-------> %O  ", ctx.session);
  return ctx;
}

export function setSession(ctx) {
  if (typeof ctx.session === "object") {
    if (Object.values(ctx.session).find(Boolean)) {
      ctx.sessionId = ctx.sessionId ?? csrf.generateToken();

      const expireDate = new Date(Date.now() + MAX_AGE);

      ctx.cookies.set(ctx.token.get("session-key"), ctx.sessionId, {
        expires: expireDate,
        httpOnly: true,
        overwrite: true,
        sameSite: true,
      });

      ctx.sessionStore.set(ctx.sessionId, ctx.session, MAX_AGE);
    }
  } else {
    ctx.sessionStore.destroy(ctx.sessionId);

    ctx.cookies.delete(ctx.token.get("session-key"));
  }
  return ctx;
}

export const createSessionStore = (sessionStore) => {
  return {
    get(key) {
      const data = sessionStore.get(key);
      if (!data) return;
      //  debug("@createSessionStore. data-Time-> ", data.maxAge < Date.now());

      return data.maxAge < Date.now() ? this.destroy(key) : data.session;
    },
    set(key, session, maxAge) {
      sessionStore.set(key, {
        session,
        maxAge: Date.now() + maxAge,
      });
    },
    destroy(key) {
      sessionStore.delete(key);
    },
  };
};

export function deleteAllSessionsCookiesTokens(ctx) {
  const cookie = ctx.token.get("session-key");
  debug("@deleteAllSessionsCookiesTokens. cookie--->  %O", cookie);
  ctx.cookies.delete();

  const deleted = ctx.token.clear();
  debug("@deleteAllSessionsCookiesTokens. key deleted?--->  %O", deleted);
  debug("@deleteAllSessionsCookiesTokens. ctx.token MAP?--->  %O", ctx.token);

  debug(
    "@deleteAllSessionsCookiesTokens. ctx.ctx.sessionId --->  %O",
    ctx.sessionId,
  );
  ctx.sessionStore.destroy(ctx.sessionId);
  ctx.session = {};

  ctx.sessionId = undefined;
  return ctx;
}
