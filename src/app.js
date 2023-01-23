import {
  CookieMap,
  mergeHeaders,
} from "https://deno.land/std@0.167.0/http/mod.ts";
import * as mainController from "./middleware/controller/main-controller.js";
import * as routes from "./router.js";
import * as saveFiles from "./middleware/accessories/serveFiles.js";
import * as authen from "./middleware/accessories/authentication.js";
import * as sessionsControl from "./middleware/sessions.js";

import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:app");
import nunjucks from "https://deno.land/x/nunjucks@3.2.3/mod.js";
nunjucks.configure("templates", {
  autoescape: true,
  noCache: true,
});

import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
const db = new DB("./data/wwwUsers.db");

const sessionStore = new Map();
const tokenMap = new Map();

export const handleRequest = async (request) => {
  // debug("@handleRequest. request %O", request);
  const ctx = {
    db: db,
    sessionStore: sessionsControl.createSessionStore(sessionStore),
    cookies: new CookieMap(request),
    token: tokenMap,
    state: { authenticated: false },
    session: {},
    request: request,
    url: new URL(request.url),
    params: {},
    redirect: undefined,
    response: {
      headers: {},
      body: undefined,
      status: undefined,
    },
    nunjucks: nunjucks,
  };

  const middleware = [
    sessionsControl.getSession,
    authen.isAuthenticated,
    saveFiles.serveStaticFile("public"),
    routes.routes,
    sessionsControl.setSession,
  ];

  // debug(
  //   "@handleRequest.>>>>>>  %O   ",
  //   `>>> ${ctx.request.method} ${ctx.url.pathname}${ctx.url.search}`,
  // );

  const pipeAsync = (...funcs) => (ctx) =>
    funcs.reduce(async (state, func) => func(await state), ctx);

  let result = await pipeAsync(...middleware)(ctx);

  if (result.redirect) {
    return result.redirect;
  }

  // Fallback
  result.response.status = result.response.status ?? 404;
  if (!result.response.body && result.response.status == 404) {
    result = await mainController.error(result);
  }
  // debug("@handleRequest. result ----> %O", result);

  const allHeaders = mergeHeaders(result.response.headers, result.cookies);
  result.response.headers["Set-cookie"] = allHeaders.get("set-cookie");

  // debug("@getSession.----------   allHeaders----> %O  ", allHeaders);
  return new Response(result.response.body, {
    status: result.response.status,
    headers: result.response.headers,
  });
};
