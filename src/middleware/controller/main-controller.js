import * as userModel from "./../models/userModel.js";
import * as assetModel from "./../models/assetModel.js";

import * as sessions from "../sessions.js";
import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:main-controller");

export async function indexController(ctx) {
  debug(
    "@indexController. ctx.state.authenticated ??? -->%O",
    ctx.state.authenticated,
  );
  const userAuth = ctx.state.authenticated;
  let user;
  let text = { flashText: "", loginText: "", signInText: "" };
  const userid = ctx.params.id;

  if (userAuth) {
    const activeSessionUser = userModel.getUserByIdDB(ctx.db, userid);
    user = activeSessionUser;
    text.flashText = "Hellooo " + ctx.session.flash;
  } else {
    text.loginText = "Please login or register for free to see more!";
    text.signInText = "Sign in!";
  }

  const allAssets = assetModel.allAssetsArray(ctx.db);
  allAssets.reverse();

  const datapathsArr = [];
  const nameArr = [];
  const assNameArr = [];
  const idProfileArr = [];
  const idAssetArr = [];

  for (const row of allAssets) {
    datapathsArr.push(row.datapath);
    nameArr.push(row.username);
    assNameArr.push(row.name);
    idProfileArr.push(row.userId);
    idAssetArr.push(row.id);
    // debug("@indexController. assets row of allAssets-->  %O", row);
  }

  ctx.response.body = ctx.nunjucks.render("index.html", {
    datapathsArr,
    allAssets,
    nameArr,
    idAssetArr,
    assNameArr,
    userAuth,
    user,
    userid,
    idProfileArr,
    text,
  });

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}
////////////////////////////////////////////////////////

export async function logOut(ctx) {
  sessions.deleteAllSessionsCookiesTokens(ctx);
  ctx.redirect = Response.redirect(ctx.url.origin + "/", 303);

  return ctx;
}

///////////////////////////////////////////////

export function error(ctx) {
  debug("@error404. ctx.request.url %O", ctx.request.url);
  ctx.response.body = ctx.nunjucks.render("error.html", {});
  ctx.response.status = 404;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}
///////////////////////////////////////////////

export async function aboutController(ctx) {
  debug("@about. ctx.request.url %O", ctx.request.url);
  ctx.response.body = ctx.nunjucks.render("about.html", {});

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}

export function docuController(ctx) {
  ctx.response.body = ctx.nunjucks.render("documentation.html", {});

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}
export function kollophoneController(ctx) {
  ctx.response.body = ctx.nunjucks.render("kollophone.html", {});

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}
export function impressumController(ctx) {
  ctx.response.body = ctx.nunjucks.render("impressum.html", {});

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}

export function notAllowed(ctx) {
  ctx.response.body = ctx.nunjucks.render("notAuthorized.html", {});

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}
