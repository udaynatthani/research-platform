import { useState } from "react";
import API from "../services/api";

export default function Register() {

  const [username,setUsername] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const register = async (e) => {

    e.preventDefault();

    try {

      await API.post("/users/register",{
        username,
        email,
        password
      });

      alert("Registration successful. Please login.");

      window.location="/login";

    } catch(err){

      alert(err.response?.data?.error || "Registration failed");

    }

  };

  return (

    <div className="p-10 flex justify-center">

      <form onSubmit={register} className="flex flex-col gap-4 w-80">

        <h1 className="text-2xl font-bold">Register</h1>

        <input
        placeholder="Username"
        onChange={(e)=>setUsername(e.target.value)}
        className="border p-2"
        />

        <input
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
        className="border p-2"
        />

        <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
        className="border p-2"
        />

        <button className="bg-green-500 text-white p-2">
        Register
        </button>

        <p className="text-sm">
        Already have an account?
        <a href="/login" className="text-blue-500 ml-1">
        Login
        </a>
        </p>

      </form>

    </div>

  );
}