import { useEffect, useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import API from "../services/api";

export default function ConceptGraph({ projectId }) {

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {

    API.get(`/visualization/concept-graph/${projectId}`)
      .then(res => {

        const nodes = res.data.nodes.map(n => ({
          id: n.id,
          data: { label: n.title },
          position: { x: Math.random()*400, y: Math.random()*400 }
        }));

        const edges = res.data.links.map(l => ({
          id: l.id,
          source: l.sourceNodeId,
          target: l.targetNodeId
        }));

        setNodes(nodes);
        setEdges(edges);

      });

  }, [projectId]);

  return (

    <div className="h-[500px] border rounded">

      <ReactFlow
        nodes={nodes}
        edges={edges}
      />

    </div>

  );
}