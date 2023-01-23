import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:authentification");

export const isAuthenticated = async (ctx) => {
  const getKey = ctx.token.get("session-key") ?? "";

  const sessionIdOfLoginKey = ctx.cookies.get(getKey) ?? undefined;
  ctx.session = ctx.sessionStore.get(sessionIdOfLoginKey) ?? {};

  if (sessionIdOfLoginKey == undefined) {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + `/`;
    // debug(
    //   "@isAuthenticated.    authenticated? must be true ? ---> %O",
    //   ctx.state.authenticated,
    // );
    ctx.state.authenticated = false;
    return ctx;
  }

  ctx.state.authenticated = true;

  return ctx;
};
