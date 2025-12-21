import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Loading } from '@/components/ui/Loading'
import toast from 'react-hot-toast'
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  
  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await authAPI.forgotPassword({
        email: data.email,
      })
      
      if (response.data.success) {
        setEmailSent(true)
        toast.success('Password reset link sent to your email!')
      } else {
        toast.error(response.data.message || 'Failed to send reset link')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
            Register4u Pro
          </h1>
          <p className="text-gray-600">Event Management System</p>
        </div>
        
        {/* Forgot password form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {!emailSent ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div>
                  <Label htmlFor="email" required>Email Address</Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      error={errors.email}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                
                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loading size="sm" className="border-white border-t-transparent" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
                
                {/* Back to login */}
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to login
                </Link>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to your email address. Please check your inbox.
              </p>
              <Link to="/login">
                <Button className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          © 2025 Register4u Pro. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword

