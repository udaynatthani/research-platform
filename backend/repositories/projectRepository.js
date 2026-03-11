const pool = require("../config/db");

const createProject = async (title, description) => {

 const result = await pool.query(
  "INSERT INTO projects(title, description) VALUES($1,$2) RETURNING *",
  [title, description]
 );

 return result.rows[0];
};

const getProjects = async () => {

 const result = await pool.query(
  "SELECT * FROM projects ORDER BY created_at DESC"
 );

 return result.rows;
};

module.exports = {
 createProject,
 getProjects
};