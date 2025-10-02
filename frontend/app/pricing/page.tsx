'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  X, 
  Sparkles, 
  Star,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  ShoppingCart,
  BarChart3,
  Users,
  Headphones
} from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: "Websy Free",
      description: "Perfekt zum Ausprobieren",
      price: { monthly: 0, annual: 0 },
      period: "für immer",
      color: "green",
      icon: <CheckCircle className="w-6 h-6" />,
      popular: false,
      features: [
        { name: "1 Website erstellen", included: true },
        { name: "Bis zu 3 Seiten pro Website", included: true },
        { name: "10 moderne Templates", included: true },
        { name: "Websy-Subdomain (deinname.websy.app)", included: true },
        { name: "Drag-and-Drop-Medienverwaltung", included: true },
        { name: "Live-Editor mit Vorschau", included: true },
        { name: "Responsives Design", included: true },
        { name: "SSL-Zertifikat inklusive", included: true },
        { name: "Basis-Widgets", included: true },
        { name: "Made with Websy Branding", included: true },
        { name: "Eigene Domain verbinden", included: false },
        { name: "Branding entfernen", included: false },
        { name: "Unbegrenzte Seiten", included: false },
        { name: "Premium-Templates", included: false },
        { name: "Online-Shop", included: false },
        { name: "SEO & Analytics", included: false },
        { name: "Premium-Support", included: false }
      ]
    },
    {
      name: "Websy Pro",
      description: "Für professionelle Websites",
      price: { monthly: 9.90, annual: 99 },
      period: isAnnual ? "pro Jahr" : "pro Monat",
      color: "blue",
      icon: <Sparkles className="w-6 h-6" />,
      popular: true,
      features: [
        { name: "1 Website erstellen", included: true },
        { name: "Bis zu 3 Seiten pro Website", included: true },
        { name: "10 moderne Templates", included: true },
        { name: "Websy-Subdomain (deinname.websy.app)", included: true },
        { name: "Drag-and-Drop-Medienverwaltung", included: true },
        { name: "Live-Editor mit Vorschau", included: true },
        { name: "Responsives Design", included: true },
        { name: "SSL-Zertifikat inklusive", included: true },
        { name: "Basis-Widgets", included: true },
        { name: "Made with Websy Branding", included: false },
        { name: "Eigene Domain verbinden", included: true },
        { name: "Branding entfernen", included: true },
        { name: "Unbegrenzte Seiten", included: true },
        { name: "Premium-Templates", included: true },
        { name: "Online-Shop", included: true },
        { name: "SEO & Analytics", included: true },
        { name: "Premium-Support", included: true }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-600',
          button: 'bg-green-600 hover:bg-green-700'
        }
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Wähle deinen Websy Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Starte kostenlos und upgrade, wenn du bereit für mehr bist. 
              Alle Pläne enthalten SSL, responsive Design und unsere KI-Features.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Monatlich
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Jährlich
              </span>
              {isAnnual && (
                <Badge className="bg-green-100 text-green-800">
                  <Zap className="w-3 h-3 mr-1" />
                  2 Monate gratis
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {plans.map((plan, index) => {
            const colors = getColorClasses(plan.color)
            const currentPrice = isAnnual ? plan.price.annual : plan.price.monthly
            const monthlyPrice = isAnnual ? plan.price.annual / 12 : plan.price.monthly
            
            return (
              <Card 
                key={index} 
                className={`relative ${colors.bg} ${colors.border} border-2 ${
                  plan.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Beliebteste Wahl
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4 ${colors.text}`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-lg">{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        {currentPrice === 0 ? 'Kostenlos' : `€${currentPrice}`}
                      </span>
                      {currentPrice > 0 && (
                        <span className="text-gray-500 ml-2">/{plan.period}</span>
                      )}
                    </div>
                    {isAnnual && currentPrice > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        €{monthlyPrice.toFixed(2)} pro Monat
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
                        )}
                        <span className={`${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${colors.button} text-white`}
                    size="lg"
                  >
                    {currentPrice === 0 ? 'Kostenlos starten' : 'Pro ausprobieren'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-xl font-semibold text-gray-900">Detaillierter Vergleich</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Websy Free</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Websy Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { name: "Website erstellen", free: true, pro: true },
                  { name: "Seiten pro Website", free: "Bis zu 3", pro: "Unbegrenzt" },
                  { name: "Templates", free: "10 kostenlose", pro: "Alle + Premium" },
                  { name: "Domain", free: "Websy-Subdomain", pro: "Eigene Domain" },
                  { name: "Branding", free: "Websy-Logo", pro: "Kein Branding" },
                  { name: "Online-Shop", free: false, pro: true },
                  { name: "SEO & Analytics", free: false, pro: true },
                  { name: "Support", free: "Community", pro: "Premium" }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{row.free}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{row.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Häufig gestellte Fragen
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Kann ich jederzeit upgraden?
              </h4>
              <p className="text-gray-600">
                Ja, du kannst jederzeit von Free zu Pro upgraden. Deine Website bleibt dabei erhalten.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Was passiert mit meiner Website bei einem Downgrade?
              </h4>
              <p className="text-gray-600">
                Deine Website bleibt online, aber Pro-Features werden deaktiviert. Du kannst jederzeit wieder upgraden.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Kann ich meine Domain mitbringen?
              </h4>
              <p className="text-gray-600">
                Ja, mit Websy Pro kannst du deine eigene Domain verbinden (www.deinname.de).
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Gibt es eine Geld-zurück-Garantie?
              </h4>
              <p className="text-gray-600">
                Ja, 30 Tage Geld-zurück-Garantie für alle Pro-Abonnements.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Bereit, deine Website zu erstellen?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Starte kostenlos und erstelle deine erste Website in 10 Minuten
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/builder">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                Kostenlos starten
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" size="lg" className="px-8 py-4">
                Templates ansehen
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
