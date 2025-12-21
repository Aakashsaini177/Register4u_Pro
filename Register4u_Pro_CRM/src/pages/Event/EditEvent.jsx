import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { eventAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Loading, PageLoading } from '@/components/ui/Loading'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const EditEvent = () => {
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  
  useEffect(() => {
    fetchEvent()
  }, [id])
  
  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getById(id)
      if (response.data.success) {
        const event = response.data.data
        // Format date for input field
        const formattedData = {
          ...event,
          name: event.eventName || event.name,
          date: event.StartTime ? event.StartTime.split('T')[0] : '',
        }
        reset(formattedData)
      } else {
        toast.error('Event not found')
        navigate('/event')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to fetch event details')
      navigate('/event')
    } finally {
      setPageLoading(false)
    }
  }
  
  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await eventAPI.update(id, data)
      if (response.data.success) {
        toast.success('Event updated successfully!')
        navigate('/event')
      } else {
        toast.error(response.data.message || 'Failed to update event')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update event')
    } finally {
      setLoading(false)
    }
  }
  
  if (pageLoading) {
    return <PageLoading />
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/event">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600 mt-1">Update event information</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" required>Event Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Enter name" 
                  className="mt-1" 
                  error={errors.name}
                  {...register('name', { required: 'Name is required' })} 
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="date" required>Event Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  className="mt-1" 
                  error={errors.date}
                  {...register('date', { required: 'Date is required' })} 
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  type="text" 
                  placeholder="Enter location" 
                  className="mt-1" 
                  {...register('location')} 
                />
              </div>
              
              <div>
                <Label htmlFor="organizer">Organizer</Label>
                <Input 
                  id="organizer" 
                  type="text" 
                  placeholder="Enter organizer" 
                  className="mt-1" 
                  {...register('organizer')} 
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status" 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  {...register('status')}
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter description" 
                className="mt-1" 
                {...register('description')} 
              />
            </div>
            
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Link to="/event">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loading size="sm" className="border-white border-t-transparent" /> 
                    Updating...
                  </>
                ) : (
                  'Update Event'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default EditEvent
