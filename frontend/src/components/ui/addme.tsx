"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface AddNewPasswordProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (newPassword: { name: string; encrypted_data: string; iv: string }) => void
}

const AddNewPassword: React.FC<AddNewPasswordProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // AES-GCM encryption function
  const encryptData = async (key: CryptoKey, data: string): Promise<{ encryptedData: Uint8Array, iv: Uint8Array }> => {
    const enc = new TextEncoder()
    const encodedData = enc.encode(data)
    const iv = window.crypto.getRandomValues(new Uint8Array(12)) // Generate random IV for AES-GCM

    const encryptedData = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encodedData
    )

    return {
      encryptedData: new Uint8Array(encryptedData),
      iv
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const encryptionKeyBase64 = process.env.NEXT_PUBLIC_ENCRYPTION_KEY // Get the key from environment variables
      if (!encryptionKeyBase64) {
        throw new Error("Encryption key is not configured.")
      }

      // Convert Base64 key to CryptoKey
      const rawKey = Uint8Array.from(atob(encryptionKeyBase64), c => c.charCodeAt(0))
      const cryptoKey = await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt", "decrypt"])

      // Encrypt username and password
      const { encryptedData, iv } = await encryptData(cryptoKey, `{"password":"${password}","username":"${username}"}`)

      const newSecret = {
        name,
        encrypted_data: btoa(String.fromCharCode(...Array.from(encryptedData))), // Convert to Base64 string
        iv: btoa(String.fromCharCode(...Array.from(iv))) // Convert IV to Base64 string
      }

      await onAdd(newSecret)

      // Reset form
      setName('')
      setUsername('')
      setPassword('')
      onClose()

      toast({
        title: "Success",
        description: "New secret added successfully",
      })
    } catch (error) {
      console.error("Error adding new secret:", error)
      toast({
        title: "Error",
        description: "Failed to add new secret. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Secret</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-400">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-400">Username</label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-400">Secret-Key</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Secret'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddNewPassword;