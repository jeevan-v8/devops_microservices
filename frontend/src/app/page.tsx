"use client"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import moment from 'moment';
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Key, Plus, Search, Home, User, Users, Share2 } from "lucide-react"
import PasswordComponent from "@/components/ui/password"
import AddNewPassword from "@/components/ui/addme"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

// Define TypeScript interfaces for better type safety
interface Password {
  id: number;
  name: string;
  username: string;
  created_at: string; // Store as ISO string
  encrypted_data?: string; // Optional if not always available
  iv?: string; // Optional if not always available
}

interface UserData {
  username: string;
}

const SidebarItem = ({
  icon: Icon,
  label,
  href, 
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string; 
}) => {
  return (
    <Link href={href} passHref>
      <div className="relative group cursor-pointer">
        <div className="p-3 hover:bg-gray-800 rounded-lg transition-colors duration-200">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {label}
        </span>
      </div>
    </Link>
  )
}

export default function PasswordManagerDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPasswordId, setSelectedPasswordId] = useState<number | null>(null)
  const [selectedPasswordData, setSelectedPasswordData] = useState<Password | null>(null);
  const [isAddNewOpen, setIsAddNewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [passwords, setPasswords] = useState<Password[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isNoSecrets, setIsNoSecrets] = useState(true)
  const [refresh, setRefresh] = useState(false);
  const [secrets, setSecrets] = useState([]);
  const router = useRouter()

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/v1/secrets/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch passwords.');
        }

        const data = await response.json();
        setSecrets(data);
        if (!data.data) {
          setIsNoSecrets(false)
        }
        data.data && setPasswords(data.data); // Assuming data.data contains the passwords
        setUserData(data.user); // Assuming user data is returned
      } catch (error) {
        console.error('Error fetching passwords:', error);
        toast({
          title: "Error",
          description: "Failed to fetch passwords. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPasswords();
  }, [router,refresh]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  }
  const filteredPasswords = (!isLoading) ? passwords.filter(
    (password) =>
      password.name && password.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) :  []

  const handlePasswordClick = (password: Password) => {
    // setRefresh((prev) => !prev);
    if (selectedPasswordId === password.id) {
      // If the same password is clicked again, close it
      setSelectedPasswordId(null);
      setSelectedPasswordData(null);
    } else {
      // Otherwise, open the new password
      setSelectedPasswordId(password.id);
      setSelectedPasswordData(password); 
    }
  };

  

  const handleAddNew = async (newPassword: { name: string; encrypted_data: string; iv: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const response = await fetch('/v1/secrets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newPassword),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add new secret');
      }

      const result = await response.json();
      setRefresh((prev) => !prev);
      // setPasswords(prevPasswords => [
      //   ...prevPasswords,
      //   {
      //     id: result.id,
      //     name: result.name,
      //     username: 'Hidden', // The actual username is encrypted
      //     created_at: new Date().toISOString(), // Use current date
      //   },
      // ]);

      setIsAddNewOpen(false);
      toast({
        title: "Success",
        description: "New secret added successfully",
      });
    } catch (error) {
      console.error('Error adding new secret:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add new secret. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div  className="min-h-screen bg-slate-950 text-white flex">
      <aside className="bg-slate-950 w-16 min-h-screen flex flex-col items-center py-8 border-r border-gray-800">
        <div className="mb-8">
          <Key className="h-8 w-8" />
        </div>
        <nav className="space-y-4">
          <SidebarItem icon={Home} label="Home" href="/" /> 
          <SidebarItem icon={User} label="Personal" href="/personal" /> 
          <SidebarItem icon={Users} label="Groups" href="/groups" /> 
          <SidebarItem icon={Share2} label="Shared" href="/shared" />
        </nav>
      </aside>

      <div className="flex-1 flex">
        <div className={`transition-all duration-300 ease-in-out mr-4 ${selectedPasswordId ? 'w-3/5' : 'w-full'}`}>
          <header className="bg-slate-950 shadow border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white flex items-center">DevVault</h1>
              <div className="flex items-center space-x-4">
                <span>Welcome , User </span>
                <Avatar>
                  <AvatarImage src={`https://avatars.dicebear.com/api/initials/${userData?.username}.svg`} alt={userData?.username} />
                  <AvatarFallback>{userData?.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button onClick={handleLogout} className="bg-slate-950 text-white">Logout</Button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search secrets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button className="ml-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddNewOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </div>

            <Card className="bg-gray-900 border border-gray-800 ">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-800">
                <CardTitle className="text-2xl font-bold text-white">Saved Secrets</CardTitle>
              </CardHeader>
              <CardContent className=" pt-4 overflow-y-auto h-[calc(100vh-150px)] ">
                <div className="space-y-4">
                  {filteredPasswords.length > 0 && filteredPasswords.map((password) => (
                    <div
                      key={password.id}
                      className="cursor-pointer p-4 bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded-md"
                      onClick={() => handlePasswordClick(password)}
                    >
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">{password.name}</h2>
                        <span className="text-sm text-gray-400">{moment(password.created_at).format('h:mm A MMM DD, YYYY')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
       <div className="ml-4">
        {selectedPasswordId && (
          <div className=" w-[38%] fixed right-0 top-0 border-l ml-0 pl-0 border-gray-900 bottom-0 p-4 ">
            {selectedPasswordData && (
              <PasswordComponent 
                       onClose={() => setSelectedPasswordId(null)} 
                       encrypted_data={selectedPasswordData.encrypted_data || ""} 
                       iv={selectedPasswordData.iv || ""} 
                       name={selectedPasswordData.name} 
                       secret_id = {selectedPasswordData.id}
                       
              />
            )}
          </div>
        )}
        </div>
        
      </div>

      <AddNewPassword isOpen={isAddNewOpen} onClose={() => setIsAddNewOpen(false)} onAdd={handleAddNew} />
    </div>
  )

}