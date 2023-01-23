import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";
const debug = Debug("app:assetModel");

////////////////////////////!

export function deleteAnAssetFromDB(db, id) {
  const sql = `DELETE FROM Assets WHERE id= :id`;
  db.query(sql, { id: id });
  return db.changes;
}

export const deleteAllAssetsByUserIdArray = (db, userId) => {
  db.query("DELETE FROM Assets WHERE userId= :userId", { userId: userId });
  return db.changes;
};

////////////////////////////!

export function getOneAssetByIdDB(db, id) {
  const sql = "SELECT * FROM Assets WHERE id= :id ";
  return db.queryEntries(sql, { id: id })[0];
}

export function getLastAssetsByIdDB(db, userId) {
  const sql =
    "SELECT * FROM Assets WHERE userId= :userId AND id = (SELECT MAX(id) FROM Assets)";
  return db.queryEntries(sql, { userId: userId })[0];
}

export function getAssetsByDatapathDB(db, datapath) {
  const sql = "SELECT * FROM Assets WHERE datapath= :datapath ";
  return db.queryEntries(sql, { datapath: datapath })[0];
}
//////////////////////!

export const allAssetsByUserIdArray = (db, userId) => {
  return db.query("SELECT * FROM Assets WHERE userId= ?", [userId]);
};
export const allAssetsArray = (db) => db.queryEntries("SELECT * FROM Assets");

////////////////////!

export const updateNameInAssetPathDB = (db, name, id) => {
  debug("@updateNameFilePathDB() ---> id ist  %O", id);

  const sql = `UPDATE Assets SET name=:name WHERE Assets.id=:id
`;
  db.queryEntries(sql, {
    id: id,
    name: name,
  });
};

export function updateUsernameDB(db, username, userId) {
  // debug("@updateUsernameDB---> Id ist  %O", id);
  const sql = `UPDATE Assets
SET username=:username WHERE Assets.userId=:userId
`;
  db.queryEntries(sql, {
    userId: userId,
    username: username,
  });
}

////////////////////////////!

export function addAssetToDB(db, assetObject) {
  const sql = `INSERT INTO Assets
    (name,datapath,userId,size,username)
    VALUES (:name,:datapath,:userId,:size,:username)`;
  debug(
    "@addToDB. result database insert %O",
    db.query(sql, {
      name: assetObject.name,
      size: assetObject.size,
      datapath: assetObject.file,
      userId: assetObject.userId,
      username: assetObject.username,
    }),
  );
  return db.lastInsertRowId;
}

//////////////////////! Likes

export function getLikesByIdDB(db, id) {
  const sql = `SELECT likes FROM Assets WHERE id = :id`;
  debug("@getLikesByIdDB ---> Id ist  %O", id);
  return db.queryEntries(sql, { id: id })[0];
}
export function updateLikesDB(db, likes, id) {
  // debug("@updateUsernameDB---> Id ist  %O", id);

  const sql = `UPDATE Assets
  SET likes=:likes WHERE Assets.id=:id
  `;
  db.queryEntries(sql, {
    id: id,
    likes: likes,
  });
}
