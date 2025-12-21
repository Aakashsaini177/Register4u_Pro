import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeTaskAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { TableSkeleton, PageLoading } from '@/components/ui/Loading'
import { useMinimumLoading } from '@/hooks/useMinimumLoading'
import toast from 'react-hot-toast'
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

const EmployeeTask = () => {
  const [tasks, setTasks] = useState([])
  const [loading, withMinimumLoading] = useMinimumLoading(600)
  const [searchTerm, setSearchTerm] = useState('')
  const [initialLoad, setInitialLoad] = useState(true)
  
  useEffect(() => {
    fetchTasks()
  }, [])
  
  const fetchTasks = async () => {
    await withMinimumLoading(async () => {
      const response = await employeeTaskAPI.getAll()
      if (response.data.success) {
        setTasks(response.data.data || [])
        setInitialLoad(false)
      }
    }).catch(error => {
      toast.error('Failed to fetch tasks')
      setInitialLoad(false)
    })
  }
  
  // Show full page loader on initial load
  if (loading && initialLoad) {
    return <PageLoading />
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Employee Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage employee tasks</p>
        </div>
        <Link to="/employee-task/add">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Task
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Task List</CardTitle></CardHeader>
        <CardContent>
          {loading ? <TableSkeleton rows={5} columns={4} /> : (
            tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No tasks found</p>
                <Link to="/employee-task/add"><Button className="mt-4">Add your first task</Button></Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>#{task.id}</TableCell>
                      <TableCell>
                        <p className="font-medium">{task.taskName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{task.description || ''}</p>
                      </TableCell>
                      <TableCell>{task.employeeId || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={task.status === 'completed' ? 'success' : 'secondary'}>
                          {task.status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/employee-task/view/${task.id}`}><Button variant="ghost" size="icon"><EyeIcon className="h-4 w-4" /></Button></Link>
                          <Link to={`/employee-task/edit/${task.id}`}><Button variant="ghost" size="icon"><PencilIcon className="h-4 w-4" /></Button></Link>
                          <Button variant="ghost" size="icon"><TrashIcon className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeeTask

