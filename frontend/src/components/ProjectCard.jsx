import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {

  return (
    <Link to={`/project/${project.id}`}>

      <div className="border p-4 rounded shadow hover:bg-gray-50">

        <h2 className="font-bold">
          {project.title}
        </h2>

        <p className="text-gray-600">
          {project.description}
        </p>

      </div>

    </Link>
  );
}