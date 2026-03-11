const pool = require("../config/db");

const createProject = async (title, description, ownerId) => {

 const query = `
 INSERT INTO projects(title, description, owner_id)
 VALUES($1,$2,$3)
 RETURNING *
 `;

 const values = [title, description, ownerId];

 const result = await pool.query(query, values);

 return result.rows[0];
};

const getProjects = async () => {

 const result = await pool.query(`
 SELECT * FROM projects
 ORDER BY created_at DESC
 `);

 return result.rows;
};

const getProjectById = async (projectId) => {

 const result = await pool.query(
  "SELECT * FROM projects WHERE id=$1",
  [projectId]
 );

 return result.rows[0];
};

const deleteProject = async (projectId) => {

 await pool.query(
  "DELETE FROM projects WHERE id=$1",
  [projectId]
 );

};

module.exports = {
 createProject,
 getProjects,
 getProjectById,
 deleteProject
};