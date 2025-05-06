"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('expiry');

    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiry');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center py-4 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <Link href="/">
        <h1 className="text-2xl font-extrabold tracking-tight hover:text-indigo-200 transition-colors duration-200 cursor-pointer">
          TmsT
        </h1>
      </Link>

      <div className="flex items-center gap-6">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-600 transform hover:scale-105 transition duration-300 text-sm font-medium"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="text-white hover:text-indigo-200 text-sm font-medium transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-indigo-800 transform hover:scale-105 transition duration-300 text-sm font-medium"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </header>
  );
}