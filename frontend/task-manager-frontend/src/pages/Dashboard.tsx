import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiGrid, FiCheckSquare, FiUsers, FiSettings, FiUser, FiBell, FiSun, FiMoon, FiMenu, FiPlus, FiX
} from "react-icons/fi";
import { MdEdit, MdDelete } from "react-icons/md";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Task {
  id?: number;
  title: string;
  description: string;
  status: "todo" | "inProgress" | "done";
}

const Sidebar = ({ collapsed, activeItem, setActiveItem }: any) => (
  <aside className={`h-full bg-gray-900 text-white ${collapsed ? 'w-20' : 'w-60'} p-4 transition-all duration-300`}> 
    <h2 className="text-2xl font-bold mb-10">{!collapsed && "Tasky"}</h2>
    <ul className="space-y-4">
      <li className={`flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-700 ${activeItem === "dashboard" ? "bg-gray-700" : ""}`} onClick={() => setActiveItem("dashboard")}> <FiGrid /> {!collapsed && "Dashboard"}</li>
      <li className={`flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-700 ${activeItem === "tasks" ? "bg-gray-700" : ""}`} onClick={() => setActiveItem("tasks")}> <FiCheckSquare /> {!collapsed && "Tasks"}</li>
      <li className={`flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-700 ${activeItem === "teams" ? "bg-gray-700" : ""}`} onClick={() => setActiveItem("teams")}> <FiUsers /> {!collapsed && "Teams"}</li>
      <li className={`flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-700 ${activeItem === "settings" ? "bg-gray-700" : ""}`} onClick={() => setActiveItem("settings")}> <FiSettings /> {!collapsed && "Settings"}</li>
    </ul>
  </aside>
);

const Topbar = ({ toggleTheme, darkMode, toggleSidebar }: any) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("User");

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
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Task Management Dashboard</h1>
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

const StatsBar = ({ stats }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
    <div className="bg-white dark:bg-gray-700 p-4 rounded shadow text-center">
      <h3 className="text-lg font-bold dark:text-white">{stats.total}</h3>
      <p className="dark:text-white">Total Tasks</p>
    </div>
    <div className="bg-white dark:bg-gray-700 p-4 rounded shadow text-center">
      <h3 className="text-lg font-bold dark:text-white">{stats.todo}</h3>
      <p className="dark:text-white">To Do</p>
    </div>
    <div className="bg-white dark:bg-gray-700 p-4 rounded shadow text-center">
      <h3 className="text-lg font-bold dark:text-white">{stats.inProgress}</h3>
      <p className="dark:text-white">In Progress</p>
    </div>
    <div className="bg-white dark:bg-gray-700 p-4 rounded shadow text-center">
      <h3 className="text-lg font-bold dark:text-white">{stats.done}</h3>
      <p className="dark:text-white">Done</p>
    </div>
  </div>
);

const Column = ({ title, tasks, onAdd, onEdit, onDelete, status }: any) => (
  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow w-full max-w-sm">
    <div className="flex justify-between mb-4">
      <h2 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h2>
      <button onClick={onAdd} className="text-blue-500 hover:underline text-sm flex items-center gap-1"><FiPlus /> Add Task</button>
    </div>
    <div className="space-y-3">
      {tasks.filter((t: Task) => t.status === status).map((task: Task) => (
        <motion.div layout key={task.id} className="bg-white dark:bg-gray-700 p-3 rounded shadow">
          <h3 className="font-semibold text-gray-800 dark:text-white">{task.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => onEdit(task)}><MdEdit className="text-yellow-500" /></button>
            <button onClick={() => onDelete(task.id)}><MdDelete className="text-red-500" /></button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const TaskModal = ({ isOpen, onClose, onSubmit, editingTask }: any) => {
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [status, setStatus] = useState<Task["status"]>(editingTask?.status || "todo");

  useEffect(() => {
    setTitle(editingTask?.title || "");
    setDescription(editingTask?.description || "");
    setStatus(editingTask?.status || "todo");
  }, [editingTask]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-md">
        <button className="float-right" onClick={onClose}><FiX /></button>
        <h2 className="text-xl font-bold mb-4">{editingTask ? "Edit Task" : "Add Task"}</h2>
        <input className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white" value={status} onChange={(e) => setStatus(e.target.value as Task["status"])}>
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button onClick={() => onSubmit({ title, description, status, id: editingTask?.id })} className="bg-green-600 text-white px-4 py-2 rounded">{editingTask ? "Update" : "Add"}</button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    const res = await axios.get("https://localhost:7088/api/tasks", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleAdd = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`https://localhost:7088/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    fetchTasks();
  };

  const handleSubmit = async (task: Task) => {
    const { id, title, description, status } = task;
    if (editingTask) {
      await axios.put(`https://localhost:7088/api/tasks/${id}`, { title, description, status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
    } else {
      await axios.post(`https://localhost:7088/api/tasks`, { title, description, status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
    }
    setModalOpen(false);
    fetchTasks();
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "inProgress").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar collapsed={sidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="flex flex-col w-full">
        <Topbar toggleTheme={() => setDarkMode(!darkMode)} darkMode={darkMode} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <StatsBar stats={stats} />
        <div className="flex flex-wrap justify-center gap-4 p-4 overflow-x-auto">
          <Column title="To Do" tasks={tasks} status="todo" onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />
          <Column title="In Progress" tasks={tasks} status="inProgress" onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />
          <Column title="Done" tasks={tasks} status="done" onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>
      <TaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} editingTask={editingTask} />
    </div>
  );
};

export default Dashboard;

