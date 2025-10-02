'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Calendar, 
  Check, 
  X, 
  AlertTriangle,
  Loader2,
  Crown,
  Download,
  Settings
} from 'lucide-react'

interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  currentPeriodStart: string
  currentPeriodEnd: string
  plan: {
    id: string
    name: string
    price: number
    interval: 'month' | 'year'
  }
  cancelAtPeriodEnd: boolean
}

interface SubscriptionManagerProps {
  subscription: Subscription | null
  onUpgrade: (planId: string) => void
  onCancel: () => void
  onReactivate: () => void
  onUpdatePayment: () => void
}

export function SubscriptionManager({ 
  subscription, 
  onUpgrade, 
  onCancel, 
  onReactivate, 
  onUpdatePayment 
}: SubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'incomplete':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv'
      case 'canceled':
        return 'Gekündigt'
      case 'past_due':
        return 'Überfällig'
      case 'incomplete':
        return 'Unvollständig'
      default:
        return 'Unbekannt'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      await onCancel()
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    setIsLoading(true)
    try {
      await onReactivate()
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Kein Abonnement</span>
          </CardTitle>
          <CardDescription>
            Sie haben derzeit kein aktives Abonnement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Kein Abonnement aktiv
            </h3>
            <p className="text-gray-600 mb-4">
              Wählen Sie einen Plan, um alle Features zu nutzen
            </p>
            <Button onClick={() => onUpgrade('pro')}>
              <Crown className="w-4 h-4 mr-2" />
              Plan auswählen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Aktuelles Abonnement</span>
              </CardTitle>
              <CardDescription>
                {subscription.plan.name} - €{subscription.plan.price}/{subscription.plan.interval === 'month' ? 'Monat' : 'Jahr'}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(subscription.status)}>
              {getStatusText(subscription.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Aktueller Zeitraum:</span>
              </div>
              <p className="text-sm text-gray-900">
                {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Nächste Zahlung:</span>
              </div>
              <p className="text-sm text-gray-900">
                {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {subscription.status === 'past_due' && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Zahlung überfällig
                </p>
                <p className="text-sm text-yellow-700">
                  Bitte aktualisieren Sie Ihre Zahlungsinformationen
                </p>
              </div>
            </div>
          )}

          {subscription.cancelAtPeriodEnd && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Abonnement wird gekündigt
                </p>
                <p className="text-sm text-red-700">
                  Ihr Abonnement endet am {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <>
                <Button
                  variant="outline"
                  onClick={onUpdatePayment}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Zahlungsmethode ändern
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => onUpgrade('enterprise')}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Kündigen
                </Button>
              </>
            )}

            {subscription.cancelAtPeriodEnd && (
              <Button
                onClick={handleReactivate}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Reaktivieren
              </Button>
            )}

            {subscription.status === 'past_due' && (
              <Button
                onClick={onUpdatePayment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Zahlung aktualisieren
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Nutzungsstatistiken</CardTitle>
          <CardDescription>
            Übersicht über Ihre aktuelle Nutzung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Websites</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">1.2K</div>
              <div className="text-sm text-gray-600">Seitenaufrufe</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-600">Speicher genutzt</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Rechnungshistorie</CardTitle>
          <CardDescription>
            Ihre letzten Rechnungen und Zahlungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                id: 'inv_001',
                date: '2024-01-15',
                amount: 19.00,
                status: 'paid',
                description: 'Websy Pro - Januar 2024',
              },
              {
                id: 'inv_002',
                date: '2023-12-15',
                amount: 19.00,
                status: 'paid',
                description: 'Websy Pro - Dezember 2023',
              },
            ].map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <Download className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {invoice.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(invoice.date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">
                    €{invoice.amount.toFixed(2)}
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    {invoice.status === 'paid' ? 'Bezahlt' : 'Ausstehend'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
