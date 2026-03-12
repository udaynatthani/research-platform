import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

import ConceptGraph from "../components/ConceptGraph";

export default function Project(){

 const {id}=useParams();

 const [concepts,setConcepts]=useState([]);

 useEffect(()=>{

  API.get(`/visualization/concept-graph/${id}`)
  .then(res=>setConcepts(res.data));

 },[id]);

 const addConcept=async()=>{

  const title=prompt("Concept title");

  await API.post("/concepts",{
   projectId:id,
   type:"CONCEPT",
   title
  });

  window.location.reload();

 };

 return(

 <div className="p-6">

 <button
 onClick={addConcept}
 className="bg-blue-500 text-white px-4 py-2"
 >
 Add Concept
 </button>

 <ConceptGraph projectId={id}/>

 </div>

 );

}