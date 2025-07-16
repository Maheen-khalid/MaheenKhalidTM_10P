import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    if (role !== "Admin") {
      navigate("/dashboard"); // redirect non-admins
    } else {
      setUserName(name || "Admin");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome, {userName}</h1>
      <p>This is the Admin Dashboard. Here you can manage users, settings, etc.</p>
      {/* Add Admin-specific components here */}
    </div>
  );
};

export default AdminDashboard;
