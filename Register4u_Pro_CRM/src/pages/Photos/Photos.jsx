import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Loading } from '@/components/ui/Loading'
import { PhotoIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Photos = () => {
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState([])
  
  const handleUpload = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast.success('Photos uploaded successfully!')
      setLoading(false)
    }, 1000)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Photos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Upload and manage event photos</p>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Upload Photos</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="photos">Select Photos</Label>
              <Input id="photos" type="file" accept="image/*" multiple className="mt-1" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loading size="sm" className="border-white border-t-transparent" /> Uploading...</> : 'Upload Photos'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Photo Gallery</CardTitle></CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No photos uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Photos

