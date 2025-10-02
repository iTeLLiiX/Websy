'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Maria Schmidt',
      business: 'Café Sonnenschein',
      location: 'München',
      rating: 5,
      text: 'Unglaublich! Meine Website war in 47 Sekunden fertig. Die KI hat alles perfekt verstanden und sogar meine Speisekarte automatisch erstellt. Endlich habe ich Zeit für meine Gäste!',
      avatar: '/testimonials/maria-schmidt.jpg',
      website: 'cafe-sonnenschein.de',
    },
    {
      id: 2,
      name: 'Thomas Müller',
      business: 'Müller Elektro',
      location: 'Hamburg',
      rating: 5,
      text: 'Als Handwerker hatte ich keine Ahnung von Websites. Mit der Voice-Funktion konnte ich einfach reinsprechen was ich brauche. Jetzt kommen 3x mehr Kunden über die Website.',
      avatar: '/testimonials/thomas-mueller.jpg',
      website: 'mueller-elektro.de',
    },
    {
      id: 3,
      name: 'Anna Weber',
      business: 'Boutique Anna',
      location: 'Berlin',
      rating: 5,
      text: 'Das Auto-Branding ist fantastisch! Die KI hat automatisch passende Farben und ein Logo für meine Boutique erstellt. Meine Kunden sind begeistert vom neuen Look.',
      avatar: '/testimonials/anna-weber.jpg',
      website: 'boutique-anna.de',
    },
    {
      id: 4,
      name: 'Peter Fischer',
      business: 'Restaurant Fischer',
      location: 'Köln',
      rating: 5,
      text: 'Die QR-Code Integration ist genial! Meine Gäste können jetzt kontaktlos die Speisekarte abrufen. Und das Booking-System funktioniert perfekt. Sehr empfehlenswert!',
      avatar: '/testimonials/peter-fischer.jpg',
      website: 'restaurant-fischer.de',
    },
    {
      id: 5,
      name: 'Lisa Hoffmann',
      business: 'Yoga Studio Namaste',
      location: 'Frankfurt',
      rating: 5,
      text: 'Das Chat-System ist wie Magie! Ich sage "Mach die Seite ruhiger" und es passiert sofort. Meine Website sieht jetzt perfekt für ein Yoga Studio aus.',
      avatar: '/testimonials/lisa-hoffmann.jpg',
      website: 'yoga-namaste.de',
    },
    {
      id: 6,
      name: 'Michael Klein',
      business: 'Klein & Partner Anwaltskanzlei',
      location: 'Stuttgart',
      rating: 5,
      text: 'Professionell, schnell und DSGVO-konform. Genau was ich als Anwalt brauche. Meine Mandanten finden jetzt alle wichtigen Infos schnell auf der Website.',
      avatar: '/testimonials/michael-klein.jpg',
      website: 'klein-partner-recht.de',
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
            Was unsere Kunden sagen
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Über 1.000 deutsche Unternehmen vertrauen bereits auf WebsiteBuilder AI. 
            Hier sind einige ihrer Erfolgsgeschichten.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="flex justify-end mb-4">
                <Quote className="w-8 h-8 text-primary-200" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.business}</p>
                  <p className="text-sm text-primary-600">{testimonial.location}</p>
                </div>
              </div>

              {/* Website Link */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href={`https://${testimonial.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {testimonial.website} ↗
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                1.000+
              </div>
              <div className="text-gray-600">Zufriedene Kunden</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                4.9★
              </div>
              <div className="text-gray-600">Durchschnittsbewertung</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                47s
              </div>
              <div className="text-gray-600">Durchschnittliche Setup-Zeit</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                99.9%
              </div>
              <div className="text-gray-600">Kundenzufriedenheit</div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Werde Teil unserer Erfolgsgeschichte
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Schließe dich über 1.000 deutschen Unternehmen an, die bereits ihre Website 
              mit WebsiteBuilder AI erstellt haben.
            </p>
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Jetzt kostenlos starten
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
