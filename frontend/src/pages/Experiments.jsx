import { useEffect, useState } from "react";
import API from "../services/api";

export default function Experiments({ projectId }) {

  const [experiments, setExperiments] = useState([]);

  useEffect(() => {

    API.get(`/experiments/${projectId}`)
      .then(res => setExperiments(res.data));

  }, [projectId]);

  return (

    <div className="p-6">

      <h1 className="text-xl font-bold mb-4">
        Experiments
      </h1>

      {experiments.map(exp => (

        <div key={exp.id} className="border p-4 mb-3 rounded">

          <h2 className="font-semibold">
            {exp.title}
          </h2>

          <p>
            {exp.objective}
          </p>

        </div>

      ))}

    </div>
  );
}