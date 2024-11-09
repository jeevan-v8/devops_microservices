'use client';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Share, MoreVertical, Star, Trash2, X, Copy, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}


// Import the key from Base64 input
async function importKeyFromBase64(base64Key: string) {
  const rawKey = base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

function base64ToUtf8(base64String : string ) {
  // Decode Base64 to a byte string
  const byteString = atob(base64String);
  
  // Convert byte string to UTF-8
  const utf8String = decodeURIComponent(
    Array.from(byteString)
      .map(byte => '%' + ('00' + byte.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  
  return utf8String;
}

// Decrypt data using AES-GCM
async function decryptAESGCM(encrypted_data: string, iv: string, key: string) {
  const decoder = new TextDecoder();
  const converted_data = base64ToUtf8(encrypted_data);
  const converted_iv = base64ToUtf8(iv);
  console.log(converted_data,converted_iv);
  const encodedKey = await importKeyFromBase64(key);

  const decodedIv = Uint8Array.from(atob(converted_iv), c => c.charCodeAt(0));
  const decodedEncryptedData = Uint8Array.from(atob(converted_data), c => c.charCodeAt(0));

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(decodedIv) },
    encodedKey,
    new Uint8Array(decodedEncryptedData)
  );

  return decoder.decode(decrypted);
}

interface PasswordComponentProps {
  onClose: () => void;
  encrypted_data: string;
  iv: string;
  name: string;
  secret_id : number;
}

const PasswordComponent : React.FC<PasswordComponentProps> = ({ onClose, encrypted_data, iv, name ,secret_id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [Name, setName] = useState(name);
  const [password, setPassword] = useState("");
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user_email, setEmail] = useState('');
  const [permission, setPermission] = useState('read-only');

  useEffect(() => {
    setName(name); // Update Name when the name prop changes
  }, [name]);

    // AES-GCM encryption function
    const encryptData = async (key: CryptoKey, data: string): Promise<{ encryptedData: Uint8Array, iv: Uint8Array }> => {
      try {
        const enc = new TextEncoder();
        const encodedData = enc.encode(data);
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Generate random IV for AES-GCM
  
        const encryptedData = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          key,
          encodedData
        );
  
        return {
          encryptedData: new Uint8Array(encryptedData),
          iv
        };
      } catch (error) {
        console.error("Encryption error:", error);
        throw error;
      }
    }

  useEffect(() => {
    const decryptData = async () => {
      try {
        const decryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        if (!decryptionKey) {
          throw new Error("Decryption key not found.");
        }

        const decryptedData = await decryptAESGCM(encrypted_data, iv , decryptionKey);
        
        const { username, password } = JSON.parse(decryptedData);
        setUsername(username);
        setPassword(password);
        console.log(encrypted_data);
      } catch (error) {
        console.error("Failed to decrypt data:", error);
      }
    };

    decryptData();
  }, [encrypted_data, iv]);

  const handleShare = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Your session expired, please log in again.');
      }

      const body = JSON.stringify({ secret_id, user_email, permission });

      const response = await fetch('v1/secret/share/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body
      });

      console.log("Sharing request body:", body);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to share');
      }
    } catch (error) {
      console.error('Error sharing secret:', error);
    }
  };

  const handleDelete = async() =>{
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const body = JSON.stringify({secret_id})

      const response = await fetch('/v1/secrets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body
      });
      console.log(body);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete new secret');
      }
    } catch (error) {
      console.error('Error deleting secret:', error);
    }
    setIsModalOpen(false);

  };
  

  const handleEdit = () => setIsEditing(!isEditing);
  

  const handleSave = async () => {
    setIsEditing(false);
    try {
      const encryptionKeyBase64 = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
      if (!encryptionKeyBase64) {
        throw new Error("Encryption key is not configured.");
      }

      const rawKey = Uint8Array.from(atob(encryptionKeyBase64), c => c.charCodeAt(0));
      const cryptoKey = await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt", "decrypt"]);

      const { encryptedData, iv } = await encryptData(cryptoKey, `{"password":"${password}","username":"${username}"}`);
      const updateSecret = {
        secret_id,
        name: Name,
        encrypted_data: btoa(String.fromCharCode(...Array.from(encryptedData))),
        iv: btoa(String.fromCharCode(...Array.from(iv)))
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const response = await fetch('/v1/secrets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateSecret)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update secret');
      }

      toast({
        title: "Success",
        description: "Secret updated successfully",
      });
    } catch (error) {
      console.error("Error saving secret:", error);
      toast({
        title: "Error",
        description: "Failed to save secret. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };
  const handleCancel = () => {
    setIsEditing(false);
    setName(name); // Revert any changes made to Name
  };

  const copyToClipboard = async (text: string, field: 'username' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      if (field === 'username') {
        setCopiedUsername(true);
        setTimeout(() => setCopiedUsername(false), 2000);
      } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      }
      toast({
        title: "Copied!",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} copied to clipboard.`,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full bg-slate-950 border-none text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 m-0 p-4 ">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">User</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-400">Personal</Button>
          <Button variant="ghost" size="icon" className="text-gray-400" onClick={() => setIsModalOpen(true)}><Share className="h-4 w-4" /></Button>
          {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-80">
            
            {/* Email Input */}
            <input
              type="email"
              placeholder="Enter user email"
              value={user_email}
              onChange={(e) => setEmail(e.target.value)}
              className=" bg-gray-800 rounded p-2 w-full mb-4"
            />
            
            {/* Permission Dropdown */}
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="bg-gray-800 rounded p-2 w-full mb-4"
            >
              <option value="read-only">read-only</option>
              <option value="read-write">read-write</option>
            </select>
            <div className="grid">
                {/* Share Button */}
                <button onClick={handleShare} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Share
                </button>
                
                {/* Close Modal Button */}
                <button onClick={() => setIsModalOpen(false)} className="mt-2 text-gray-500">
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
          <Button variant="ghost" size="icon" className="text-gray-400" onClick={handleEdit}><Edit className="h-4 w-4" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 text-white">
              <DropdownMenuItem className="focus:bg-gray-700"><Star className="mr-2 h-4 w-4" /><span>Add to favorites</span></DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-700"><Trash2 className="mr-2 h-4 w-4" /><button onClick={handleDelete}>Delete</button></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="text-gray-400" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center space-x-4">
        {isEditing ? (
            <Input
              id="Name"
              value={Name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border-none text-white flex-grow"
            />
          ) : (
            <h2 className="text-xl font-semibold">{Name}</h2>
          )}
        </div>
        <div className="border border-gray-800 rounded-lg">
          <div className="p-3">
            <label htmlFor="username" className="text-xs text-gray-400">Username</label>
            <div className="flex items-center mt-1">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-none text-white flex-grow"
                readOnly={!isEditing}
              />
              <Button variant="ghost" size="icon" className="ml-2 text-gray-400" onClick={() => copyToClipboard(username, 'username')}>
                {copiedUsername ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Separator className="bg-gray-800" />
          <div className="p-3">
            <label htmlFor="password" className="text-xs text-gray-400">Password</label>
            <div className="flex items-center mt-1">
              <Input
                id="password"
                type={isEditing ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-none text-white flex-grow"
                readOnly={!isEditing}
              />
              <Button variant="ghost" size="icon" className="ml-2 text-gray-400" onClick={() => copyToClipboard(password, 'password')}>
                {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        {isEditing && (
          <div className="flex space-x-2">
            <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={handleSave}>Save Changes</Button>
            <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={handleCancel}>Cancel</Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">Last edited Friday, August 30, 2024 at 12:22:59 PM</p>
      </CardFooter>
    </Card>
  );
};
export default  PasswordComponent;


