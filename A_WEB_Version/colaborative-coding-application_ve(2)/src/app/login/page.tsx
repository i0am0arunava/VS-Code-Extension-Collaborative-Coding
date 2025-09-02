"use client"
import Link from "next/link";
import {useRouter} from "next/navigation"
import axios from "axios"
import React from "react"
import { useState,useEffect } from "react";
export default function Login(){
    const [user,setUser]=useState({
        email:"",
        password:""
        })



    const [disable, setdisable] = useState(false)
    const [loading, setloading] = useState(false)
    const router=useRouter()
    const onLogin=async()=>{
try{
  const response=await axios.post("/api/users/login",user)
  console.log(response.data)
  router.push("/profile")
}catch(err){
    console.log(err)
}finally{
setloading(false)
}
    }

  

        useEffect(() => {
            if (user.email.length > 0 && user.password.length > 0) {
                setdisable(false);
            } else {
                setdisable(true)
            }
        }, [user])
    return(
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1>{loading ? "processing" : "login"}</h1>
            <hr />
           


            <input className=" text-black p-4 border border-gay-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"type="email"id="email"value={user.email}onChange={(e)=>setUser({...user,email:e.target.value})}/>


            <input className=" text-black p-4 border border-gay-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"type="password"id="password"value={user.password}onChange={(e)=>setUser({...user,password:e.target.value})}/>
            <button className="p-2 border border-gray-300 mb-4 rounded-lg focus:outline-none focus:border-gray-600" onClick={onLogin} >  {disable ? "no Login" : "login"}</button>
            <Link href="/signup">visit signup</Link>
        </div>
    )
}