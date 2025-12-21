import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { employeeAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/Loading'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { formatDateTime } from '@/lib/utils'

const ViewEmployee = () => {
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()
  
  useEffect(() => {
    fetchEmployee()
  }, [id])
  
  const fetchEmployee = async () => {
    try {
      const response = await employeeAPI.getById(id)
      if (response.data.success) {
        setEmployee(response.data.data)
      } else {
        toast.error('Employee not found')
        navigate('/employee')
      }
    } catch (error) {
      toast.error('Failed to fetch employee details')
      navigate('/employee')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return
    }
    
    try {
      const response = await employeeAPI.delete(id)
      if (response.data.success) {
        toast.success('Employee deleted successfully')
        navigate('/employee')
      } else {
        toast.error('Failed to delete employee')
      }
    } catch (error) {
      toast.error('Failed to delete employee')
    }
  }
  
  if (loading) {
    return <PageLoading />
  }
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/employee">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
            <p className="text-gray-600 mt-1">View employee information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/employee/edit/${id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Employee details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="text-base font-medium">#{employee?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={employee?.status === 'active' ? 'success' : 'secondary'}>
                    {employee?.status || 'Active'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-base font-medium">{employee?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base font-medium">{employee?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-base font-medium">{employee?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Designation</p>
                  <p className="text-base font-medium">{employee?.designation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="text-base font-medium">{employee?.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-base font-medium">{formatDateTime(employee?.createdAt)}</p>
                </div>
              </div>
              
              {employee?.address && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="text-base">{employee.address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-base font-medium">{formatDateTime(employee?.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-base font-medium">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Tasks</p>
                <p className="text-base font-medium">0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ViewEmployee

