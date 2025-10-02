'use client'

import { 
  Sparkles, 
  Clock, 
  Smartphone, 
  Palette, 
  ShoppingCart, 
  BarChart3,
  Globe,
  Shield,
  Zap,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Features() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "KI-gestützte Erstellung",
      description: "Erstelle Websites mit Sprache, Fotos oder Chat – unsere KI macht den Rest.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "10 Minuten Setup",
      description: "Von der Idee zur fertigen Website in nur 10 Minuten – ohne technische Kenntnisse.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile-First Design",
      description: "Alle Websites sind automatisch für Handy, Tablet und Desktop optimiert.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Professionelle Templates",
      description: "10 kostenlose + Premium-Templates für Restaurants, Cafés und mehr.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Online-Shop integriert",
      description: "Verkaufe direkt über deine Website – mit Warenkorb und Zahlungsabwicklung.",
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "SEO & Analytics",
      description: "Werde bei Google gefunden und sieh, wie viele Besucher deine Seite hat.",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600"
    }
  ]

  const freeFeatures = [
    "1 Website erstellen",
    "Bis zu 3 Seiten pro Website",
    "10 moderne Templates",
    "Websy-Subdomain (deinname.websy.app)",
    "Drag-and-Drop-Medienverwaltung",
    "Live-Editor mit Vorschau",
    "Responsives Design",
    "SSL-Zertifikat inklusive",
    "Basis-Widgets (Text, Bild, Button, Kontaktformular)",
    "Made with Websy Branding"
  ]

  const proFeatures = [
    "Eigene Domain verbinden (www.deinname.de)",
    "Branding entfernen",
    "Unbegrenzte Seiten",
    "Premium-Templates & Designkontrolle",
    "E-Commerce Light (Online-Shop)",
    "SEO-Tools & Besucherstatistiken",
    "Formular-Integrationen",
    "Erweiterte Widgets & Blöcke",
    "Mehr Speicher & Traffic",
    "Premium-Support"
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Alles was du brauchst, um online durchzustarten
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Von der Idee zur fertigen Website in 10 Minuten – mit KI-Unterstützung, 
            professionellen Templates und allem was du für dein Business brauchst.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Free vs Pro Comparison */}
        <div className="bg-gray-50 rounded-3xl p-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Wähle deinen Plan
            </h3>
            <p className="text-lg text-gray-600">
              Starte kostenlos und upgrade, wenn du bereit für mehr bist
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 hover:border-green-300 transition-colors duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Websy Free</CardTitle>
                <CardDescription className="text-lg">
                  Perfekt zum Ausprobieren
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-green-600">Kostenlos</span>
                  <span className="text-gray-500 ml-2">für immer</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-center">
                  <Badge variant="outline" className="mb-4 text-green-600 border-green-300">
                    Made with Websy Branding
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors duration-300 bg-blue-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Websy Pro</CardTitle>
                <CardDescription className="text-lg">
                  Für professionelle Websites
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-blue-600">9,90€</span>
                  <span className="text-gray-500 ml-2">/Monat</span>
                </div>
                <Badge className="bg-blue-600 text-white">
                  Beliebteste Wahl
                </Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-center">
                  <Badge variant="outline" className="mb-4 text-blue-600 border-blue-300">
                    Kein Branding
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Starte kostenlos und upgrade jederzeit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                Kostenlos starten
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                Pro ausprobieren
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">10.000+</div>
              <div className="text-gray-600">Aktive Nutzer</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">50.000+</div>
              <div className="text-gray-600">Websites erstellt</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-gray-600">Bewertung</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}