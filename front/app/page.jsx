"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-900 tracking-tight mb-4">
          Task Management for Small Teams
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Streamline collaboration, assign tasks, and track progress with ease. Built for small teams to stay organized and productive.
        </p>
        <button
          onClick={handleDashboardClick}
          className="cursor-pointer bg-indigo-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition duration-300 text-lg font-medium"
        >
          {isAuthenticated ? "Go to Dashboard" : "Get Started"}
        </button>
      </div>
      <div className="mt-12 opacity-20 text-indigo-500 text-9xl hidden md:block">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-32 w-32"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
    </div>
  );
}