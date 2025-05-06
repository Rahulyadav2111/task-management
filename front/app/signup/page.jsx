"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const Signup = () => {
    const router = useRouter()
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) =>{
        e.preventDefault();

        try{
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body:JSON.stringify({name, email, password}),
            });
            if(res.ok){
                const data = await res.json();
                alert("Registered Successfully!");
                router.push("/login");
            }else{
                const errorData = await res.json();
                alert(errorData.message || "Registration failed");
            }
        }
        catch(error){
            alert("Something went wrong! Please try again later");
        }
    };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9E7FF]">
   <form className="bg-white p-12 rounded-lg shadow-md flex flex-col gap-4 w-80" onSubmit={handleSubmit}>
    <h2 className="text-2xl font-bold text-center text-[#312C85]">Sign Up</h2>

    <input
      type="text"
      placeholder="Name"
      value={name}
      onChange={(e)=>setName(e.target.value)}
      className="border-2 border-blue-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      required
    />

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
      className="border-2 border-blue-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      required
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
      className="border-2 border-blue-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      required
    />

    <button
      type="submit"
      className="bg-[#4F39F6] text-white rounded px-4 py-2 hover:bg-[#4f39f6d6] font-semibold cursor-pointer"
    >
      Submit
    </button>
    <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
  </form>
</div>

  )
}

export default Signup
