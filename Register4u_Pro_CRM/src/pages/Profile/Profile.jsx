import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Loading } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const handleUpdateProfile = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast.success('Profile updated successfully!')
      setLoading(false)
    }, 1000)
  }
  
  const handleChangePassword = (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    setTimeout(() => {
      toast.success('Password changed successfully!')
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' })
      setLoading(false)
    }, 1000)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your profile information</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <UserCircleIcon className="h-16 w-16 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.username || 'User'}</h2>
              <p className="text-gray-600 mt-1">{user?.email || 'user@example.com'}</p>
              <Badge variant="success" className="mt-3">Active</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Update Profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" className="mt-1" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" className="mt-1" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <><Loading size="sm" className="border-white border-t-transparent" /> Updating...</> : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" className="mt-1" value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" className="mt-1" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" className="mt-1" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loading size="sm" className="border-white border-t-transparent" /> Changing...</> : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile

