import React, { useEffect, useState } from "react";
import { userAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!storedUser?._id) {
        navigate("/login");
        return;
      }

      const res = await userAPI.getProfile(storedUser._id);
      setUser(res.data.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load profile");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleDelete = async () => {
    try {
      await userAPI.deleteUser(user._id);
      localStorage.clear();
      alert("Account Deleted");
      navigate("/register");
    } catch (error) {
      alert("Delete Failed");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <h2 className="text-blue-600 text-xl">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-700">

      {/* Top Header */}
      <div className="bg-blue-900 text-white text-center py-4 text-xl font-semibold shadow-md">
        Profile
      </div>

      <div className="flex flex-col items-center mt-12">

        {/* Profile Card */}
        <div className="bg-white w-80 rounded-2xl shadow-2xl p-6 text-center relative">

          {/* Avatar */}
          <div className="w-24 h-24 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold absolute -top-12 left-1/2 transform -translate-x-1/2 border-4 border-white shadow-md">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div className="mt-14">
            <h2 className="text-2xl font-bold text-blue-800">
              {user.name}
            </h2>

            <p className="text-gray-600 mt-1">
              {user.email}
            </p>
          </div>

          {/* Buttons */}
          <button
            onClick={() => navigate("/profileedit")}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            Edit Profile
          </button>
          <button
          onClick={handleLogout}
           className="mt-4 w-full border bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white  transition"
        >
          Log Out
        </button>
          

          <button
            onClick={handleDelete}
                    className="mt-4 w-full border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 transition"
 >
            Delete Account
          </button>
        </div>

        {/* Logout */}
        

        <p className="mt-4 text-white underline cursor-pointer">
          Privacy & Policy
        </p>
      </div>
    </div>
  );
};

export default Profile;
