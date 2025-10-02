import Hero from '@/components/landing/hero'
import Features from '@/components/landing/features'
import Templates from '@/components/landing/templates'
import Pricing from '@/components/landing/pricing'
import CTA from '@/components/landing/cta'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Templates />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}