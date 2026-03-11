const pool = require("../config/db");

const createLink = async (sourceType, sourceId, targetType, targetId) => {

 const result = await pool.query(
  "INSERT INTO research_links(source_type, source_id, target_type, target_id) VALUES($1,$2,$3,$4) RETURNING *",
  [sourceType, sourceId, targetType, targetId]
 );

 return result.rows[0];
};

const getLinks = async () => {

 const result = await pool.query(
  "SELECT * FROM research_links"
 );

 return result.rows;
};

module.exports = {
 createLink,
 getLinks
};