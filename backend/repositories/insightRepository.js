const pool = require("../config/db");

const createInsight = async (title, description, projectId) => {

 const result = await pool.query(
  "INSERT INTO insights(title, description, project_id) VALUES($1,$2,$3) RETURNING *",
  [title, description, projectId]
 );

 return result.rows[0];
};

const getInsights = async () => {

 const result = await pool.query(
  "SELECT * FROM insights ORDER BY created_at DESC"
 );

 return result.rows;
};

module.exports = {
 createInsight,
 getInsights
};