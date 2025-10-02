'use client'

import { useState } from 'react'
import Image from 'next/image'
import { restaurantTemplates } from '@/data/templates/restaurant-templates'
import { Star, Eye, ArrowRight } from 'lucide-react'

export function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Alle' },
    { id: 'restaurant', name: 'Restaurants' },
    { id: 'cafe', name: 'Cafés' },
    { id: 'fast-food', name: 'Fast-Food' },
    { id: 'fine-dining', name: 'Fine Dining' }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? restaurantTemplates 
    : restaurantTemplates.filter(template => template.category === selectedCategory)

  return (
    <section id="templates" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Professionelle Restaurant-Templates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Wähle aus 5 hochwertigen Vorlagen, die speziell für deutsche Restaurants entwickelt wurden. 
            Alle Templates sind mobil-optimiert und sofort einsatzbereit.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="group">
              <div className="card overflow-hidden h-full transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1">
                {/* Template Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={template.thumbnail}
                    alt={template.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Premium
                      </div>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Vorschau
                    </button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {template.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-6">
                    {template.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button className="w-full btn btn-outline group-hover:btn-primary transition-all">
                    Template auswählen
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-soft p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Kein passendes Template gefunden?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Unsere KI erstellt auch gerne ein individuelles Design basierend auf deinen Wünschen!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg">
                🎨 Individuelles Design
              </button>
              <button className="btn btn-outline btn-lg">
                💬 KI-Beratung
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
            <div className="text-gray-600">Restaurant-Templates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className="text-gray-600">Mobile optimiert</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-gray-600">KI-Unterstützung</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
            <div className="text-gray-600">Anpassungen möglich</div>
          </div>
        </div>
      </div>
    </section>
  )
}