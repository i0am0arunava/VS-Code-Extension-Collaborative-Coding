"use client"
import Link from "next/link";
import { useRouter } from "next/navigation"
import axios  from "axios"
import React from "react"
import { useState, useEffect } from "react";

export default function SignupPage() {

    const router = useRouter()
    const [disable, setdisable] = useState(false)
    const [loading, setloading] = useState(false)
    const [user, setUser] = useState({
   username:"",
   email:"",
   password:""
    })


    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
            setdisable(false);
        } else {
            setdisable(true)
        }
    }, [user])
    const onSignup = async () => {
        try { 
            setloading(true)
            const response =await axios.post("api/users/signup",user);
            console.log("signup success",response.data);
            router.push("/login")
        } catch (err){
         console.log(err)
        } finally {
      setloading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1>{loading ? "processing" : "signup"}</h1>
            <hr />
            <label htmlFor="username"> username</label>
            <input className="p-4 border border-gay-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black" type="text" id="username" placeholder="username" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} />


            <input className="p-4 border border-gay-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black" type="email" id="email"placeholder="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />


            <input className="p-4 border border-gay-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black" type="password" id="password" placeholder="password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} />
            <button className="p-2 border border-gray-300 mb-4 rounded-lg focus:outline-none focus:border-gray-600" onClick={onSignup}> {disable ? "no Signup" : "signup"}</button>
            <Link href="/login">visit login</Link>
        </div>
    )
}