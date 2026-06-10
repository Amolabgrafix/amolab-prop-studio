import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-purple-700">
          Amolab Prop Studio
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/">Home</Link>
          <Link to="/properties">Properties</Link>
          <Link to="/buy">Buy</Link>
          <Link to="/rent">Rent</Link>
          <Link to="/agents">Agents</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-purple-600 text-purple-600"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-purple-600 text-white"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}