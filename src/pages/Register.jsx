import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUpUser } from "../services/auth";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "buyer",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await signUpUser(formData);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Account created successfully. Please check your email.");
    setLoading(false);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6 py-12">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-purple-700">
          Create Account
        </h1>

        <p className="text-gray-600 mt-2">
          Join Amolab Prop Studio today.
        </p>

        {message && (
          <div className="mt-4 bg-purple-50 text-purple-700 p-3 rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-4 py-3"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="agent">Agent</option>
            <option value="rental">Looking for Rental</option>
          </select>

          <button
            disabled={loading}
            className="w-full bg-purple-700 text-white py-3 rounded-xl font-semibold hover:bg-purple-800 transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-700 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}