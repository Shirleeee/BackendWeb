import * as profileController from "./middleware/controller/profile-controller.js";
import * as mainController from "./middleware/controller/main-controller.js";
import * as formController from "./middleware/controller/form-controller.js";
import * as assetController from "./middleware/controller/asset-controller.js";
import * as adminController from "./middleware/controller/admin-controller.js";
import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:router");

export function routes(ctx) {
  // debug("@routes. REquest URL--------------> %O", ctx.request.url);
  if (ctx.url.pathname == "/docu") {
    return mainController.docuController(ctx);
  }

  if (ctx.url.pathname == "/kollophone") {
    return mainController.kollophoneController(ctx);
  }
  if (ctx.url.pathname == "/impressum") {
    return mainController.impressumController(ctx);
  }

  if (ctx.url.pathname == "/about/") {
    debug("@routes. AboutRoute %O", ctx.sessionsKeys);
    return mainController.aboutController(ctx);
  }

  if (ctx.url.pathname == "/" && ctx.request.method == "GET") {
    debug(
      "@routes. index Route --ctx.request.status--> %O",
      ctx.request.status,
    );
    return mainController.indexController(ctx);
  }

  if (ctx.url.pathname.match(/\/logout\/(.*)/)) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/logout\/(.*)/);
      ctx.params.id = matches[1];
      console.log(matches);

      return mainController.logOut(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }

  ////////////////////////////////////////!

  if (ctx.url.pathname == "/login" && ctx.request.method == "GET") {
    debug("/addlogin. GET --->", ctx.token);
    return formController.addLogin(ctx);
  }
  if (ctx.url.pathname == "/login" && ctx.request.method == "POST") {
    debug("submitchrcklogin. POST --->", ctx.token);

    return formController.submitCheckLogin(ctx);
  }
  if (ctx.url.pathname == "/register" && ctx.request.method == "POST") {
    debug("register. POST  ctx.token--->", ctx.token);
    return formController.submitAddReg(ctx);
  }
  if (ctx.url.pathname == "/register" && ctx.request.method == "GET") {
    debug("register. GET  ctx.token--->", ctx.token);
    return formController.addReg(ctx);
  }
  //////////////////////////////!n User

  if (ctx.url.pathname.match(/\/ownProfile\/(.*)/)) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/ownProfile\/(.*)/);
      ctx.params.id = matches[1];
      console.log(matches);

      return profileController.ownProfile(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (
    ctx.url.pathname.match(/\/profile\/(.*)/) &&
    ctx.request.method == "GET"
  ) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/profile\/(.*)/);
      ctx.params.id = matches[1];
      console.log(matches);

      return profileController.profile(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (
    ctx.url.pathname.match(/\/profile\/(.*)/) &&
    ctx.request.method == "POST"
  ) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/profile\/(.*)/);
      ctx.params.id = matches[1];
      console.log(matches);

      return profileController.profilePostRole(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (
    ctx.url.pathname.match(/\/editProfile\/(.*)/) &&
    ctx.request.method == "GET"
  ) {
    if (ctx.session.user) {
      debug("@routes.editProfile GET +token%O", ctx.token);
      const matches = ctx.url.pathname.match(/\/editProfile\/(.*)/);
      ctx.params.id = matches[1];
      return profileController.profileEditAdd(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (
    ctx.url.pathname.match(/\/editProfile\/(.*)/) &&
    ctx.request.method == "POST"
  ) {
    if (ctx.session.user) {
      debug("@routes.editProfile POST +token%O", ctx.token);
      const matches = ctx.url.pathname.match(/\/editProfile\/(.*)/);

      ctx.params.id = matches[1];
      return profileController.profileEditSubmit(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  ////////////////////////////////! assets

  if (ctx.url.pathname == "/addAssets" && ctx.request.method == "GET") {
    if (ctx.session.user) {
      debug("@routes.ctx.token GET %O", ctx.token);

      return assetController.addAssets(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (ctx.url.pathname == "/previewAsset" && ctx.request.method == "GET") {
    if (ctx.session.user) {
      return assetController.previewAsset(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (ctx.url.pathname == "/addAssets" && ctx.request.method == "POST") {
    if (ctx.session.user) {
      debug("@routes.addAssets POST %O", ctx.url.pathname);

      return assetController.submitAddAssets(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }

  if (
    ctx.url.pathname.match(/\/detailAsset\/.*/) &&
    ctx.request.method == "GET"
  ) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/detailAsset\/(.*)/);
      ctx.params.id = matches[1];
      return assetController.showDetailAsset(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (
    ctx.url.pathname.match(/\/detailAsset\/.*/) &&
    ctx.request.method == "POST"
  ) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/detailAsset\/(.*)/);
      ctx.params.id = matches[1];
      return assetController.showDetailAsset(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (
    ctx.url.pathname.match(/\/reallyDelete\/.*/) &&
    ctx.request.method == "GET"
  ) {
    if (ctx.session.user) {
      debug("@routes. reallyDelete %O", ctx.params.id);
      const matches = ctx.url.pathname.match(/\/reallyDelete\/(.*)/);
      ctx.params.id = matches[1];
      return assetController.addDeleteAsset(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (
    ctx.url.pathname.match(/\/reallyDelete\/.*/) &&
    ctx.request.method == "POST"
  ) {
    if (ctx.session.user) {
      debug("@routes. finallyDelete? %O", ctx.params.id);
      debug("@routes. POST??---> %O", ctx.request.method);
      const matches = ctx.url.pathname.match(/\/reallyDelete\/(.*)/);
      ctx.params.id = matches[1];
      return assetController.submitDeleteAsset(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (ctx.url.pathname.match(/\/download\/.*/)) {
    if (ctx.session.user) {
      debug("@routes. download? %O", ctx.params.id);
      debug("@routes. POST??---> %O", ctx.request.method);
      const matches = ctx.url.pathname.match(/\/download\/(.*)/);
      ctx.params.id = matches[1];
      return assetController.downloadAsset(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  //////////////////////////! comments

  if (
    ctx.url.pathname.match(/\/getComments\/.*/) &&
    ctx.request.method == "GET"
  ) {
    const matches = ctx.url.pathname.match(/\/getComments\/(.*)/);
    ctx.params.id = matches[1];
    debug("@routes.---.matches GET %O", matches);
    return formController.showComment(ctx);
  }
  if (
    ctx.url.pathname.match(/\/getComments\/.*/) &&
    ctx.request.method == "POST"
  ) {
    debug("@routes.ctx.token GET %O", ctx.token);
    const matches = ctx.url.pathname.match(/\/getComments\/(.*)/);
    ctx.params.id = matches[1];
    return formController.submitLikesComment(ctx);
  }
  if (
    ctx.url.pathname.match(/\/writeComments\/.*/) &&
    ctx.request.method == "GET"
  ) {
    const matches = ctx.url.pathname.match(/\/writeComments\/(.*)/);
    ctx.params.id = matches[1];
    debug("@routes.---.matches GET %O", matches);
    return formController.addWriteComment(ctx);
  }
  if (
    ctx.url.pathname.match(/\/writeComments\/.*/) &&
    ctx.request.method == "POST"
  ) {
    if (ctx.session.user) {
      debug("@routes.ctx.token GET %O", ctx.token);
      const matches = ctx.url.pathname.match(/\/writeComments\/(.*)/);
      ctx.params.id = matches[1];
      return formController.submitAddWriteComment(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (
    ctx.url.pathname.match(/\/deleteComment\/.*/) &&
    ctx.request.method == "GET"
  ) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/deleteComment\/(.*)/);
      ctx.params.id = matches[1];
      return formController.showDeleteEntryComment(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }

  if (
    ctx.url.pathname.match(/\/deleteComment\/.*/) &&
    ctx.request.method == "POST"
  ) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/deleteComment\/(.*)/);
      ctx.params.id = matches[1];
      return formController.submitDeleteEntryComment(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }

  //////////////////////////! admin
  if (
    ctx.url.pathname.match(/\/deleteUser\/.*/) &&
    ctx.request.method == "GET"
  ) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/deleteUser\/(.*)/);
      ctx.params.id = matches[1];
      return adminController.showDeleteUser(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }
  if (
    ctx.url.pathname.match(/\/deleteUser\/.*/) &&
    ctx.request.method == "POST"
  ) {
    debug(
      "@routes. P ctx.session.user.id == ctx.params.id---> %O",
      ctx.session.user.id == ctx.params.id,
    );
    if (
      (ctx.session.user && ctx.session.user.role == "majoradmin") ||
      (ctx.session.user && ctx.session.user.role == "admin") ||
      ctx.session.user
    ) {
      debug("@routes. P ctx.session.user.id---> %O", ctx.session.user.id);
      debug("@routes. P ctx.session.user.id---> %O", ctx.params.id);

      const matches = ctx.url.pathname.match(/\/deleteUser\/(.*)/);
      ctx.params.id = matches[1];
      return adminController.submitDeleteUser(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }

  if (
    ctx.url.pathname.match(/\/changeRole\/.*/) &&
    ctx.request.method == "POST"
  ) {
    if (ctx.session.user && ctx.session.user.role == "majoradmin") {
      const matches = ctx.url.pathname.match(/\/changeRole\/(.*)/);
      ctx.params.id = matches[1];
      return adminController.submitRoleToUser(ctx);
    } else {
      return mainController.notAllowed(ctx);
    }
  }

  return ctx;
}
