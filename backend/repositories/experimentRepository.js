const pool = require("../config/db");

const createExperiment = async (objective, methodology, result, projectId) => {

 const query = `
 INSERT INTO experiments(objective, methodology, result, project_id)
 VALUES($1,$2,$3,$4)
 RETURNING *
 `;

 const values = [objective, methodology, result, projectId];

 const response = await pool.query(query, values);

 return response.rows[0];
};

const getExperiments = async () => {

 const response = await pool.query(
  "SELECT * FROM experiments ORDER BY created_at DESC"
 );

 return response.rows;
};

module.exports = {
 createExperiment,
 getExperiments
};