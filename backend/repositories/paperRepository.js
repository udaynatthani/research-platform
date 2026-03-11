const pool = require("../config/db");

const createPaper = async (title, summary, projectId) => {

 const result = await pool.query(
  "INSERT INTO papers(title, summary, project_id) VALUES($1,$2,$3) RETURNING *",
  [title, summary, projectId]
 );

 return result.rows[0];
};

const getPapers = async () => {

 const result = await pool.query(
  "SELECT * FROM papers ORDER BY created_at DESC"
 );

 return result.rows;
};

module.exports = {
 createPaper,
 getPapers
};