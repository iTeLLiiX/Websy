'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  CheckCircle, 
  X, 
  Star,
  ArrowRight,
  Zap,
  Lock
} from 'lucide-react'
import Link from 'next/link'

interface PaywallProps {
  feature: string
  title: string
  description: string
  onUpgrade?: () => void
  onClose?: () => void
  showClose?: boolean
}

export default function Paywall({ 
  feature, 
  title, 
  description, 
  onUpgrade, 
  onClose, 
  showClose = true 
}: PaywallProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      if (onUpgrade) {
        await onUpgrade()
      } else {
        // Redirect to pricing page
        window.location.href = '/pricing'
      }
    } finally {
      setIsUpgrading(false)
    }
  }

  const proFeatures = [
    'Eigene Domain verbinden',
    'Branding entfernen',
    'Unbegrenzte Seiten',
    'Premium-Templates',
    'Online-Shop',
    'SEO & Analytics',
    'Premium-Support'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardHeader className="text-center pb-4">
          {showClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Feature Preview */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature}
            </h3>
            <p className="text-gray-600">
              Dieses Feature ist in Websy Pro enthalten
            </p>
          </div>

          {/* Pro Benefits */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Mit Websy Pro erhältst du:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {proFeatures.map((proFeature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{proFeature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Badge className="bg-blue-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Beliebteste Wahl
              </Badge>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              €9,90
              <span className="text-lg text-gray-600 font-normal">/Monat</span>
            </div>
            <p className="text-gray-600 mb-4">
              Jederzeit kündbar • 30 Tage Geld-zurück-Garantie
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              {isUpgrading ? (
                <>
                  <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Wird verarbeitet...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Jetzt upgraden
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <Link href="/pricing" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Alle Preise ansehen
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="text-center text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span>SSL-verschlüsselt</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span>30 Tage Garantie</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span>Jederzeit kündbar</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
