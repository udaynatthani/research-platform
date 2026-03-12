import { Link } from "react-router-dom";

export default function Navbar() {

  return (
    <div className="bg-black text-white p-4 flex justify-between">

      <h1 className="font-bold text-lg">
        Research Platform
      </h1>

      <div className="flex gap-4">

        <Link to="/">Dashboard</Link>

      </div>

    </div>
  );
}