import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:profileController");
import * as valid from "../../middleware/accessories/validation.js";
import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import * as userModel from "./../models/userModel.js";
import * as assetModel from "./../models/assetModel.js";
import * as adminModel from "./../models/adminModel.js";
import * as commentModel from "./../models/commentModel.js";

import * as dataHandling from "../../middleware/accessories/dataHandling.js";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import * as csrf from "../../middleware/accessories/csrf.js";

////////////////////////!

export async function ownProfile(ctx) {
  debug("@profileController. ctx.request.url %O", ctx.request.url);
  const userAuth = ctx.state.authenticated;

  const self = true;
  const userid = ctx.session.user.id;

  const user = ctx.session.user;
  const flashText = ctx.session.flash;

  const pathToFile = ctx.session.user.avatar;
  const urlToFile = dataHandling.checkAvatarFile(pathToFile);
  const role = user.role;

  //////////////! All my assets
  const assetArray = assetModel.allAssetsByUserIdArray(
    ctx.db,
    ctx.session.user.id,
  );
  debug("@assetController. assetArray %O", assetArray);

  const objectAsset = dataHandling.createAssetObjectArray(assetArray);

  const datapathsArr = [];
  const idAssetArr = [];
  const sizeArr = [];
  const likesAssArr = [];
  const assNameArr = [];
  for (const row of assetArray) {
    datapathsArr.push(row[3]);
    idAssetArr.push(row[0]);
    sizeArr.push(row[2]);
    assNameArr.push(row[1]);
    likesAssArr.push(row[6]);
  }

  ctx.response.body = ctx.nunjucks.render("./profile.html", {
    user,
    userid,
    userAuth,
    flashText,
    pathToFile,
    role,
    urlToFile,
    self,
    objectAsset,
    datapathsArr,
    assNameArr,
    likesAssArr,
    sizeArr,
    idAssetArr,
  });

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

export async function profile(ctx) {
  // debug("@profileController. ctx.request.url %O", ctx.request.url);
  const userAuth = ctx.state.authenticated;

  let self = false;
  const userid = ctx.params.id;
  let role, admin;
  const user = userModel.getUserByIdDB(ctx.db, userid);
  if (user) {
    const pathToFile = user.avatar;
    const urlToFile = dataHandling.checkAvatarFile(pathToFile);

    if (
      ctx.session.user.role === "majoradmin" ||
      ctx.session.user.role === "admin"
    ) {
      admin = ctx.session.user.role;
      debug(
        "@profileOtherUser. ctx.session.user.role %O",
        ctx.session.user.role,
      );

      if (ctx.session.user.role === "majoradmin") {
        const token = csrf.generateToken();
        ctx.token.set("tokenRole", token);
      }
    }
    if (ctx.params.id == ctx.session.user.id) {
      self = true;
      // debug("@profile.self------------------->", self);

      role = ctx.session.user.role;
    } else {
      role = user.role;
    }
    //////////////! All my assets

    const assetArray = assetModel.allAssetsByUserIdArray(ctx.db, user.id);
    const objectAsset = dataHandling.createAssetObjectArray(assetArray);
    // const datapathsArr = dataHandling.createDatapathArray(assetArray);

    const datapathsArr = [];
    const idAssetArr = [];
    const sizeArr = [];
    const likesAssArr = [];
    const assNameArr = [];
    for (const row of assetArray) {
      datapathsArr.push(row[3]);
      idAssetArr.push(row[0]);
      sizeArr.push(row[2]);
      assNameArr.push(row[1]);
      likesAssArr.push(row[6]);
      // debug("@assetController. row[6] %O", row[6]);
    }
    ctx.response.body = ctx.nunjucks.render("./profile.html", {
      user,
      userid,
      userAuth,
      pathToFile,
      role,
      urlToFile,
      admin,
      self,
      objectAsset,
      datapathsArr,
      assNameArr,
      idAssetArr,
      likesAssArr,
      sizeArr,
    });

    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  }
  return ctx;
}
////////////////////////!

export async function profilePostRole(ctx) {
  // debug("@profileController. ctx.request.url %O", ctx.request.url);
  const userAuth = ctx.state.authenticated;
  let flashText;
  let self = false;
  const userid = ctx.params.id;
  let role, admin;
  const user = userModel.getUserByIdDB(ctx.db, userid);

  const pathToFile = user.avatar;
  const urlToFile = dataHandling.checkAvatarFile(pathToFile);

  if (
    ctx.session.user.role === "majoradmin" ||
    ctx.session.user.role === "admin"
  ) {
    admin = ctx.session.user.role;
    debug("@profileOtherUser. ctx.session.user.role %O", ctx.session.user.role);

    if (ctx.session.user.role === "majoradmin") {
      const formData = await ctx.request.formData();
      const data = {
        _csrf: formData.get("_csrf"),
      };
      csrf.checkToken(ctx, "tokenRole", data._csrf, `/`);

      if (role === "majoradmin") {
        adminModel.updateRoleDB(ctx.db, "user", user.id);
        role = "user";
      } else if (role === "user") {
        adminModel.updateRoleDB(ctx.db, "admin", user.id);
        role = "admin";
      }
    }
  }
  if (ctx.params.id == ctx.session.user.id) {
    self = true;
    role = ctx.session.user.role;
  } else {
    role = user.role;
  }
  //////////////! All my assets

  const assetArray = assetModel.allAssetsByUserIdArray(ctx.db, user.id);
  const objectAsset = dataHandling.createAssetObjectArray(assetArray);
  // const datapathsArr = dataHandling.createDatapathArray(assetArray);

  const datapathsArr = [];
  const idAssetArr = [];
  const sizeArr = [];
  const likesAssArr = [];
  const assNameArr = [];
  for (const row of assetArray) {
    datapathsArr.push(row[3]);
    idAssetArr.push(row[0]);
    sizeArr.push(row[2]);
    assNameArr.push(row[1]);
    likesAssArr.push(row[6]);
  }
  ctx.response.body = ctx.nunjucks.render("./profile.html", {
    user,
    userid,
    userAuth,
    pathToFile,
    role,
    urlToFile,
    admin,
    self,
    objectAsset,
    datapathsArr,
    assNameArr,
    idAssetArr,
    likesAssArr,
    sizeArr,
  });

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}
export async function profileEditAdd(ctx) {
  const userAuth = ctx.state.authenticated;

  const token = csrf.generateToken();
  ctx.token.set("tokenEditProfile", token);

  const pathToFile = ctx.session.user.avatar;
  const urlToFile = dataHandling.checkAvatarFile(pathToFile);

  const data = {
    file: userModel.getAvatarPathByIdDB(ctx.db, ctx.session.user.id),
    username: ctx.session.user.username,
    biography: ctx.session.user.biography,
    location: ctx.session.user.location,
    website: ctx.session.user.website,
    id: ctx.session.user.id,
    csrf: token,
  };

  debug("@profileAdd.  --userAuth--> %O", data.file);

  ctx.response.body = ctx.nunjucks.render("./editProfile.html", {
    userAuth,
    pathToFile,
    urlToFile,
    data,
  });

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

////////////////////////!

export async function profileEditSubmit(ctx) {
  const userAuth = ctx.state.authenticated;

  const formData = await ctx.request.formData();

  const data = {
    file: formData.get("uploadProfileImage"),
    username: formData.get("username"),
    biography: formData.get("biography"),
    location: formData.get("location"),
    website: formData.get("website"),
    password: formData.get("password"),
    password_again: formData.get("password_again"),
    _csrf: formData.get("_csrf"),
  };

  csrf.checkToken(
    ctx,
    "tokenEditProfile",
    data._csrf,
    `/profile/${ctx.session.user.id}`,
  );

  const pathToFile = ctx.session.user.avatar;
  const urlToFile = dataHandling.checkAvatarFile(pathToFile);

  let errorsImage = {};
  if (data.file) {
    errorsImage = await valid.validateImageUpload(data.file);
    const user = userModel.getUserByIdDB(ctx.db, ctx.session.user.id);

    dataHandling.removeDataFromDirectory(user.avatar);
    debug("@profileEditSubmit(ctx). errorsImage --->", errorsImage);
  }
  const userNameEqual = userModel.allUsernamesArray(
    ctx.db,
    formData.get("username"),
  );
  debug("@submitAddReg ---userNameEqual.length > 0-->", userNameEqual);
  const errorsForm = await valid.validateProfileUpdate(
    ctx,
    data,
    userNameEqual,
  );
  if (
    Object.values(errorsImage).length > 0 ||
    Object.values(errorsForm).length > 0
  ) {
    debug("@profileEditSubmit.  --errorsImage--> %O", errorsImage);
    debug("@profileEditSubmit.  --errorsForm--> %O", errorsForm);

    ctx.response.body = ctx.nunjucks.render("editProfile.html", {
      userAuth,
      data,
      errorsForm: errorsForm,
      errorsImage: errorsImage,
      pathToFile,
      urlToFile,
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  } else if (data.file) {
    const filename = dataHandling.generateFilename(data.file, "upload");
    const destFile = await Deno.open(
      path.join(Deno.cwd(), "public", filename),
      {
        create: true,
        write: true,
        truncate: true,
      },
    );
    const upload = data.file;
    await upload.stream().pipeTo(destFile.writable);

    debug("@profileEditSubmit.  --filename--> %O", filename);

    userModel.updateFileDB(ctx.db, filename, ctx.session.user.id);
  }

  const hash = await bcrypt.hash(formData.get("password"));
  debug("@profileEditSubmit(ctx). %O password Hash --->", hash);
  data.password = hash;

  userModel.updateUsersProfileDB(ctx.db, data, ctx.session.user.id);
  assetModel.updateUsernameDB(ctx.db, data.username, ctx.session.user.id);
  commentModel.updateCommentsDB(ctx.db, data.username, ctx.session.user.id);

  ctx.session.user = userModel.getByUsernameDB(ctx.db, data.username);

  ctx.redirect = Response.redirect(
    ctx.url.origin + `/profile/${ctx.session.user.id}`,
    303,
  );

  return ctx;
}
