import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { employeeAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Loading, PageLoading } from '@/components/ui/Loading'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const EditEmployee = () => {
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()
  
  useEffect(() => {
    fetchEmployee()
  }, [id])
  
  const fetchEmployee = async () => {
    try {
      const response = await employeeAPI.getById(id)
      if (response.data.success) {
        reset(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch employee details')
      navigate('/employee')
    } finally {
      setPageLoading(false)
    }
  }
  
  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await employeeAPI.update(id, data)
      
      if (response.data.success) {
        toast.success('Employee updated successfully!')
        navigate('/employee')
      } else {
        toast.error(response.data.message || 'Failed to update employee')
      }
    } catch (error) {
      toast.error('Failed to update employee')
    } finally {
      setLoading(false)
    }
  }
  
  if (pageLoading) {
    return <PageLoading />
  }
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link to="/employee">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
          <p className="text-gray-600 mt-1">Update employee information</p>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" required>Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  className="mt-1"
                  error={errors.name}
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" required>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  className="mt-1"
                  error={errors.email}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone" required>Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  className="mt-1"
                  error={errors.phone}
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Phone must be 10 digits',
                    },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  type="text"
                  placeholder="Enter designation"
                  className="mt-1"
                  {...register('designation')}
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="Enter department"
                  className="mt-1"
                  {...register('department')}
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  className="mt-1"
                  {...register('status')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
            
            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter address"
                className="mt-1"
                {...register('address')}
              />
            </div>
            
            {/* Form actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Link to="/employee">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loading size="sm" className="border-white border-t-transparent" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Employee'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default EditEmployee

