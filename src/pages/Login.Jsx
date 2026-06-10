import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInUser } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await signInUser(email, password);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Login successful!");

    setTimeout(() => {
      navigate("/");
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-purple-700">
          Welcome Back
        </h1>

        <p className="text-gray-500 mt-2">
          Login to your account.
        </p>

        {message && (
          <div className="mt-4 p-3 rounded-lg bg-purple-50 text-purple-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-xl px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-xl px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="w-full bg-purple-700 text-white py-3 rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-purple-700 font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}