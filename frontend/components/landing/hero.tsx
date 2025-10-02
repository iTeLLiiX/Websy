'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle,
  Play,
  Star,
  Users,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const handleVoiceInput = async () => {
    setIsRecording(true)
    // Simulate voice recording
    setTimeout(() => {
      setIsRecording(false)
      // Redirect to builder with voice input
      window.location.href = '/builder?voice=true'
    }, 2000)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Logo & Branding */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              Websy
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Erstelle deine Website in <span className="text-blue-600 font-semibold">10 Minuten</span> – 
              ohne Code, ohne Vorkenntnisse, ohne Kreditkarte
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>Kostenlos starten</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              <span>10 Minuten Setup</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-purple-500 mr-2" />
              <span>10.000+ Nutzer</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span>4.9/5 Bewertung</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/builder">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Jetzt kostenlos starten
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg border-2"
              onClick={handleVoiceInput}
              disabled={isRecording}
            >
              {isRecording ? (
                <>
                  <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  Aufnahme...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Mit Sprache erstellen
                </>
              )}
            </Button>
          </div>

          {/* Demo Video */}
          <div className="relative max-w-4xl mx-auto mb-16">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-full w-20 h-20"
                >
                  <Play className="w-8 h-8 ml-1" />
                </Button>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Video Stats */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-6 py-3 shadow-lg">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Live Demo</span>
                </div>
                <div className="text-gray-400">|</div>
                <div className="text-gray-600">2:30 Minuten</div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-16">
            <p className="text-gray-600 mb-6">Vertraut von über 10.000 Unternehmen</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {/* Placeholder für Logos */}
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Logo 1</span>
              </div>
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Logo 2</span>
              </div>
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Logo 3</span>
              </div>
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Logo 4</span>
              </div>
            </div>
          </div>

          {/* Free vs Pro Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Was du mit Websy erreichen kannst
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan Preview */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Websy Free</h4>
                </div>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>1 Website erstellen</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Bis zu 3 Seiten</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>10 moderne Templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Websy-Subdomain</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>SSL-Zertifikat</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <span className="text-3xl font-bold text-green-600">Kostenlos</span>
                  <span className="text-gray-500 ml-2">für immer</span>
                </div>
              </div>

              {/* Pro Plan Preview */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Websy Pro</h4>
                </div>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    <span>Eigene Domain</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    <span>Unbegrenzte Seiten</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    <span>Premium Templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    <span>Online-Shop</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    <span>SEO & Analytics</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <span className="text-3xl font-bold text-blue-600">9,90€</span>
                  <span className="text-gray-500 ml-2">/Monat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}