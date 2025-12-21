import React, { useEffect, useState } from 'react'
import { categoryAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Loading, PageLoading } from '@/components/ui/Loading'
import { useMinimumLoading } from '@/hooks/useMinimumLoading'
import toast from 'react-hot-toast'
import { PlusIcon } from '@heroicons/react/24/outline'

const Category = () => {
  const [categories, setCategories] = useState([])
  const [loading, withMinimumLoading] = useMinimumLoading(600)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  
  useEffect(() => {
    fetchCategories()
  }, [])
  
  const fetchCategories = async () => {
    await withMinimumLoading(async () => {
      const response = await categoryAPI.getAll()
      if (response.data.success) {
        setCategories(response.data.data || [])
        setInitialLoad(false)
      }
    }).catch(error => {
      toast.error('Failed to fetch categories')
      setInitialLoad(false)
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Category name is required')
      return
    }
    
    setSubmitting(true)
    try {
      const response = await categoryAPI.create(formData)
      if (response.data.success) {
        toast.success('Category added successfully!')
        setFormData({ name: '', description: '' })
        fetchCategories()
      }
    } catch (error) {
      toast.error('Failed to add category')
    } finally {
      setSubmitting(false)
    }
  }
  
  // Show full page loader on initial load
  if (loading && initialLoad) {
    return <PageLoading />
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage organization categories</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Add Category</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" required>Category Name</Label>
                <Input id="name" type="text" placeholder="Enter name" className="mt-1" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" type="text" placeholder="Enter description" className="mt-1" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loading size="sm" className="border-white border-t-transparent" /> Adding...</> : <><PlusIcon className="h-4 w-4 mr-2" /> Add Category</>}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Category List</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading...</p>
            ) : categories.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No categories found</p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">#{category.id}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Category

