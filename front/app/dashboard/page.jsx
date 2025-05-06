"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { BellIcon } from "@heroicons/react/24/solid";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({
    status: "",
    priority: "",
    dueDateStart: "",
    dueDateEnd: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const router = useRouter();

  // Get token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Decode token to get userId
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded token payload:", payload);
        if (payload.exp * 1000 < Date.now()) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        setUserId(payload.userId);
      } catch (err) {
        setError("Invalid token. Please log in again.");
        console.error("Token decode error:", err);
        localStorage.removeItem("token");
        router.push("/login");
      }
    } else {
      setError("Please log in to access the dashboard.");
      router.push("/login");
    }
  }, [token, router]);

  // Axios instance with token
  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch tasks
  const fetchTasks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get("/tasks");
      console.log("Fetched tasks:", res.data);
      const taskList = Array.isArray(res.data) ? res.data : [];
      setTasks(taskList);
      setFilteredTasks(taskList);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch tasks";
      setError(errorMsg);
      console.error("Fetch tasks error:", err, "Response:", err.response);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get("/auth/users");
      console.log("Fetched users:", res.data);
      const userList = Array.isArray(res.data) ? res.data : [];
      setUsers(userList);
      if (userList.length === 0) {
        setError("No users found. Check backend /auth/users endpoint.");
      }
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch users";
      setError(errorMsg);
      console.error("Fetch users error:", err, "Response:", err.response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTasks();
      fetchUsers();
    }
  }, [userId]);

  // Handle search and filter
  useEffect(() => {
    let filtered = tasks;
    
    // Search by title or description
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (filter.status) {
      filtered = filtered.filter((task) => task.status === filter.status);
    }

    // Filter by priority
    if (filter.priority) {
      filtered = filtered.filter((task) => task.priority === filter.priority);
    }

    // Filter by due date range
    if (filter.dueDateStart || filter.dueDateEnd) {
      filtered = filtered.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const start = filter.dueDateStart ? new Date(filter.dueDateStart) : null;
        const end = filter.dueDateEnd ? new Date(filter.dueDateEnd) : null;
        return (
          (!start || dueDate >= start) &&
          (!end || dueDate <= end)
        );
      });
    }

    setFilteredTasks(filtered);
    console.log("Filtered tasks:", filtered);
  }, [searchQuery, filter, tasks]);

  // Delete task
  const handleDelete = async (id) => {
    if (!userId) {
      setError("Please log in");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.delete(`/tasks/${id}`);
      console.log("Task deleted:", res.data);
      fetchTasks();
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete task";
      setError(errorMsg);
      console.error("Delete task error:", err, "Response:", err.response);
    } finally {
      setLoading(false);
    }
  };

  // Edit task
  const handleEdit = (task) => {
    router.push(`/dashboard/createtask?edit=${task._id}`);
  };

  // Navigate to Create Task
  const handleCreateTask = () => {
    router.push("/dashboard/createtask");
  };

  // Navigate to Home
  const handleHome = () => {
    router.push("/");
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const today = new Date();
  const overdueTasks = filteredTasks.filter((task) => {
    if (!task.dueDate) return false;
    try {
      const dueDate = new Date(task.dueDate);
      const isOverdue = dueDate < today && task.status !== "Completed";
      console.log(`Task ${task.title}: dueDate=${task.dueDate}, isOverdue=${isOverdue}`);
      return isOverdue;
    } catch (err) {
      console.error(`Invalid dueDate for task ${task._id}:`, task.dueDate);
      return false;
    }
  });
  const createdByMe = filteredTasks.filter((task) => task.createdBy?._id === userId);
  const assignedToMe = filteredTasks.filter((task) => task.assignedTo?._id === userId);

  // Find the newest assigned task
  const newestAssignedTask = assignedToMe.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  console.log("Tasks filtered - Created:", createdByMe, "Assigned:", assignedToMe, "Overdue:", overdueTasks);

  if (!token || !userId) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-6 md:p-10">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 space-y-4 sm:space-y-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 tracking-tight text-center sm:text-left">
          Task Dashboard
        </h1>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={toggleNotificationDropdown}
              className="relative bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 cursor-pointer"
            >
              <BellIcon className="h-6 w-6" />
              {newestAssignedTask && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotificationDropdown && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-lg p-4 z-10 max-w-[90vw]">
                <h3 className="text-base sm:text-lg font-semibold text-indigo-900 mb-2">
                  Newest Assigned Task
                </h3>
                {newestAssignedTask ? (
                  <div className="text-sm text-gray-600">
                    <p><strong>Task:</strong> {newestAssignedTask.title}</p>
                    <p><strong>Assigned By:</strong> {newestAssignedTask.createdBy?.name || "Unknown"}</p>
                    <p><strong>Assigned On:</strong> {format(new Date(newestAssignedTask.createdAt), "PPP")}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No new assigned tasks.</p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleCreateTask}
            className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 cursor-pointer w-full sm:w-auto"
          >
            Create Task
          </button>
          <button
            onClick={handleHome}
            className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 cursor-pointer w-full sm:w-auto"
          >
            Home
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-lg animate-pulse">
          {error}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-lg transition-opacity duration-500">
          {notifications.map((note, index) => (
            <div key={index} className="mb-2">{note}</div>
          ))}
        </div>
      )}

      {/* Search and Filter Section */}
      <section className="mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-4">Search & Filter Tasks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by title or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={filter.dueDateStart}
              onChange={(e) => setFilter({ ...filter, dueDateStart: e.target.value })}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
              placeholder="Due Date Start"
            />
            <input
              type="date"
              value={filter.dueDateEnd}
              onChange={(e) => setFilter({ ...filter, dueDateEnd: e.target.value })}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
              placeholder="Due Date End"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks You Created */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-6">Tasks You Created</h2>
          {createdByMe.length === 0 && (
            <p className="text-gray-500 italic">No tasks created yet!</p>
          )}
          {createdByMe.map((task) => (
            <div
              key={task._id}
              className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <h3 className="text-lg font-semibold text-indigo-800">{task.title}</h3>
              <p className="text-gray-600">{task.description}</p>
              <p className="text-sm text-gray-500">
                Due: {task.dueDate ? format(new Date(task.dueDate), "PPP") : "No due date"}
              </p>
              <p className="text-sm text-gray-500">Priority: {task.priority}</p>
              <p className="text-sm text-gray-500">Status: {task.status}</p>
              <p className="text-sm text-gray-500">
                Assigned To: {task.assignedTo?.name || "None"}
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleEdit(task)}
                  className="cursor-pointer bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition transform hover:scale-105"
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="cursor-pointer bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition transform hover:scale-105"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Tasks Assigned to You */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-6">Tasks Assigned to You</h2>
          {assignedToMe.length === 0 && (
            <p className="text-gray-500 italic">No tasks assigned to you! 🎉</p>
          )}
          {assignedToMe.map((task) => (
            <div
              key={task._id}
              className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <h3 className="text-lg font-semibold text-indigo-800">{task.title}</h3>
              <p className="text-gray-600">{task.description}</p>
              <p className="text-sm text-gray-500">
                Due: {task.dueDate ? format(new Date(task.dueDate), "PPP") : "No due date"}
              </p>
              <p className="text-sm text-gray-500">Priority: {task.priority}</p>
              <p className="text-sm text-gray-500">Status: {task.status}</p>
              <p className="text-sm text-gray-500">
                Assigned By: {task.createdBy?.name || "Unknown"}
              </p>
            </div>
          ))}
        </section>

        {/* Overdue Tasks */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-6">Overdue Tasks</h2>
          {overdueTasks.length === 0 && (
            <p className="text-gray-500 italic">No overdue tasks! 🎉</p>
          )}
          {overdueTasks.map((task) => (
            <div
              key={task._id}
              className="border border-red-300 p-4 rounded-lg mb-4 bg-red-50 hover:bg-red-100 transition-colors duration-200"
            >
              <h3 className="text-lg font-semibold text-indigo-800">{task.title}</h3>
              <p className="text-gray-600">{task.description}</p>
              <p className="text-sm text-red-600">
                Due: {task.dueDate ? format(new Date(task.dueDate), "PPP") : "No due date"}
              </p>
              <p className="text-sm text-gray-500">Status: {task.status}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;