export default function ProjectCard({project}){

  const openProject = () => {
 
   localStorage.setItem("currentProject", project.id);
 
   window.location = `/project/${project.id}`;
 
  };
 
  return(
 
  <div
  onClick={openProject}
  className="border p-4 mb-3 cursor-pointer"
  >
 
  <h2 className="text-lg font-bold">{project.title}</h2>
  <p>{project.description}</p>
 
  </div>
 
  );
 
 }