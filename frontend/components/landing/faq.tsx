'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([0])

  const faqs = [
    {
      id: 1,
      question: 'Wie schnell kann ich eine Website erstellen?',
      answer: 'Mit WebsiteBuilder AI kannst du eine professionelle Website in unter 60 Sekunden erstellen! Einfach 5 Fragen beantworten, 3-5 Fotos hochladen und fertig. Unsere KI übernimmt den Rest.',
    },
    {
      id: 2,
      question: 'Brauche ich technische Kenntnisse?',
      answer: 'Überhaupt nicht! WebsiteBuilder AI ist speziell für absolute Anfänger entwickelt. Du kannst einfach reinsprechen was du willst, Fotos hochladen oder mit der KI chatten. Alles wird automatisch für dich erstellt.',
    },
    {
      id: 3,
      question: 'Ist meine Website DSGVO-konform?',
      answer: 'Ja, alle Websites sind automatisch DSGVO-konform. Wir sorgen für rechtssichere Datenschutzerklärungen, Cookie-Banner und alle notwendigen Dokumente. Keine rechtlichen Sorgen für dich!',
    },
    {
      id: 4,
      question: 'Welche Templates sind verfügbar?',
      answer: 'Wir haben über 50 professionelle Templates für verschiedene Branchen: Restaurants, Handwerker, Online-Shops, Dienstleister und mehr. Alle Templates sind mobile-optimiert und können mit KI angepasst werden.',
    },
    {
      id: 5,
      question: 'Kann ich meine eigene Domain verwenden?',
      answer: 'Ja! Mit unseren bezahlten Plänen bekommst du eine kostenlose .de Domain oder kannst deine eigene Domain verbinden. Wir kümmern uns um alle technischen Details.',
    },
    {
      id: 6,
      question: 'Wie funktioniert das Voice-to-Website Feature?',
      answer: 'Einfach dein Smartphone oder Mikrofon verwenden und reinsprechen was du dir vorstellst. Unsere KI versteht Deutsch und erstellt automatisch passende Inhalte, Struktur und Design basierend auf deinen Wünschen.',
    },
    {
      id: 7,
      question: 'Kann ich meine Website später ändern?',
      answer: 'Natürlich! Du kannst deine Website jederzeit mit unserem Chat-System bearbeiten. Sage einfach "Mach den Button größer" oder "Ändere die Farbe zu Blau" und die KI macht es sofort.',
    },
    {
      id: 8,
      question: 'Gibt es eine kostenlose Version?',
      answer: 'Ja! Unser kostenloser Plan bietet eine Subdomain, bis zu 5 Seiten und Basis-Templates. Perfekt zum Ausprobieren. Keine Kreditkarte erforderlich.',
    },
    {
      id: 9,
      question: 'Welche Zahlungsmethoden werden akzeptiert?',
      answer: 'Wir akzeptieren alle gängigen Zahlungsmethoden: Kreditkarten, SEPA-Lastschrift, PayPal und mehr. Alle Preise sind inklusive MwSt. und ohne versteckte Kosten.',
    },
    {
      id: 10,
      question: 'Gibt es deutschen Support?',
      answer: 'Ja! Unser Support-Team spricht Deutsch und ist per Telefon, Email und Chat erreichbar. Wir helfen dir gerne bei allen Fragen rund um deine Website.',
    },
    {
      id: 11,
      question: 'Kann ich meine Website exportieren?',
      answer: 'Mit den Professional und Business Plänen kannst du deine Website als HTML/CSS exportieren oder über unsere API zugreifen. Du behältst die volle Kontrolle über deine Inhalte.',
    },
    {
      id: 12,
      question: 'Wie sicher sind meine Daten?',
      answer: 'Deine Daten sind bei uns sicher! Wir verwenden SSL-Verschlüsselung, regelmäßige Backups und sind DSGVO-konform. Alle Daten werden in Deutschland gespeichert.',
    },
  ]

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <section id="faq" className="py-20 bg-white">
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
            Häufig gestellte Fragen
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hier findest du Antworten auf die wichtigsten Fragen zu WebsiteBuilder AI. 
            Falls deine Frage nicht dabei ist, kontaktiere gerne unser Support-Team.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="border border-gray-200 rounded-2xl mb-4 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openItems.includes(faq.id) ? (
                    <Minus className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openItems.includes(faq.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Deine Frage nicht gefunden?
            </h3>
            <p className="text-gray-600 mb-6">
              Unser deutschsprachiges Support-Team hilft dir gerne weiter. 
              Kontaktiere uns per Telefon, Email oder Chat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+49123456789"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                📞 +49 123 456 789
              </a>
              <a
                href="mailto:support@websitbuilder.ai"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                ✉️ support@websitbuilder.ai
              </a>
            </div>
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold text-lg">📚</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Hilfe-Center</h4>
              <p className="text-gray-600 text-sm mb-4">
                Ausführliche Anleitungen und Tutorials
              </p>
              <a href="/help" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Hilfe-Center besuchen →
              </a>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold text-lg">🎥</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Video-Tutorials</h4>
              <p className="text-gray-600 text-sm mb-4">
                Schritt-für-Schritt Video-Anleitungen
              </p>
              <a href="/tutorials" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Videos ansehen →
              </a>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold text-lg">💬</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Community</h4>
              <p className="text-gray-600 text-sm mb-4">
                Tausche dich mit anderen Nutzern aus
              </p>
              <a href="/community" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Community besuchen →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
