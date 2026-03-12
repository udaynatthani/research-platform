import { useEffect, useState } from "react";
import API from "../services/api";
import ProjectCard from "../components/ProjectCard";

export default function Dashboard() {

  const [projects, setProjects] = useState([]);

  useEffect(() => {

    API.get("/projects")
      .then(res => setProjects(res.data));

  }, []);

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Research Projects
      </h1>

      <div className="grid grid-cols-3 gap-4">

        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
          />
        ))}

      </div>

    </div>
  );
}