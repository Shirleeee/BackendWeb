import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:serveFiles");
import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import * as mediaTypes from "https://deno.land/std@0.170.0/media_types/mod.ts";

export const serveStaticFile = (base) => async (ctx) => {
  let file;
  const fullPath = path.join(base, ctx.url.pathname);

  if (fullPath.indexOf(base) !== 0 || fullPath.indexOf("\0") !== -1) {
    const flashText = "It is forbidden !!!! What are you trying to do?";
    ctx.response.body = ctx.nunjucks.render("error.html", { flashText });
    ctx.response.status = 403;

    ctx.response.headers["content-type"] = "text/html";

    // debug(
    //   "@serveStaticFile.fullPath.indexOf(base) ---> %O",
    //   fullPath.indexOf(base),
    // );
    return ctx;
  }
  try {
    file = await Deno.open(fullPath, { read: true });
  } catch (_error) {
    const flashText = "It is forbidden !!!! What are you trying to do?";
    ctx.response.body = ctx.nunjucks.render("error.html", { flashText });
    ctx.response.status = 403;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }
  const { ext } = path.parse(ctx.url.pathname);
  const contentType = mediaTypes.contentType(ext);
  // debug("@serveStaticFile....ext ---> %O", ext);
  if (contentType) {
    // debug("@serveStaticFile.....file.readable ---> %O", file.readable);
    ctx.response.body = file.readable;
    ctx.response.headers["Content-type"] = contentType;
    ctx.response.status = 200;
  } else {
    Deno.close(file.rid);
  }
  return ctx;
};
