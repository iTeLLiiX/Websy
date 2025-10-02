'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Check, 
  Loader2, 
  AlertCircle,
  Shield,
  Lock
} from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  plan: {
    id: string
    name: string
    price: number
    interval: 'month' | 'year'
    features: string[]
    isPopular?: boolean
  }
  onSuccess: (subscription: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function StripeCheckout({ plan, onSuccess, onError, onCancel }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: plan.id,
            amount: plan.price,
            interval: plan.interval,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create payment intent')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error('Error creating payment intent:', error)
        onError('Fehler beim Erstellen der Zahlung. Bitte versuchen Sie es erneut.')
      }
    }

    createPaymentIntent()
  }, [plan, onError])

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm 
        plan={plan}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  )
}

interface CheckoutFormProps {
  plan: StripeCheckoutProps['plan']
  onSuccess: (subscription: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

function CheckoutForm({ plan, onSuccess, onError, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError('')

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Kreditkarten-Element nicht gefunden')
      setIsProcessing(false)
      return
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        '', // clientSecret will be passed here
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Customer Name', // This should come from user data
            },
          },
        }
      )

      if (error) {
        setError(error.message || 'Zahlung fehlgeschlagen')
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent)
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Zahlung abschließen</span>
          </CardTitle>
          <CardDescription>
            Sichere Zahlung mit Stripe
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{plan.name}</h3>
              {plan.isPopular && (
                <Badge className="bg-blue-600 text-white">Beliebt</Badge>
              )}
            </div>
            
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                €{plan.price}
              </span>
              <span className="text-gray-600">
                /{plan.interval === 'month' ? 'Monat' : 'Jahr'}
              </span>
            </div>
            
            <div className="mt-3 space-y-1">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kreditkarten-Details
              </label>
              <div className="p-4 border border-gray-300 rounded-lg">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#1f2937',
                        '::placeholder': {
                          color: '#9ca3af',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Ihre Zahlung ist sicher und verschlüsselt</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Abbrechen
              </Button>
              
              <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird verarbeitet...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Jetzt bezahlen
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Stripe gesichert</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
