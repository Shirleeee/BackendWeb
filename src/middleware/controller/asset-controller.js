import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:assetController");
import * as valid from "../../middleware/accessories/validation.js";
import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import * as dataHandling from "../../middleware/accessories/dataHandling.js";
import * as assetModel from "./../models/assetModel.js";
import * as likesModel from "./../models/likesModel.js";

export async function addDeleteAsset(ctx) {
  const userAuth = ctx.state.authenticated;

  const asset = assetModel.getOneAssetByIdDB(ctx.db, Number(ctx.params.id));

  debug("@showDetailAsset.  --ctx.params.id--> %O", ctx.params.id);
  debug("@showDetailAsset.  --asset--> %O", asset);

  const flashText = " Do you really wanna delete your asset ?";

  ctx.response.body = ctx.nunjucks.render("./reallyDelete.html", {
    userAuth,
    flashText,
    asset,
  });

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

export async function submitDeleteAsset(ctx) {
  const asset = assetModel.getOneAssetByIdDB(ctx.db, Number(ctx.params.id));

  debug("@showDetailAsset.  --ctx.params.id--> %O", ctx.params.id);
  debug("@showDetailAsset.  --asset--> %O", asset);

  if (asset.datapath != null) {
    await dataHandling.removeDataFromDirectory(asset.datapath);
    assetModel.deleteAnAssetFromDB(ctx.db, asset.id);
    likesModel.deleteAssetsAlreadyLikedDB(ctx.db, asset.id);
  }

  ctx.redirect = Response.redirect(
    ctx.url.origin + `/profile/${asset.userId}`,
    303,
  );
  return ctx;
}

export async function showDetailAsset(ctx) {
  const userAuth = ctx.state.authenticated;
  let self = false;
  debug("@showDetailAsset.  == ctx.request.method--> %O", ctx.request.method);

  if (ctx.request.method == "POST") {
    const formData = await ctx.request.formData();
    const name = formData.get("objectName");
    assetModel.updateNameInAssetPathDB(ctx.db, name, ctx.params.id);
  }
  const asset = assetModel.getOneAssetByIdDB(ctx.db, ctx.params.id);
  if (ctx.session.user.id == asset.userId) {
    self = true;
  }

  ctx.response.body = ctx.nunjucks.render("./detailAsset.html", {
    userAuth,
    asset,
    self,
  });

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}

export async function addAssets(ctx) {
  const userAuth = ctx.state.authenticated;

  ctx.response.body = ctx.nunjucks.render("addAssetForm.html", {
    userAuth,
  });

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}

export async function submitAddAssets(ctx) {
  const userAuth = ctx.state.authenticated;

  const formData = await ctx.request.formData();
  const objectData = {
    file: formData.get("upload"),
    name: formData.get("objectName"),
  };

  const errorsFile = await valid.validateAssetUpload(objectData.file);

  debug("@submitAddAssets.  --errorsForm--> %O", errorsFile);
  if (Object.values(errorsFile).length > 0) {
    debug("@submitAddAssets.  --errorsForm--> %O", errorsFile);
    formData.upload = undefined;

    ctx.response.body = ctx.nunjucks.render("addAssetForm.html", {
      userAuth,
      errorsFile,
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  } else if (objectData.file) {
    const filename = dataHandling.generateFilename(objectData.file, "upload");
    const newFilename = dataHandling.addFileExtension(filename);
    const destFile = await Deno.open(
      path.join(Deno.cwd(), "public", newFilename),
      {
        create: true,
        write: true,
        truncate: true,
      },
    );
    const upload = objectData.file;

    objectData.file = newFilename;
    objectData.userId = ctx.session.user.id;
    objectData.username = ctx.session.user.username;
    objectData.size = upload.size;
    debug("@submitAddAssets.  -- upload--> %O", upload);

    await upload.stream().pipeTo(destFile.writable);

    assetModel.addAssetToDB(ctx.db, objectData);
  }

  ctx.redirect = Response.redirect(ctx.url.origin + `/previewAsset`, 303);

  return ctx;
}

export async function previewAsset(ctx) {
  const userAuth = ctx.state.authenticated;

  const model = assetModel.getLastAssetsByIdDB(ctx.db, ctx.session.user.id);
  debug("@previewAsset(ctx). %O model --->", model);

  ctx.response.body = ctx.nunjucks.render("previewAsset.html", {
    userAuth,
    model,
  });

  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}

export async function downloadAsset(ctx) {
  const model = assetModel.getAssetsByDatapathDB(ctx.db, ctx.params.id);

  const filePath = model.datapath;
  const splitedFilebyDot = filePath.split("/");
  const file = await Deno.open(`./public/upload/${splitedFilebyDot[1]}`);

  ctx.response.body = file.readable;
  ctx.response.status = 200;
  ctx.response.headers = {
    ["Content-Type"]: "model/gltf-binary",
    ["Content-Disposition"]: `attachment; filename="${splitedFilebyDot[1]}"`,
  };

  return ctx;
}
