import { useEffect, useState } from "react";
import API from "../services/api";

export default function WorkflowBoard({ projectId }) {

  const [stages, setStages] = useState([]);

  useEffect(() => {

    API.get(`/workflow/stages/${projectId}`)
      .then(res => setStages(res.data));

  }, [projectId]);

  return (

    <div className="mb-10">

      <h2 className="text-xl font-semibold mb-4">
        Research Workflow
      </h2>

      <div className="flex gap-4">

        {stages.map(stage => (

          <div key={stage.id} className="border p-4 w-60 rounded">

            <h3 className="font-bold mb-3">
              {stage.name}
            </h3>

            {stage.items.map(item => (

              <div key={item.id} className="bg-gray-100 p-2 mb-2 rounded">

                {item.title}

              </div>

            ))}

          </div>

        ))}

      </div>

    </div>
  );
}