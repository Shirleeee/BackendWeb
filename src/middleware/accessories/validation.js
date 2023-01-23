import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
const debug = Debug("app:validation");
import * as userModel from "./../models/userModel.js";

const isValidText = (text) => text.length >= 1 && text.length <= 30;
const isValidZeroText = (text) => text.length >= 0 && text.length <= 70;

const isValidBioText = (text) => text.length >= 0 && text.length <= 600;
const isMimetypeOk = (type) => {
  if (type == "image/bmp" || "image/jpeg" || "image/png") return true;
};
const isExtensionOkImages = (name) => {
  const checkextension = name.split(".");
  debug("@isExtensionOk --checkextension->", checkextension);
  if (
    checkextension[1] == "jpg" ||
    checkextension[1] == "png" ||
    checkextension[1] == "bmp"
  ) {
    debug("@isExtensionOk --checkextension->", checkextension[1]);
    return false;
  }
};
const isExtensionOkAssets = (name) => {
  debug("@isExtensionOk --checkextension->", typeof name);

  if (typeof name === "string") {
    const checkextension = name.split(".");
    debug("@isExtensionOk --checkextension->", checkextension[1]);
    if (checkextension[1] == "gltf" || checkextension[1] == "glb") {
      return true;
    } else {
      debug("@isExtensionOk --true->");
      return false;
    }
  }
};
const isMimetypeAssetOk = (type) => {
  debug("@isMimetypeAssetOk --type->", type);

  if (type == "model/gltf") return true;
  else return false;
};
///////////////////////////////////////////////////////
export const validateReg = async (formData, userNAmeArr) => {
  let errors = {};
  //
  if (!isValidText(formData.userName)) errors.userName = "Thats Wrong";
  if (!isValidEmail(formData.email)) errors.email = "Thats is not an E-Mail!!";
  if (!isValidText(formData.firstName)) errors.firstName = "Thats Wrong";
  if (!isValidText(formData.lastName)) errors.lastName = "Thats Wrong";
  if (!isValidText(formData.password)) errors.password = "Thats Wrong";
  if (!(formData.password_again === formData.password)) {
    debug("@validateReg --->", formData.password_again);
    debug("@validateReg --->", formData.password);
    errors.password = "They are not the same";
  }
  if (userNAmeArr.length > 0) {
    debug("@validateReg ---userNameEqual.length > 0-->", userNAmeArr);
    errors.userName = "Please choose another Username. It is already taken.";
  }
  return errors;
};

export const validateProfileUpdate = async (ctx, formData, userNAmeArr) => {
  let errors = new Object();

  if (!isValidText(formData.username)) {
    errors.username = "At least one character!";
  }
  if (!isValidZeroText(formData.location)) {
    errors.location = "Too many characters!";
  }
  if (!isValidBioText(formData.biography)) {
    errors.biography = "Too many characters!";
  }
  if (!isValidBioText(formData.website)) {
    errors.website = "Too many characters!";
  }
  if (!isValidText(formData.password)) errors.password = "Thats Wrong";
  if (!(formData.password_again === formData.password)) {
    debug("@validateReg --->", formData.password_again);
    debug("@validateReg --->", formData.password);
    errors.password = "They are not the same";
  }
  if (userNAmeArr.length > 0) {
    errors.username = "Please choose another Username. It is already taken.";
    debug(
      "@validateReg ---ctx.session.user.username -->",
      ctx.session.user.username,
    );
    debug("@validateReg ---userNameEqual.length -->", userNAmeArr[0][1]);
    if (ctx.session.user.username == userNAmeArr[0][1]) {
      delete errors["username"];
    }
  }
  return errors;
};

export async function passwordIsCorrect(user, formPassword) {
  if (typeof user === "object") {
    const ok = await bcrypt.compare(formPassword, user.password);
    debug("@passwordIsCorrect.  is okay-->%O", ok);
    return ok;
  } else {
    return false;
  }
}

/////////////////////////////////////////////////////////
export async function validateAssetUpload(file) {
  const errors = {};

  const POST_FILE_LIMIT = 1024 * 1024 * 1000; // 1 GB

  if (!file) errors.one = "Not a File";
  if (file.size == 0) errors.two = "File has No Size";
  if (file.size > POST_FILE_LIMIT) {
    errors.three = "File is too big";
  }
  if (!isMimetypeAssetOk(file.type) && !isExtensionOkAssets(file.name)) {
    debug("@validateAssetUpload. file %O", file.name);

    errors.four = "File is not valid";
  }

  return errors;
}

export async function validateImageUpload(file) {
  const errors = {};

  const POST_FILE_LIMIT = 1024 * 1024 * 15; // 15 MB

  if (!file) errors.one = "Not a File";
  if (file.size == 0) errors.two = "File has No Size";
  if (file.size > POST_FILE_LIMIT) {
    errors.three = "File is too big";
  }
  if (isMimetypeOk(file.type) && isExtensionOkImages(file.name)) {
    errors.four = "File is not valid";
  }

  return errors;
}
function isValidEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
/////////////////////////////////
export function deleteOldFile(ctx) {
  const pathToFile = userModel.getPathByIdDB(ctx.db, ctx.session.user.id);

  debug("@validate. pathToFile %O", pathToFile);

  const pathNull = userModel.deletePathInDB(ctx.db, ctx.session.user.id);
  debug("@validate. pathNull %O", pathNull);
}
export async function validateComment(formData) {
  const errors = {};
  if (formData.text) {
    if (!isValidText(formData.text)) errors.text = "Thats Wrong";
  }
  return errors;
}
