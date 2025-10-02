'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  Sparkles, 
  User,
  LogOut,
  Settings,
  Globe
} from 'lucide-react'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Websy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/templates" className="text-gray-600 hover:text-gray-900 font-medium">
              Templates
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
              Preise
            </Link>
            <Link href="/features" className="text-gray-600 hover:text-gray-900 font-medium">
              Features
            </Link>
            <Link href="/help" className="text-gray-600 hover:text-gray-900 font-medium">
              Hilfe
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Anmelden
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Kostenlos starten
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/templates" 
                className="text-gray-600 hover:text-gray-900 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Templates
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-600 hover:text-gray-900 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Preise
              </Link>
              <Link 
                href="/features" 
                className="text-gray-600 hover:text-gray-900 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/help" 
                className="text-gray-600 hover:text-gray-900 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Hilfe
              </Link>
              
              <div className="border-t pt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link 
                      href="/dashboard"
                      className="flex items-center text-gray-600 hover:text-gray-900 font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    <div className="flex items-center space-x-2 py-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center text-gray-600 hover:text-gray-900 font-medium py-2"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      href="/auth/login"
                      className="block text-gray-600 hover:text-gray-900 font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Anmelden
                    </Link>
                    <Link 
                      href="/auth/register"
                      className="block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Sparkles className="w-4 h-4 mr-2 inline" />
                      Kostenlos starten
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}