import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function Experiments(){

 const [experiments,setExperiments] = useState([]);
 const [title,setTitle] = useState("");
 const [objective,setObjective] = useState("");
 const [methodology,setMethodology] = useState("");

 const projectId = localStorage.getItem("currentProject");

 useEffect(()=>{

  if(!projectId) return;

  API.get(`/experiments?projectId=${projectId}`)
  .then(res => setExperiments(res.data));

 },[projectId]);

 const createExperiment = async (e) => {

  e.preventDefault();

  const res = await API.post("/experiments",{
    projectId,
    title,
    objective,
    methodology
  });

  setExperiments([...experiments,res.data]);

  setTitle("");
  setObjective("");
  setMethodology("");

 };

 return(

 <div>

 <Navbar/>

 <div className="p-6">

 <h1 className="text-2xl mb-4">Experiments</h1>

 <form onSubmit={createExperiment} className="flex flex-col gap-3 mb-6">

 <input
 placeholder="Experiment Title"
 value={title}
 onChange={(e)=>setTitle(e.target.value)}
 className="border p-2"
 />

 <input
 placeholder="Objective"
 value={objective}
 onChange={(e)=>setObjective(e.target.value)}
 className="border p-2"
 />

 <textarea
 placeholder="Methodology"
 value={methodology}
 onChange={(e)=>setMethodology(e.target.value)}
 className="border p-2"
 />

 <button className="bg-blue-500 text-white p-2">
 Create Experiment
 </button>

 </form>

 {experiments.map(exp=>(
 <div key={exp.id} className="border p-3 mb-3">

 <h2 className="font-bold">{exp.title}</h2>
 <p>{exp.objective}</p>
 <p className="text-sm text-gray-500">{exp.methodology}</p>

 </div>
 ))}

 </div>

 </div>

 );

}