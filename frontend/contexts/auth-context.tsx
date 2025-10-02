'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Subscription } from '@/types'
import { authAPI } from '@/lib/api/auth'

interface AuthContextType {
  user: User | null
  subscription: Subscription | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshSubscription: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  businessType?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token')
      
      if (token) {
        const userData = await authAPI.getCurrentUser()
        setUser(userData.user)
        setSubscription(userData.subscription)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })
      
      localStorage.setItem('auth_token', response.token)
      setUser(response.user)
      setSubscription(response.subscription)
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data)
      
      localStorage.setItem('auth_token', response.token)
      setUser(response.user)
      setSubscription(response.subscription)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
      setSubscription(null)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authAPI.updateProfile(data)
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  const refreshSubscription = async () => {
    try {
      const sub = await authAPI.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Failed to refresh subscription:', error)
    }
  }

  const value: AuthContextType = {
    user,
    subscription,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshSubscription,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
