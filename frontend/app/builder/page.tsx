'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useWebsiteBuilder } from '@/contexts/website-builder-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings, 
  Smartphone,
  Monitor,
  Tablet,
  Sparkles,
  Mic,
  Camera,
  MessageSquare,
  Palette,
  Upload,
  Download,
  Share2
} from 'lucide-react'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  isPremium: boolean
}

export default function BuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { 
    state,
    websites,
    loadWebsites,
    togglePreviewMode,
    saveWebsite,
    publishWebsite
  } = useWebsiteBuilder()
  
  const { selectedWebsite, selectedPage, selectedSection, isPreviewMode } = state
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [template, setTemplate] = useState<Template | null>(null)
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  useEffect(() => {
    const templateId = searchParams.get('template')
    if (templateId) {
      loadTemplate(templateId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const loadTemplate = async (templateId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/templates/${templateId}`)
      
      if (response.ok) {
        const data = await response.json()
        setTemplate(data.data)
      }
    } catch (error) {
      console.error('Error loading template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await saveWebsite()
      // Show success message
    } catch (error) {
      console.error('Error saving website:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      setPublishing(true)
      await publishWebsite()
      // Show success message
    } catch (error) {
      console.error('Error publishing website:', error)
    } finally {
      setPublishing(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getDeviceWidth = () => {
    switch (deviceView) {
      case 'desktop':
        return 'w-full'
      case 'tablet':
        return 'w-3/4 max-w-2xl'
      case 'mobile':
        return 'w-1/2 max-w-sm'
      default:
        return 'w-full'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedWebsite?.name || 'Neue Website'}
                </h1>
                <p className="text-sm text-gray-600">
                  {template?.name || 'Website Builder'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Device View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                  <Button
                    key={device}
                    variant={deviceView === device ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDeviceView(device)}
                    className="px-3"
                  >
                    {getDeviceIcon(device)}
                  </Button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreviewMode}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isPreviewMode ? 'Bearbeiten' : 'Vorschau'}
                </Button>

                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={publishing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {publishing ? 'Veröffentlichen...' : 'Veröffentlichen'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* AI Features */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">KI-Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="h-20 flex flex-col">
                <Mic className="w-5 h-5 mb-2" />
                <span className="text-xs">Sprache</span>
              </Button>
              <Button variant="outline" size="sm" className="h-20 flex flex-col">
                <Camera className="w-5 h-5 mb-2" />
                <span className="text-xs">Foto</span>
              </Button>
              <Button variant="outline" size="sm" className="h-20 flex flex-col">
                <MessageSquare className="w-5 h-5 mb-2" />
                <span className="text-xs">Chat</span>
              </Button>
              <Button variant="outline" size="sm" className="h-20 flex flex-col">
                <Palette className="w-5 h-5 mb-2" />
                <span className="text-xs">Branding</span>
              </Button>
            </div>
          </div>

          {/* Page Navigation */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seiten</h3>
            <div className="space-y-2">
              {selectedWebsite?.pages?.map((page) => (
                <Button
                  key={page.id}
                  variant={selectedPage?.id === page.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  {page.name}
                  {page.isPublished && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Live
                    </Badge>
                  )}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                <span className="mr-2">+</span>
                Neue Seite
              </Button>
            </div>
          </div>

          {/* Components */}
          <div className="p-4 border-b flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Komponenten</h3>
            <div className="space-y-2">
              <Card className="p-3 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Hero Section</p>
                    <p className="text-xs text-gray-600">Titel & Untertitel</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Speisekarte</p>
                    <p className="text-xs text-gray-600">Menü & Preise</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Galerie</p>
                    <p className="text-xs text-gray-600">Bilder & Videos</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Kontakt</p>
                    <p className="text-xs text-gray-600">Info & Standort</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4">
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Website Preview */}
          <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center">
            <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${getDeviceWidth()} transition-all duration-300`}>
              <div className="bg-gray-200 h-8 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="p-8">
                {selectedWebsite ? (
                  <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Willkommen in unserem Restaurant
                      </h1>
                      <p className="text-xl text-gray-600 mb-6">
                        Kulinarische Genüsse in entspannter Atmosphäre
                      </p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Jetzt reservieren
                      </Button>
                    </div>

                    {/* Menu Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Hausgemachte Pasta</h3>
                        <p className="text-gray-600 mb-2">Mit frischen Kräutern und Parmesan</p>
                        <p className="text-lg font-bold text-blue-600">€12.50</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Gegrillter Lachs</h3>
                        <p className="text-gray-600 mb-2">Mit mediterranen Gemüse</p>
                        <p className="text-lg font-bold text-blue-600">€18.90</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Starte deine Website
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Wähle ein Template oder erstelle eine individuelle Website
                    </p>
                    <div className="space-y-3">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Mit KI erstellen
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Template auswählen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
