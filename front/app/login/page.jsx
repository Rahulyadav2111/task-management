"use client"
import {useState} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Login = () => {
    const router = useRouter();
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");
    
    const handleSubmit = async (e)=>{
        e.preventDefault()
        try{
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({email, password})
            })
            if(res.ok){
                const data = await res.json();
                const token = data.token;

                localStorage.setItem('token', token);
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiry = new Date(payload.exp*1000);
                localStorage.setItem('expiry', expiry.toString());
                router.push("/dashboard");
            }else{
                const errorData = await res.json();
                alert(errorData.message ||"Login Failed");
            }
        }catch(error){
            alert("Something went wrong! Please try again later");
        }
    }
  return (
    <div className='min-h-screen flex items-center justify-center bg-[#E9E7FF]'>
        <form className='flex flex-col gap-4 bg-white p-12 rounded shadow-md' onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-center text-[#312C85]">Login</h2>
            <input type="email" placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} className='border-2 border-blue-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300'/>
            <input type="password" placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} className="border-2 border-blue-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"/>
            <button type='submit' className='bg-[#4F39F6] text-white rounded px-4 py-2 hover:bg-[#4f39f6d6] font-semibold cursor-pointer'>Submit</button>
            <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
        </form>
    </div>
  )
}

export default Login
