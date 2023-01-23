import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

const debug = Debug("app:commentModel");

export const allCommentsArr = (db) => db.queryEntries("SELECT * FROM Comments");

export const getallCommentsArrByAssetIdDB = (db, assetId) => {
  return db.query("SELECT * FROM Comments WHERE assetId= ?", [assetId]);
};
export function getCommentByIdDB(db, id) {
  const sql = "SELECT * FROM Comments WHERE id= :id ";
  return db.queryEntries(sql, { id: id })[0];
}
export function deleteCommentsFromDB(db, id) {
  const sql = `DELETE FROM Comments WHERE id= :id`;
  db.query(sql, { id: id });
  return db.changes;
}
export function addCommentToDB(db, commentObject) {
  const sql = `INSERT INTO Comments
    (userId,commentText,releasedDate,assetId,author)
    VALUES (:userId,:commentText,:releasedDate,:assetId,:author)`;
  debug(
    "@addToDB. result database insert %O",
    db.query(sql, {
      userId: commentObject.userId,
      commentText: commentObject.commentText,
      releasedDate: commentObject.releasedDate,
      assetId: commentObject.assetId,
      author: commentObject.author,
    }),
  );
  return db.lastInsertRowId;
}

export const updateCommentsDB = (db, username, userId) => {
  debug("@updateCommentsDB ---> Id ist  %O", userId);

  const sql = `UPDATE Comments
  SET author=:author
  WHERE Comments.userId=:userId
  `;
  db.queryEntries(sql, {
    userId: userId,
    author: username,
  });
};
