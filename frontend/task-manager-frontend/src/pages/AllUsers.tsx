import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiGrid, FiUsers, FiSettings, FiUser, FiBell, FiSun, FiMoon, FiMenu
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ collapsed, activeItem, setActiveItem }: any) => (
  <aside className={`h-full bg-gray-900 text-white ${collapsed ? 'w-20' : 'w-60'} p-4 transition-all duration-300`}> 
    <h2 className="text-2xl font-bold mb-10">{!collapsed && "Tasky"}</h2>
    <ul className="space-y-4">
      <li className={`flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-700 ${activeItem === "dashboard" ? "bg-gray-700" : ""}`} onClick={() => setActiveItem("dashboard")}> <FiGrid /> {!collapsed && "Dashboard"}</li>
      <li className={`flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-700 ${activeItem === "users" ? "bg-gray-700" : ""}`} onClick={() => setActiveItem("users")
        
      }> <FiUsers /> {!collapsed && "Users"}</li>
      <li className={`flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-700 ${activeItem === "settings" ? "bg-gray-700" : ""}`} onClick={() => setActiveItem("settings")}> <FiSettings /> {!collapsed && "Settings"}</li>
    </ul>
  </aside>
);

const Topbar = ({ toggleTheme, darkMode, toggleSidebar }: any) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Admin");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole");
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-600">
      <div className="flex items-center gap-4">
        <button className="text-xl" onClick={toggleSidebar}><FiMenu /></button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <button><FiBell className="text-gray-600 dark:text-gray-300" /></button>
        <button onClick={toggleTheme}>{darkMode ? <FiSun className="text-white" /> : <FiMoon />}</button>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <FiUser /> <span>{userName} ({userRole})</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

const AllUsers = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [modalTask, setModalTask] = useState<any | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("https://localhost:7088/api/Auth/all-users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await axios.get("https://localhost:7088/api/Auth/all-tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setTasks(res.data);
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleDelete = async (taskId: number) => {
    try {
      await axios.delete(`https://localhost:7088/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEdit = async (taskId: number, updatedTask: any) => {
    try {
      await axios.put(`https://localhost:7088/api/tasks/${taskId}`, updatedTask, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const updatedTasks = tasks.map((task) => task.id === taskId ? { ...task, ...updatedTask } : task);
      setTasks(updatedTasks);
      setModalTask(null);
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar collapsed={sidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="flex flex-col w-full">
        <Topbar toggleTheme={() => setDarkMode(!darkMode)} darkMode={darkMode} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <div className="p-6 overflow-auto">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">Users & Tasks Overview</h2>
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user) => {
                  const userTasks = tasks.filter((t) => t.userId === user.id);
                  return (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="px-6 py-4 text-sm">{user.username}</td>
                        <td className="px-6 py-4 text-sm">{user.email}</td>
                    
                      </tr>

                      {expandedUserId === user.id && (
                        <tr>
                          <td colSpan={3} className="bg-gray-50 dark:bg-gray-800 px-6 py-4">
                            {userTasks.length === 0 ? (
                              <div className="text-gray-600 dark:text-gray-300 italic">No tasks created yet.</div>
                            ) : (
                              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {userTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="p-4 border rounded-lg bg-white dark:bg-gray-900 shadow-sm flex justify-between items-start gap-4"
                                  >
                                    <div>
                                      <h4 className="text-sm font-bold text-gray-800 dark:text-white">{task.title}</h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-300">
                                        Status: <span className="capitalize">{task.status}</span>
                                      </p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <button
                                        onClick={() => setModalTask(task)}
                                        className="text-blue-600 hover:underline text-xs"
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() => handleDelete(task.id)}
                                        className="text-red-600 hover:underline text-xs"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {modalTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[90%] max-w-xl shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">{modalTask.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{modalTask.description}</p>

              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Status</label>
              <select
                value={modalTask.status}
                onChange={(e) => setModalTask({ ...modalTask, status: e.target.value })}
                className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setModalTask(null)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEdit(modalTask.id, modalTask)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AllUsers;