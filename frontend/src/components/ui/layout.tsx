'use client'

import { useState } from "react"
import { usePathname  } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, User, Users, Share2, Key } from "lucide-react"


const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isActive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive: boolean;
}) => {
  return (
    <Link href={href} passHref>
      <div className={`relative group ${isActive ? 'bg-gray-800' : ''}`}>
        <div className="p-3 hover:bg-gray-800 rounded-lg transition-colors duration-200">
          <Icon className={`h-6 w-6 ${isActive ? 'text-blue-500' : 'text-white'}`} />
        </div>
        <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {label}
        </span>
      </div>
    </Link>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)


  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className={`bg-slate-950 ${isSidebarOpen ? 'w-16' : 'w-0'} min-h-screen flex flex-col items-center py-8 border-r border-gray-800 transition-all duration-300`}>
      <div className="mb-8">
          <Key className="h-8 w-8"></Key>
      </div>
        <nav className="space-y-4">
          <SidebarItem icon={Home} label="Home" href="/" isActive={pathname === '/'} />
          <SidebarItem icon={User} label="Personal" href="/personal" isActive={pathname === '/personal'} />
          <SidebarItem icon={Users} label="Groups" href="/groups" isActive={pathname === '/groups'} />
          <SidebarItem icon={Share2} label="Shared" href="/shared" isActive={pathname === '/shared'} />
        </nav>
      </aside>

      <div className="flex-1">
        <header className="bg-slate-950 shadow border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white flex items-center">
                 DevVault
              </h1>
            </div>
            <Avatar>
              <AvatarImage src="https://avatars.dicebear.com/api/initials/username.svg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};