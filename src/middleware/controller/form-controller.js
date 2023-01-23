import * as userModel from "../models/userModel.js";
import * as assetModel from "./../models/assetModel.js";
import * as fileHandler from "../../middleware/accessories/dataHandling.js";

import * as commentModel from "./../models/commentModel.js";
import * as valid from "../../middleware/accessories/validation.js";
import * as faker from "../../middleware/accessories/faker.js";
import * as csrf from "../../middleware/accessories/csrf.js";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
import * as likesModel from "./../models/likesModel.js";
const debug = Debug("app:formController");

export async function addReg(ctx) {
  const token = csrf.generateToken();
  ctx.token.set("tokenReg", token);
  const userAuth = ctx.state.authenticated;
  const flashText = ctx.session.flash;
  if (!userAuth) {
    ctx.response.body = ctx.nunjucks.render("regForm.html", {
      flashText,
      form: {
        username: faker.createRandomUser().username,
        avatar: faker.createRandomUser().avatar,
        firstName: faker.createRandomUser().firstName,
        lastName: faker.createRandomUser().lastName,
        email: faker.createRandomUser().email,
        _csrf: token,
      },
    });

    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/";
  }

  return ctx;
}

export async function submitAddReg(ctx) {
  const formData = await ctx.request.formData();

  const data = {
    userName: formData.get("username"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    avatar: formData.get("avatar"),
    email: formData.get("email"),
    password: formData.get("password"),
    password_again: formData.get("password_again"),
    _csrf: formData.get("_csrf"),
  };

  csrf.checkToken(ctx, "tokenReg", data._csrf, "/register");

  const userNameEqual = userModel.allUsernamesArray(
    ctx.db,
    formData.get("username"),
  );

  const errors = await valid.validateReg(data, userNameEqual);

  if (Object.values(errors).length > 0) {
    ctx.response.body = ctx.nunjucks.render("regForm.html", {
      form: data,
      errors: errors,
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  } else {
    const hash = await bcrypt.hash(formData.get("password"));
    debug("@submitAddReg(ctx). %O password Hash --->", hash);
    data.password = hash;
    userModel.addToDB(ctx.db, data);
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/login";
  }
  return ctx;
}
/////////////////////////////////////////////////////

export async function addLogin(ctx) {
  const userAuth = ctx.state.authenticated;
  const flashText = ctx.session.flash;
  if (!userAuth) {
    const token = csrf.generateToken();
    ctx.token.set("tokenLog", token);
    // debug("@addLogin(ctx). %O ctx.token --->", token);

    ctx.response.body = await ctx.nunjucks.render("loginForm.html", {
      form: { _csrf: token },
      flashText,
    });

    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/";
  }
  return ctx;
}

export async function submitCheckLogin(ctx) {
  const formData = await ctx.request.formData();

  const dataForm = {
    username: formData.get("username"),
    password: formData.get("password"),
    _csrf: formData.get("_csrf"),
  };

  csrf.checkToken(ctx, "tokenLog", dataForm._csrf, "/login");

  const user = userModel.getByUsernameDB(ctx.db, dataForm.username);

  if ((await valid.passwordIsCorrect(user, dataForm.password)) === true) {
    user.password = undefined;
    debug("@submitCheckLogin(ctx). %O user --->", user);
    ctx.token.set("session-key", csrf.generateToken());
    ctx.session.user = user;
    ctx.session.flash = `Hello ${user.firstName}!! You are logged in.`;
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin +
      `/ownProfile/${user.id}`;
  } else {
    ctx.response.body = ctx.nunjucks.render("loginForm.html", {
      form: dataForm,
      errors: { login: " That password is not valid. Please try again!" },
    });

    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  }
  return ctx;
}

//////////////////////////////////////////////////////! Get Likes display comments

export async function showComment(ctx) {
  const token = csrf.generateToken();
  ctx.token.set("LikeToken", token);

  let role;
  let username;
  const userAuth = ctx.state.authenticated;
  if (userAuth) {
    role = ctx.session.user.role;
    username = ctx.session.user.username;
  }

  const model = assetModel.getOneAssetByIdDB(ctx.db, ctx.params.id);
  const commentsArr = commentModel.getallCommentsArrByAssetIdDB(
    ctx.db,
    ctx.params.id,
  );

  const comments = fileHandler.createCommentObjectArray(commentsArr);

  ctx.response.body = ctx.nunjucks.render("commentAsset.html", {
    comments,
    username,
    userAuth,
    model,
    role,
    form: { _csrf: token },
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

export async function submitLikesComment(ctx) {
  const userAuth = ctx.state.authenticated;
  const formData = await ctx.request.formData();

  debug("@submitAddComment(ctx).formData --->", formData);

  if (userAuth) {
    const data = {
      text: formData.get("text"),
      _csrf: formData.get("_csrf"),
    };
    csrf.checkToken(
      ctx,
      "LikeToken",
      data._csrf,
      `/getComments/${ctx.params.id}`,
    );
    let assetId = likesModel.getAssetIdByUserIdDB(
      ctx.db,
      ctx.session.user.id,
      ctx.params.id,
    );
    debug("@submitAddComment(ctx).assetId --->", assetId);
    //////////////////////////////!
    if (assetId == undefined) {
      assetId = { assetId: 0 };
    }
    if (assetId.assetId != ctx.params.id) {
      let likesFormButton = { likes: formData.get("value") };
      if (likesFormButton.likes == null) likesFormButton.likes = 1;
      let likesFromDB = assetModel.getLikesByIdDB(ctx.db, ctx.params.id);
      if (likesFromDB.likes == null) likesFromDB.likes = 0;
      let countedLikes = likesFormButton.likes + likesFromDB.likes;
      assetModel.updateLikesDB(ctx.db, countedLikes, ctx.params.id);
      const likeobj = { userId: ctx.session.user.id, assetId: ctx.params.id };
      likesModel.addAlreadyLikedToDB(ctx.db, likeobj);
    }
  }

  ctx.response.status = 303;
  ctx.response.headers["location"] = ctx.url.origin +
    `/getComments/${ctx.params.id}`;
  return ctx;
}

//////////////////////!Write Comments

export async function addWriteComment(ctx) {
  const token = csrf.generateToken();
  ctx.token.set("CommentToken", token);

  let role;
  const userAuth = ctx.state.authenticated;
  if (userAuth) {
    role = ctx.session.user.role;
  }

  debug("@addComment(ctx).role --->", ctx.params);

  const model = assetModel.getOneAssetByIdDB(ctx.db, Number(ctx.params.id));

  const commentsArr = commentModel.getallCommentsArrByAssetIdDB(
    ctx.db,
    Number(ctx.params.id),
  );
  const comments = fileHandler.createCommentObjectArray(commentsArr);

  let username;
  if (userAuth) username = ctx.session.user.username;

  ctx.response.body = ctx.nunjucks.render("writeComment.html", {
    comments,
    username,
    userAuth,
    model,
    role,
    form: { _csrf: token },
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

export async function submitAddWriteComment(ctx) {
  // let userAuth = ctx.state.authenticated;
  const formData = await ctx.request.formData();

  debug("@submitAddComment(ctx).formData --->", formData);
  const data = {
    text: formData.get("text"),
    _csrf: formData.get("_csrf"),
  };
  csrf.checkToken(
    ctx,
    "CommentToken",
    data._csrf,
    `/getComments/${ctx.params.id}`,
  );

  const errors = valid.validateComment(data);

  if (Object.values(errors).length > 0) {
    ctx.response.body = ctx.nunjucks.render("writeComment.html", {
      form: formData,
      errors: errors,
    });

    debug("@submitAddComment(ctx).  errors --->", errors);
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }
  if (ctx.session.user) {
    const commentData = {
      userId: ctx.session.user.id,
      commentText: data.text,
      releasedDate: new Date(),
      assetId: ctx.params.id,
      author: ctx.session.user.username,
    };

    commentModel.addCommentToDB(ctx.db, commentData);
  }

  ctx.response.status = 303;
  ctx.response.headers["location"] = ctx.url.origin +
    `/getComments/${ctx.params.id}`;
  return ctx;
}
////////////////////////////////!
export async function showDeleteEntryComment(ctx) {
  const comment = commentModel.getCommentByIdDB(ctx.db, Number(ctx.params.id));
  const flashext = "You really wanna delete this comment?";
  const deleteComment = true;
  const userAuth = ctx.state.authenticated;
  debug("@showDeleteEntryComment... ctx.params.id --->", comment);

  ctx.response.body = ctx.nunjucks.render("reallyDelete.html", {
    comment,
    userAuth,
    flashext,
    deleteComment,
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

export async function submitDeleteEntryComment(ctx) {
  const comment = commentModel.getCommentByIdDB(ctx.db, Number(ctx.params.id));

  debug("@submitDeleteEntryComment. comment %O", comment);
  commentModel.deleteCommentsFromDB(ctx.db, ctx.params.id);
  ctx.redirect = Response.redirect(
    ctx.url.origin + `/getComments/${comment.assetId}`,
    303,
  );

  return ctx;
}
