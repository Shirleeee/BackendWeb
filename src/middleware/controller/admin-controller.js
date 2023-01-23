import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:adminController");
import * as userModel from "./../models/userModel.js";
import * as adminModel from "./../models/adminModel.js";
import * as csrf from "../../middleware/accessories/csrf.js";
import * as dataHandling from "../../middleware/accessories/dataHandling.js";

////////////////////////!
export async function submitRoleToUser(ctx) {
  const user = userModel.getUserByIdDB(ctx.db, Number(ctx.params.id));
  if (ctx.session.user.role == "majoradmin") {
    const formData = await ctx.request.formData();

    const dataRole = {
      changeRole: formData.get("changeRole"),
      _csrf: formData.get("_csrf"),
    };

    csrf.checkToken(ctx, "tokenRole", dataRole._csrf, `/profile/${user.id}`);

    user.role = dataRole.changeRole;
    adminModel.updateRoleDB(ctx.db, user.role, user.id);
    debug("@submitRoleToUser.  --  user.role--> %O", user.role);
    debug("@submitRoleToUser.  --data--> %O", dataRole);
  }

  ctx.response.status = 303;
  ctx.response.headers["location"] = ctx.url.origin + `/profile/${user.id}`;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}
//////////////////////! Delete USer

export async function showDeleteUser(ctx) {
  const user = userModel.getUserByIdDB(ctx.db, Number(ctx.params.id));
  let flashText;
  const userAuth = ctx.state.authenticated;
  let deleteUser;
  const role = ctx.session.user.role;
  if (
    ctx.session.user.role == "admin" ||
    ctx.session.user.role == "majoradmin"
  ) {
    flashText = `You really wanna delete ${user.username}?`;
    deleteUser = true;
  }

  if (user.id == ctx.session.user.id) {
    deleteUser = true;
    flashText = `You really wanna delete yourself ?`;
  }
  debug("@showDeleteUser... user --->", user);

  ctx.response.body = ctx.nunjucks.render("reallyDelete.html", {
    user,
    userAuth,
    flashText,
    deleteUser,
    role,
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

export async function submitDeleteUser(ctx) {
  const userAuth = ctx.state.authenticated;
  const user = userModel.getUserByIdDB(ctx.db, Number(ctx.params.id));
  let flashText;
  let deleteUser = false;
  const role = ctx.session.user.role;

  debug("@submitDeleteUser...user.role --->", user);

  if (user.id == ctx.session.user.id) {
    deleteUser = true;

    dataHandling.deleteEverythingFromEverywhere(ctx, user);

    ctx.redirect = Response.redirect(ctx.url.origin + "/", 303);
    return ctx;
  }

  if (user.role == "majoradmin") {
    deleteUser = true;
    debug("@submitDeleteUser...user.role --->", user.role);
    flashText = ` ${user.username}?  You cannot delete a  ${user.role}`;
    ctx.response.body = ctx.nunjucks.render("reallyDelete.html", {
      user,
      userAuth,
      flashText,
      deleteUser,
      role,
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }
  if (
    ctx.session.user.role == "admin" ||
    ctx.session.user.role == "majoradmin"
  ) {
    deleteUser = true;
    dataHandling.deleteEverythingFromEverywhere(ctx, user);

    ctx.redirect = Response.redirect(ctx.url.origin + "/", 303);
    return ctx;
  }

  return ctx;
}
