import { useEffect,useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";

export default function Dashboard(){

 const [projects,setProjects]=useState([]);

 useEffect(()=>{

  API.get("/projects")
  .then(res=>setProjects(res.data));

 },[]);

 const createProject=async()=>{

  const title=prompt("Project title");

  const res=await API.post("/projects",{
   title
  });

  setProjects([...projects,res.data]);

 };

 return(

 <div>

 <Navbar/>

 <div className="p-6">

 <button
 onClick={createProject}
 className="bg-green-500 text-white px-4 py-2 mb-4"
 >
 Create Project
 </button>

 {projects.map(p=>(
   <ProjectCard key={p.id} project={p}/>
 ))}

 </div>

 </div>

 );

}