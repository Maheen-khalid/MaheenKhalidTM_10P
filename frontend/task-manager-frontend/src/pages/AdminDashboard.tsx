import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiGrid, FiUsers, FiSettings, FiUser, FiBell, FiSun, FiMoon, FiMenu
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

// ===== Sidebar =====
const Sidebar = ({ collapsed, activeItem, setActiveItem }: any) => {
  const menuItems = [
    { key: "dashboard", icon: <FiGrid />, label: "Dashboard" },
    { key: "users", icon: <FiUsers />, label: "Users" },
    { key: "settings", icon: <FiSettings />, label: "Settings" },
  ];
  return (
    <aside className={`h-full bg-gray-900 text-white ${collapsed ? "w-20" : "w-60"} p-4 transition-all duration-300`}>
      <h2 className="text-2xl font-bold mb-10">{!collapsed && "Tasky"}</h2>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-700 ${
              activeItem === item.key ? "bg-teal-600" : ""
            }`}
            onClick={() => setActiveItem(item.key)}
            data-tooltip-id="sidebar-tip"
            data-tooltip-content={item.label}
          >
            {item.icon}
            {!collapsed && item.label}
          </li>
        ))}
      </ul>
      <Tooltip id="sidebar-tip" place="right" />
    </aside>
  );
};

// ===== Topbar =====
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

// ===== User Card (tasks always visible) =====
const UserCard = ({ user, tasks, onEditTask, onDeleteTask, onDeleteUser }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{user.username}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <button
          onClick={() => onDeleteUser(user.id)}
          className="text-red-600 hover:text-red-700 text-sm underline"
        >
          Delete User
        </button>
      </div>

      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks</h4>
        {(!tasks || tasks.length === 0) ? (
          <div className="text-sm text-gray-500 italic">No tasks created yet.</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {tasks.map((task: any) => (
              <div
                key={task.id}
                className="p-3 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 flex justify-between items-start gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{task.title}</h5>
                    <span
                      className={`shrink-0 inline-block px-2 py-0.5 text-xs rounded-full capitalize ${
                        task.status === "done"
                          ? "bg-green-200 text-green-800"
                          : task.status === "inProgress"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  {task.description && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => onEditTask(task)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== Main Component =====
const AdminDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [modalTask, setModalTask] = useState<any | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ type: "task" | "user"; id: number } | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("https://localhost:7088/api/Auth/all-users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      const res = await axios.get("https://localhost:7088/api/Auth/all-tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(res.data);
    };
    fetchTasks();
  }, []);

  // Dark mode class
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // API actions
  const handleDeleteUser = async (userId: number) => {
    try {
      await axios.delete(`https://localhost:7088/api/Auth/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTasks((prev) => prev.filter((t) => t.userId !== userId)); // remove their tasks from view
      setConfirmModal(null);
    } catch (err) {
      console.error("User deletion failed", err);
    }
  };

  const handleDeleteTaskConfirmed = async (taskId: number) => {
    try {
      await axios.delete(`https://localhost:7088/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setConfirmModal(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEdit = async (taskId: number, updatedTask: any) => {
    try {
      await axios.put(`https://localhost:7088/api/tasks/${taskId}`, updatedTask, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t))
      );
      setModalTask(null);
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  // Derived: tasks per user
  const tasksByUser = React.useMemo(() => {
    const map: Record<number, any[]> = {};
    tasks.forEach((t) => {
      if (!map[t.userId]) map[t.userId] = [];
      map[t.userId].push(t);
    });
    return map;
  }, [tasks]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
      <div className="flex flex-col w-full">
        <Topbar
          toggleTheme={() => setDarkMode(!darkMode)}
          darkMode={darkMode}
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="p-6 overflow-auto">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
            Users & Tasks Overview
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                tasks={tasksByUser[user.id] || []}
                onEditTask={(task: any) => setModalTask(task)}
                onDeleteTask={(taskId: number) => setConfirmModal({ type: "task", id: taskId })}
                onDeleteUser={(id: number) => setConfirmModal({ type: "user", id })}
              />
            ))}
          </div>
        </div>

        {/* Edit Task Modal */}
        {modalTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[90%] max-w-xl shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">{modalTask.title}</h3>
              {modalTask.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{modalTask.description}</p>
              )}

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

        {/* Confirm Delete Modal */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[90%] max-w-sm shadow-lg text-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this {confirmModal.type === "user" ? "user" : "task"}? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmModal.type === "user") {
                      handleDeleteUser(confirmModal.id);
                    } else {
                      handleDeleteTaskConfirmed(confirmModal.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;

