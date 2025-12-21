import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const ViewEmployeeTask = () => {
  const { id } = useParams()
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/employee-task"><Button variant="ghost" size="icon"><ArrowLeftIcon className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Task #{id}</CardTitle></CardHeader>
        <CardContent><p className="text-gray-600">Task details here.</p></CardContent>
      </Card>
    </div>
  )
}

export default ViewEmployeeTask

