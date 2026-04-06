import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/api";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "resident",
  });

  const { name, email, password, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      await api.post("/auth/register", formData);
      toast.success("Registration successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <Toaster position="top-right" />

      <form className="register-box" onSubmit={handleRegister}>
        <h2>RGMS Registration</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handleChange}
        />

        <select name="role" value={role} onChange={handleChange}>
          <option value="resident">Resident</option>
          <option value="society">Society Admin</option>
          <option value="admin">Super Admin</option>
        </select>

        <button type="submit">Register</button>

        <p onClick={() => navigate("/")}>
          Already have an account? <span>Login</span>
        </p>
      </form>
    </div>
  );
};

export default Register;
