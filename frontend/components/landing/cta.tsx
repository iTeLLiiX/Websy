'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles, Clock, Shield } from 'lucide-react'

export function CTA() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission
    console.log('Email submitted:', email)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-white bg-opacity-10 rounded-full animate-bounce"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          {/* Main CTA */}
          <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Bereit für deine erste{' '}
              <span className="text-yellow-300">KI-Website</span>?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Starte kostenlos und erstelle deine professionelle Website in unter 60 Sekunden. 
              Keine Kreditkarte erforderlich!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg group">
                🚀 Jetzt kostenlos starten
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn border-white text-white hover:bg-white hover:text-blue-600 btn-lg">
                📞 Beratung anfragen
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>100% sicher & DSGVO-konform</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Setup in 60 Sekunden</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>KI-gestützt</span>
              </div>
            </div>
          </div>

          {/* Email Signup */}
          <div className="max-w-md mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold text-white mb-4">
                Updates erhalten
              </h3>
              <p className="text-blue-100 mb-6">
                Erhalte exklusive Tipps und Updates für deine Website.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.de"
                    className="flex-1 input bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-blue-200"
                    required
                  />
                  <button
                    type="submit"
                    className="btn bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-blue-200">
                  Keine Spam-Mails. Jederzeit abmeldbar.
                </p>
              </form>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16">
            <p className="text-blue-100 mb-8">
              Vertraut von über 1.000 deutschen Restaurants
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {/* Placeholder for restaurant logos */}
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <span className="text-white font-semibold">Restaurant Müller</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <span className="text-white font-semibold">Café Schmidt</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <span className="text-white font-semibold">Bistro Weber</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <span className="text-white font-semibold">Gasthaus Klein</span>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-16">
            <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Noch unsicher? Probiere es einfach aus!
              </h3>
              <p className="text-gray-600 mb-6">
                Erstelle deine erste Website kostenlos und ohne Risiko. 
                Du wirst überrascht sein, wie einfach es ist!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn btn-primary btn-lg">
                  🎯 Kostenlose Demo starten
                </button>
                <button className="btn btn-outline btn-lg">
                  💬 Live-Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}