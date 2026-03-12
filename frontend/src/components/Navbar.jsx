export default function Navbar(){

  const logout=()=>{
   localStorage.removeItem("token");
   window.location="/login";
  };
 
  return(
 
  <div className="flex justify-between p-4 bg-gray-900 text-white">
 
  <h1>Research Platform</h1>
 
  <div className="flex gap-4">
 
  <a href="/">Dashboard</a>
  <a href="/experiments">Experiments</a>
 
  <button onClick={logout}>
  Logout
  </button>
 
  </div>
 
  </div>
 
  );
 
 }