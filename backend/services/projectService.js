const projectRepository = require("../repositories/projectRepository")

const createProject = async (data) => {

 const { title, description } = data

 if (!title) {
  throw new Error("Title required")
 }

 return projectRepository.createProject(title, description)
}

const getProjects = async () => {

 return projectRepository.getProjects()

}

module.exports = {
 createProject,
 getProjects
}