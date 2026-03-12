import { useState } from "react";
import API from "../services/api";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e) => {

    e.preventDefault();

    try {

      const res = await API.post("/users/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);

      window.location = "/";

    } catch (err) {

      setError(err.response?.data?.error || "Login failed");

    }

  };

  return (

    <div className="flex justify-center items-center h-screen bg-gray-100">

      <form
        onSubmit={login}
        className="bg-white p-6 rounded shadow-md w-80 flex flex-col gap-3"
      >

        <h1 className="text-2xl font-bold mb-2 text-center">
          Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Login
        </button>

        <p className="text-sm text-center">
          Don't have an account?
          <a href="/register" className="text-blue-500 ml-1">
            Register
          </a>
        </p>

      </form>

    </div>

  );
}