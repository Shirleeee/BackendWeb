import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:likesModel");

//////////////////////! AlreadyLiked Table
export function getAssetIdByUserIdDB(db, userId, assetId) {
  const sql =
    `SELECT assetId FROM AlreadyLiked WHERE userId = :userId AND assetId = :assetId`;
  debug("@getAssetIdByUserIdDB ---> Id ist  %O", userId);
  return db.queryEntries(sql, { userId: userId, assetId: assetId })[0];
}

export function addAlreadyLikedToDB(db, likeOBJ) {
  const sql = `INSERT INTO AlreadyLiked
      (userId,assetId)
      VALUES (:userId,:assetId)`;
  debug(
    "@addToDB. result database insert %O",
    db.query(sql, {
      userId: likeOBJ.userId,
      assetId: likeOBJ.assetId,
    }),
  );
  return db.lastInsertRowId;
}
export const deleteAssetsAlreadyLikedDB = (db, assetId) => {
  const sql = `DELETE FROM AlreadyLiked WHERE assetId= :assetId`;
  db.query(sql, { assetId: assetId });
  return db.changes;
};
export const allAlreadyLikedByUserIdArray = (db, userId) => {
  return db.query("SELECT * FROM AlreadyLiked WHERE userId= ?", [userId]);
};
