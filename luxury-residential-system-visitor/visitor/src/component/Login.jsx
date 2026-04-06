import React, { useState , } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import toast from "react-hot-toast";

export default function Login() {
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();





  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await userAPI.login(formData);

      if (response.data.success) {
        const user = response.data.data;

        toast.success("Login successful!");

        // ✅ Correct storage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user._id); // 🔥 IMPORTANT
        localStorage.setItem("token", response.data.token); // if backend sends JWT

        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT SECTION */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-linear-to-b from-blue-700 to-blue-900 text-white p-10">
        <div className="absolute top-6 left-6 text-xl font-bold tracking-wide">
          🏢 MYBuilding
        </div>

        <h1 className="text-4xl font-bold text-center mb-6 leading-snug">
          Welcome to Building <br /> Maintenance
        </h1>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="illustration"
          className="w-80 drop-shadow-xl"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl">
              👤
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">
            Login to your account
          </h2>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-4">
              <label className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              />
            </div>

            {/* Password / Pin */}
            <div className="mb-2">
              <label className="text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  disabled={loading}
                  className="absolute right-3 top-3 text-gray-400 disabled:opacity-50"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="flex justify-between text-sm text-blue-600 mb-5">
              <button
                type="button"
                disabled={loading}
                className="hover:underline disabled:opacity-50"
              >
                Set pin
              </button>
              <button
                type="button"
                disabled={loading}
                className="hover:underline disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-5">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
