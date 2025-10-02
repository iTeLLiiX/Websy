'use client'

import { useState } from 'react'
import { Check, X, Star, Zap } from 'lucide-react'

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      id: 'free',
      name: 'Kostenlos',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfekt zum Ausprobieren',
      icon: '🆓',
      color: 'from-gray-400 to-gray-500',
      popular: false,
      features: [
        { text: 'Subdomain (deinname.websitbuilder.de)', included: true },
        { text: 'Bis zu 5 Seiten', included: true },
        { text: '2 Restaurant-Templates', included: true },
        { text: 'Basis-KI-Features', included: true },
        { text: 'Mobile-optimiert', included: true },
        { text: 'Eigene Domain', included: false },
        { text: 'Erweiterte KI-Features', included: false },
        { text: 'Priority Support', included: false },
        { text: 'Analytics Dashboard', included: false },
        { text: 'QR-Code Menü', included: false }
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: 9, yearly: 90 },
      description: 'Ideal für kleine Restaurants',
      icon: '🚀',
      color: 'from-blue-500 to-blue-600',
      popular: true,
      features: [
        { text: 'Eigene .de Domain', included: true },
        { text: 'Unbegrenzte Seiten', included: true },
        { text: 'Alle 5 Templates', included: true },
        { text: 'Voice-to-Website', included: true },
        { text: 'Photo-to-Website', included: true },
        { text: 'Chat-Editing', included: true },
        { text: 'Auto-Branding', included: true },
        { text: 'Email Support', included: true },
        { text: 'Analytics Dashboard', included: false },
        { text: 'Booking-System', included: false }
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { monthly: 19, yearly: 190 },
      description: 'Für wachsende Restaurants',
      icon: '⭐',
      color: 'from-purple-500 to-purple-600',
      popular: false,
      features: [
        { text: 'Alle Starter Features', included: true },
        { text: 'Analytics Dashboard', included: true },
        { text: 'Booking-System', included: true },
        { text: 'Online-Shop (bis 50 Produkte)', included: true },
        { text: 'QR-Code Menü', included: true },
        { text: 'Social Media Integration', included: true },
        { text: 'SEO-Optimierung', included: true },
        { text: 'Priority Support', included: true },
        { text: 'Team-Accounts', included: false },
        { text: 'API-Zugang', included: false }
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: { monthly: 39, yearly: 390 },
      description: 'Für große Restaurants',
      icon: '🏢',
      color: 'from-green-500 to-green-600',
      popular: false,
      features: [
        { text: 'Alle Professional Features', included: true },
        { text: 'Unbegrenzte Produkte', included: true },
        { text: 'Team-Accounts', included: true },
        { text: 'API-Zugang', included: true },
        { text: 'White-Label Option', included: true },
        { text: 'Dedicated Support', included: true },
        { text: 'Custom Integrations', included: true },
        { text: 'Advanced Analytics', included: true },
        { text: 'Multi-Language', included: true },
        { text: 'SLA-Garantie', included: true }
      ]
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transparente Preise
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Wähle den Plan, der zu deinem Restaurant passt. Alle Preise in Euro, 
            keine versteckten Kosten. Jederzeit kündbar.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-lg ${!isYearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Monatlich
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isYearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Jährlich
            </span>
            {isYearly && (
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                2 Monate gratis!
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative ${plan.popular ? 'lg:-mt-8' : ''}`}>
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Beliebt
                  </div>
                </div>
              )}

              <div className={`card p-8 h-full ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{plan.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      €{isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{isYearly ? 'Jahr' : 'Monat'}
                    </span>
                  </div>
                  {isYearly && plan.price.yearly > 0 && (
                    <p className="text-sm text-green-600">
                      Spare €{(plan.price.monthly * 12) - plan.price.yearly} pro Jahr
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className={`w-full btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-lg`}>
                  {plan.price.monthly === 0 ? 'Kostenlos starten' : 'Plan wählen'}
                  {plan.popular && <Zap className="w-4 h-4 ml-2" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Häufig gestellte Fragen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Kann ich jederzeit wechseln?</h4>
                <p className="text-gray-600 text-sm">Ja, du kannst jederzeit zwischen den Plänen wechseln oder kündigen.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Gibt es eine Geld-zurück-Garantie?</h4>
                <p className="text-gray-600 text-sm">Ja, 30 Tage Geld-zurück-Garantie ohne Fragen.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Brauche ich technische Kenntnisse?</h4>
                <p className="text-gray-600 text-sm">Nein, unsere KI macht alles für dich. Du brauchst nur zu sprechen!</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Starte noch heute deine erste Website!
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Keine Kreditkarte erforderlich. Erstelle deine Website in 60 Sekunden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg">
                🚀 Kostenlos starten
              </button>
              <button className="btn border-white text-white hover:bg-white hover:text-blue-600 btn-lg">
                📞 Beratung anfragen
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}