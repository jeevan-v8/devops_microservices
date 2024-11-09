// app/register/page.tsx
"use client"

import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password != confirmPassword){
      setError("Password do not match")
      return;
    }
    setLoading(true);
    setError(null);
    const body = JSON.stringify({ email, password })
    console.log(body);
    try {
      const response = await fetch('/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
        body: body,
      });


      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      } else {
        router.push('/login');
      }


    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-black">Register Here!</h1>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className='grid relative'>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type= {isPasswordVisible ? "text":"password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1"
                    required
                 />
                    <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pt-6"
                     >
                    {isPasswordVisible ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                    </button>
                </div>
              </div>
              <div className='grid gap-2'>
               <div className='grid relative'>
                <label htmlFor="confirmPassword"> ConfirmPassword</label>
                 <input 
                  id='confirmPassword'
                  type={isPasswordVisible ? "text":"password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1"
                  required
                  />
                  <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pt-6"
                        >
                      {isPasswordVisible ? (
                           <EyeOffIcon className="h-5 w-5" />
                       ) : (
                           <EyeIcon className="h-5 w-5" />
                       )}
                  </button>
               </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;