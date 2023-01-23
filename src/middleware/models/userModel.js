import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

const debug = Debug("app:userModel");

export const allUsersArr = (db) => db.queryEntries("SELECT * FROM User");

export function getUserByIdDB(db, id) {
  const sql = "SELECT * FROM User WHERE id= :id";
  return db.queryEntries(sql, { id: id })[0];
}

export function getByUsernameDB(db, username) {
  const sql = "SELECT * FROM User WHERE username= :username";
  return db.queryEntries(sql, { username: username })[0];
}

export function getAvatarPathByIdDB(db, id) {
  const sql = `SELECT avatar FROM User WHERE id = :id`;
  debug("@model.updateDB ---> Id ist  %O", id);
  return db.queryEntries(sql, { id: id })[0];
}

export const allUsernamesArray = (db, username) => {
  return db.query("SELECT * FROM User WHERE username= ?", [username]);
};

////////////////////!

export function addToDB(db, data) {
  const sql = `INSERT INTO User
    (userName,firstName,lastName,email,avatar,password,location,website,biography,role)
    VALUES (:userName,:firstName,:lastName,:email,:avatar,:password,:location,:website,:biography,:role)`;
  debug(
    "@addToDB. result database insert %O",
    db.query(sql, {
      userName: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      avatar: data.avatar,
      password: data.password,
      location: data.location,
      website: data.website,
      biography: data.biography,
      role: "user",
    }),
  );
  return db.lastInsertRowId;
}

////////////////////!

export const updateUsersProfileDB = (db, updateUserObj, id) => {
  debug("@model.updateUsersProfileDB ---> Id ist  %O", id);

  const sql = `UPDATE User
SET username=:username,password=:password, biography=:biography, website=:website,location=:location
WHERE User.id=:id
`;
  db.queryEntries(sql, {
    id: id,
    username: updateUserObj.username,
    password: updateUserObj.password,
    biography: updateUserObj.biography,
    website: updateUserObj.website,
    location: updateUserObj.location,
  });
};

export function updateFileDB(db, avatar, id) {
  // debug("@updateFileDB ---> Id ist  %O", id);

  const sql = `UPDATE User
SET avatar=:avatar WHERE User.id=:id
`;
  db.queryEntries(sql, {
    id: id,
    avatar: avatar,
  });
}

////////////////////!

export function deleteUserFromDB(db, id) {
  const sql = `DELETE FROM User WHERE id= :id`;
  db.query(sql, { id: id });
  return db.changes;
}
