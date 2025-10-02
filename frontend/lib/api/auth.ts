import axios from 'axios'
import { User, Subscription, APIResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  async login(credentials: { email: string; password: string }) {
    const response = await api.post<APIResponse<{
      user: User
      subscription: Subscription
      token: string
    }>>('/login', credentials)
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Login failed')
    }
    
    return response.data.data
  },

  async register(userData: {
    name: string
    email: string
    password: string
    businessType?: string
  }) {
    const response = await api.post<APIResponse<{
      user: User
      subscription: Subscription
      token: string
    }>>('/register', userData)
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Registration failed')
    }
    
    return response.data.data
  },

  async logout() {
    await api.post('/logout')
  },

  async getCurrentUser() {
    const response = await api.get<APIResponse<{
      user: User
      subscription: Subscription
    }>>('/me')
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get user data')
    }
    
    return response.data.data
  },

  async updateProfile(updates: Partial<User>) {
    const response = await api.patch<APIResponse<User>>('/profile', updates)
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update profile')
    }
    
    return response.data.data
  },

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }) {
    const response = await api.patch<APIResponse>('/password', data)
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to change password')
    }
    
    return response.data
  },

  async forgotPassword(email: string) {
    const response = await api.post<APIResponse>('/forgot-password', { email })
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to send reset email')
    }
    
    return response.data
  },

  async resetPassword(data: {
    token: string
    password: string
  }) {
    const response = await api.post<APIResponse>('/reset-password', data)
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to reset password')
    }
    
    return response.data
  },

  async getSubscription() {
    const response = await api.get<APIResponse<Subscription>>('/subscription')
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get subscription')
    }
    
    return response.data.data
  },

  async cancelSubscription() {
    const response = await api.post<APIResponse>('/subscription/cancel')
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to cancel subscription')
    }
    
    return response.data
  },

  async reactivateSubscription() {
    const response = await api.post<APIResponse>('/subscription/reactivate')
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to reactivate subscription')
    }
    
    return response.data
  },

  async deleteAccount() {
    const response = await api.delete<APIResponse>('/account')
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete account')
    }
    
    return response.data
  },
}
