"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

import { useRouter } from 'next/navigation'
import Link from "next/link"


export default function PasswordManagerDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [refresh, ] = useState(false);

  const router = useRouter()

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error fetching passwords:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [router,refresh]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div  className="min-h-screen bg-slate-950 text-white flex"> 
      <div className="pt-[40%] pl-[10%]">
         <h1 className=" text-3xl pb-10">hi user,,,if you are here click on LogOut , then login again to access notes or click on this link to access {' '}
        <Link href="/notes" className="underline">
          NOTES
        </Link>
         </h1>
        <Button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
          Logout
        </Button>
      </div>
    </div>

  )
}
