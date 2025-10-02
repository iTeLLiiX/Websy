'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  ArrowRight, 
  X,
  Zap,
  Star
} from 'lucide-react'
import Link from 'next/link'

interface UpgradePromptProps {
  feature: string
  title: string
  description: string
  onUpgrade?: () => void
  onDismiss?: () => void
  variant?: 'banner' | 'card' | 'inline'
  showDismiss?: boolean
}

export default function UpgradePrompt({ 
  feature, 
  title, 
  description, 
  onUpgrade, 
  onDismiss,
  variant = 'card',
  showDismiss = true
}: UpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    if (onDismiss) {
      onDismiss()
    }
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      window.location.href = '/pricing'
    }
  }

  if (isDismissed) return null

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm opacity-90">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleUpgrade}
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Upgrade
            </Button>
            {showDismiss && (
              <button
                onClick={handleDismiss}
                className="text-white hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <Button
            onClick={handleUpgrade}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Upgrade
          </Button>
        </div>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <Badge className="bg-blue-600 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Pro Feature
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{description}</p>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleUpgrade}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Jetzt upgraden
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Link href="/pricing">
                  <Button variant="outline" size="sm">
                    Alle Preise
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {showDismiss && (
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
