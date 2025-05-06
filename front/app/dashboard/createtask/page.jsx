"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const CreateTask = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
    assignedTo: "",
  });
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Decode token to get userId and check for edit mode
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
      setError("Please log in to access this page.");
      router.push("/login");
    }

    // Check for edit mode
    const editTaskId = searchParams.get("edit");
    if (editTaskId) {
      setEditingTaskId(editTaskId);
      fetchTask(editTaskId);
    }
  }, [token, router, searchParams]);

  // Axios instance with token
  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

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

  // Fetch task for editing
  const fetchTask = async (taskId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/tasks/${taskId}`);
      const task = res.data;
      console.log("Fetched task for edit:", task);
      setFormData({
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        priority: task.priority || "Medium",
        status: task.status || "Pending",
        assignedTo: task.assignedTo?._id || "",
      });
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch task";
      setError(errorMsg);
      console.error("Fetch task error:", err, "Response:", err.response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  // Handle form submission with validation
  const handleSubmit = async () => {
    if (!userId) {
      setError("Please log in");
      return;
    }
    if (!formData.title) {
      setError("Task title is required");
      return;
    }
    if (!formData.assignedTo) {
      setError("Please assign the task to a user");
      return;
    }
    setLoading(true);
    try {
      let notificationMessage;
      if (editingTaskId) {
        const res = await axiosInstance.put(`/tasks/${editingTaskId}`, formData);
        console.log("Task updated:", res.data);
        notificationMessage = `Task "${formData.title}" updated`;
      } else {
        const taskData = {
          ...formData,
          createdBy: userId,
        };
        console.log("Submitting task:", taskData);
        const res = await axiosInstance.post("/tasks", taskData);
        console.log("Task created:", res.data);
        const assignedUser = users.find((u) => u._id === formData.assignedTo);
        notificationMessage = `Task "${formData.title}" assigned to ${assignedUser?.name}${assignedUser?._id === userId ? " (You)" : ""}`;
      }
      setNotifications((prev) => [...prev, notificationMessage]);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 5000);

      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        status: "Pending",
        assignedTo: "",
      });
      setEditingTaskId(null);
      router.push("/dashboard");
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save task. Check backend configuration.";
      setError(errorMsg);
      console.error("Save task error:", err, "Response:", err.response);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to Dashboard
  const handleBack = () => {
    router.push("/dashboard");
  };

  if (!token || !userId) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6 md:p-10">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight">
          {editingTaskId ? "Edit Task" : "Create Task"}
        </h1>
        <button
          onClick={handleBack}
          className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 cursor-pointer"
        >
          Back to Dashboard
        </button>
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

      {/* Create/Edit Task Section */}
      <section className="mb-8 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-6">
          {editingTaskId ? "Edit Task" : "Create New Task"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <input
            type="text"
            placeholder="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
            disabled={loading}
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition col-span-1 md:col-span-2"
            rows="4"
            disabled={loading}
          />
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            disabled={loading}
          />
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            disabled={loading}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            disabled={loading}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            disabled={loading}
            required
          >
            <option value="" disabled>
              Select Assignee
            </option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSubmit}
            className="cursor-pointer bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-300 col-span-1 md:col-span-2 transform hover:scale-105"
            disabled={loading}
          >
            {loading ? "Processing..." : editingTaskId ? "Update Task" : "Create Task"}
          </button>
        </div>
      </section>

      {/* All Users Section */}
      <section className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-6">All Users</h2>
        {users.length === 0 && (
          <p className="text-gray-500 italic">No users found in the database.</p>
        )}
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user._id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="text-gray-700">{user.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default CreateTask;