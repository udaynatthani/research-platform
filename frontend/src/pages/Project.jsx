import { useParams } from "react-router-dom";
import WorkflowBoard from "../components/WorkflowBoard";
import ConceptGraph from "../components/ConceptGraph";

export default function Project() {

  const { id } = useParams();

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Project Overview
      </h1>

      <WorkflowBoard projectId={id} />

      <ConceptGraph projectId={id} />

    </div>
  );
}