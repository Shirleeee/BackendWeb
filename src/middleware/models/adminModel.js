import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

const debug = Debug("app:adminModel");

export function deleteAnUserFromDB(db, userId) {
  const sql = `DELETE FROM User WHERE userId= :userId`;
  db.query(sql, { userId: userId });
  return db.changes;
}
export function updateRoleDB(db, role, id) {
  // debug("@updateFileDB ---> Id ist  %O", id);

  const sql = `UPDATE User
SET role=:role WHERE User.id=:id
`;
  db.queryEntries(sql, {
    id: id,
    role: role,
  });
}
