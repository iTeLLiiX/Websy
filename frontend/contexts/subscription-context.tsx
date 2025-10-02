'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface Subscription {
  id: string
  plan: 'FREE' | 'PRO'
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

interface SubscriptionContextType {
  subscription: Subscription | null
  isLoading: boolean
  isPro: boolean
  isFree: boolean
  canUseFeature: (feature: string) => boolean
  getUpgradeMessage: (feature: string) => string
  checkLimits: (type: 'websites' | 'pages' | 'storage') => { canUse: boolean; limit: number; used: number }
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.data)
      } else {
        // Default to free subscription
        setSubscription({
          id: 'free',
          plan: 'FREE',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        })
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
      // Default to free subscription
      setSubscription({
        id: 'free',
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isPro = subscription?.plan === 'PRO'
  const isFree = subscription?.plan === 'FREE'

  const canUseFeature = (feature: string): boolean => {
    if (isPro) return true

    const freeFeatures = [
      'create_website',
      'basic_templates',
      'drag_drop',
      'responsive_design',
      'ssl_certificate',
      'basic_widgets',
      'websy_branding'
    ]

    return freeFeatures.includes(feature)
  }

  const getUpgradeMessage = (feature: string): string => {
    const messages: Record<string, string> = {
      'custom_domain': 'Verbinde deine eigene Domain mit Websy Pro',
      'remove_branding': 'Entferne das Websy-Branding mit Pro',
      'unlimited_pages': 'Erstelle unbegrenzte Seiten mit Pro',
      'premium_templates': 'Zugang zu Premium-Templates mit Pro',
      'online_shop': 'Starte einen Online-Shop mit Pro',
      'seo_analytics': 'SEO-Tools und Analytics mit Pro',
      'premium_support': 'Premium-Support mit Pro'
    }

    return messages[feature] || 'Dieses Feature ist in Websy Pro enthalten'
  }

  const checkLimits = (type: 'websites' | 'pages' | 'storage') => {
    if (isPro) {
      return { canUse: true, limit: -1, used: 0 } // Unlimited for Pro
    }

    const limits = {
      websites: { limit: 1, used: 0 }, // Will be fetched from API
      pages: { limit: 3, used: 0 },
      storage: { limit: 100, used: 0 } // 100MB for free
    }

    return {
      canUse: limits[type].used < limits[type].limit,
      limit: limits[type].limit,
      used: limits[type].used
    }
  }

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    isPro,
    isFree,
    canUseFeature,
    getUpgradeMessage,
    checkLimits
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
