import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Experiments from "./pages/Experiments";
import Project from "./pages/Project";
import Login from "./pages/Login";
import Register from "./pages/Register"; // ✅ ADD THIS

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Dashboard />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/project/:id" element={<Project />} />

      </Routes>

    </BrowserRouter>

  );

}