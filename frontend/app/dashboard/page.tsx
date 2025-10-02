'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useWebsiteBuilder } from '@/contexts/website-builder-context'
import { useSubscription } from '@/contexts/subscription-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import UpgradePrompt from '@/components/ui/upgrade-prompt'
import { 
  Plus, 
  Globe, 
  Eye, 
  Edit, 
  Trash2, 
  Settings,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Sparkles,
  Lock,
  Crown
} from 'lucide-react'
import Link from 'next/link'

interface Website {
  id: string
  name: string
  status: 'draft' | 'published'
  domain?: string
  template: {
    name: string
    category: string
  }
  updatedAt: string
  analytics?: {
    views: number
    visitors: number
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { websites, loadWebsites, state } = useWebsiteBuilder()
  const { isPro, isFree, canUseFeature, checkLimits } = useSubscription()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalWebsites: 0,
    publishedWebsites: 0,
    totalViews: 0,
    totalVisitors: 0
  })
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      await loadWebsites()
      
      // Load analytics
      const response = await fetch('/api/analytics/overview/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalWebsites: data.data.overview.totalWebsites,
          publishedWebsites: data.data.overview.publishedWebsites,
          totalViews: data.data.totalStats.pageViews,
          totalVisitors: data.data.totalStats.uniqueVisitors
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Veröffentlicht'
      case 'draft':
        return 'Entwurf'
      default:
        return 'Unbekannt'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Willkommen zurück, {user?.name}</p>
                {isFree && (
                  <div className="flex items-center mt-2">
                    <Crown className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      Free Plan • {websites.length}/1 Website
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {isFree && websites.length >= 1 && (
                  <UpgradePrompt
                    feature="unlimited_websites"
                    title="Mehr Websites erstellen"
                    description="Erstelle unbegrenzte Websites mit Websy Pro"
                    variant="inline"
                    onUpgrade={() => setShowUpgradePrompt(true)}
                  />
                )}
                <Link href="/builder">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isFree && websites.length >= 1}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Neue Website
                    {isFree && websites.length >= 1 && <Lock className="w-3 h-3 ml-1" />}
                  </Button>
                </Link>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Websites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWebsites}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedWebsites} veröffentlicht
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aufrufe</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% von letztem Monat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Besucher</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVisitors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% von letztem Monat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wachstum</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+23%</div>
              <p className="text-xs text-muted-foreground">
                +2% von letztem Monat
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {isFree && (
          <UpgradePrompt
            feature="premium_features"
            title="Entdecke alle Websy Pro Features"
            description="Upgrade zu Pro und erhalte Zugang zu Premium-Templates, eigener Domain, Online-Shop und mehr."
            variant="banner"
            onUpgrade={() => setShowUpgradePrompt(true)}
          />
        )}

        {/* Websites Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Meine Websites</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (!canUseFeature('analytics')) {
                    setShowUpgradePrompt(true)
                    return
                  }
                  // Navigate to analytics
                }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
                {!canUseFeature('analytics') && <Lock className="w-3 h-3 ml-1" />}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
            </div>
          </div>

          {websites.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Noch keine Websites erstellt
                </h3>
                <p className="text-gray-600 mb-6">
                  Erstelle deine erste Website in nur 60 Sekunden mit KI-Unterstützung
                </p>
                <Link href="/templates">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Erste Website erstellen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((website) => (
                <Card key={website.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{website.name}</CardTitle>
                        <CardDescription>
                          {website.template?.name || 'Kein Template'}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(website.status)}>
                        {getStatusText(website.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {website.domain && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="w-4 h-4 mr-2" />
                          {website.domain}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Zuletzt bearbeitet: {new Date(website.updatedAt).toLocaleDateString('de-DE')}
                      </div>

                      {website.analytics && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-2 text-blue-600" />
                            <span>{website.analytics.views} Aufrufe</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-green-600" />
                            <span>{website.analytics.visitors} Besucher</span>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2 pt-4">
                        <Link href={`/builder/${website.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="w-4 h-4 mr-2" />
                            Bearbeiten
                          </Button>
                        </Link>
                        {website.status === 'published' && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`https://${website.domain}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-2" />
                              Ansehen
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
            <CardDescription>
              Häufig verwendete Funktionen für deine Websites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/templates">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Plus className="w-6 h-6 mb-2" />
                  Neue Website
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Settings className="w-6 h-6 mb-2" />
                  Einstellungen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paywall Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-white shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Upgrade zu Websy Pro</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Entdecke alle Premium-Features und erstelle professionelle Websites
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Pro Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Eigene Domain verbinden',
                  'Branding entfernen',
                  'Unbegrenzte Seiten',
                  'Premium-Templates',
                  'Online-Shop',
                  'SEO & Analytics',
                  'Premium-Support',
                  'Erweiterte Widgets'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  €9,90
                  <span className="text-lg text-gray-600 font-normal">/Monat</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Jederzeit kündbar • 30 Tage Geld-zurück-Garantie
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Jetzt upgraden
                </Button>
                <Button
                  onClick={() => setShowUpgradePrompt(false)}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  Später
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
