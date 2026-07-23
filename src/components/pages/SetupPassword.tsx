import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, Eye, EyeSlash } from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import NavBar from '../organs/NavBar'
import Footer from '../organs/Footer'
import { authService } from '../../services/api'

const SetupPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { 
    email: string; 
    reservationId: number; 
    ticketNumber?: string; 
    passengerInfo?: any 
  }

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!state?.email || !state?.reservationId) {
    navigate('/')
    return null
  }

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return 'Password must contain at least 8 characters'
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const passwordError = validatePassword(password)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Create or update user account with password
      const response = await fetch('http://localhost:8000/api/auth/setup-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: state.email,
          password: password,
          password_confirmation: confirmPassword,
          name: state.passengerInfo ? `${state.passengerInfo.firstName} ${state.passengerInfo.lastName}` : '',
          first_name: state.passengerInfo?.firstName || '',
          phone: state.passengerInfo?.phone || '',
          gender: state.passengerInfo?.gender || 'M',
          cni_number: state.passengerInfo?.cni || '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Account setup failed')
      }

      // Save token and user data
      if (data.data?.token) {
        authService.setToken(data.data.token)
        authService.setUser(data.data.user)
      }

      toast.success('Account set up successfully!')

      // Redirect to ticket page
      setTimeout(() => {
        if (state.ticketNumber) {
          navigate('/ticket', {
            state: {
              ticketNumber: state.ticketNumber,
              reservationId: state.reservationId,
            },
          })
        } else {
          navigate('/traveler-dashboard')
        }
      }, 1500)
    } catch (error: any) {
      console.error('Account setup error:', error)
      toast.error(error.message || 'Error setting up account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-primary-50 via-secondary-50 to-pink-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} weight="fill" className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Set Up Your Password
              </h1>
              <p className="text-gray-600 text-sm">
                Your reservation is confirmed! Create a password to access your account.
              </p>
            </div>

            {/* Email Display */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600">Account Email:</p>
              <p className="font-semibold text-gray-900">{state.email}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p className={password.length >= 8 ? 'text-green-600' : ''}>
                    • At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                    • At least one uppercase letter
                  </p>
                  <p className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                    • At least one lowercase letter
                  </p>
                  <p className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                    • At least one number
                  </p>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs text-red-600">
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} weight="fill" /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:from-primary-dark hover:to-secondary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Activating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} weight="fill" />
                    Activate My Account
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                You can use this email and password to log in to your traveler dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default SetupPassword
