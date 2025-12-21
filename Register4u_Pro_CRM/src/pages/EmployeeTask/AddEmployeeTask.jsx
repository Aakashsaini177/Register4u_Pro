import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const AddEmployeeTask = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/employee-task"><Button variant="ghost" size="icon"><ArrowLeftIcon className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Employee Task</h1>
          <p className="text-gray-600 mt-1">Create a new task</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Task Form</CardTitle></CardHeader>
        <CardContent><p className="text-gray-600">Task form will be displayed here.</p></CardContent>
      </Card>
    </div>
  )
}

export default AddEmployeeTask

