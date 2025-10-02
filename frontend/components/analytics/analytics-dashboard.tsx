'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalViews: number
    uniqueVisitors: number
    bounceRate: number
    avgSessionDuration: number
  }
  traffic: {
    date: string
    views: number
    visitors: number
  }[]
  devices: {
    desktop: number
    mobile: number
    tablet: number
  }
  sources: {
    direct: number
    search: number
    social: number
    referral: number
  }
  pages: {
    path: string
    views: number
    title: string
  }[]
  countries: {
    country: string
    visitors: number
    percentage: number
  }[]
}

interface AnalyticsDashboardProps {
  websiteId: string
  period?: '7d' | '30d' | '90d' | '1y'
}

export function AnalyticsDashboard({ websiteId, period = '30d' }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  useEffect(() => {
    fetchAnalytics()
  }, [websiteId, selectedPeriod])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/${websiteId}?period=${selectedPeriod}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const analyticsData = await response.json()
      setData(analyticsData.data)
    } catch (error) {
      console.error('Analytics fetch error:', error)
      setError('Fehler beim Laden der Analytics-Daten')
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'Letzte 7 Tage'
      case '30d': return 'Letzte 30 Tage'
      case '90d': return 'Letzte 90 Tage'
      case '1y': return 'Letztes Jahr'
      default: return 'Letzte 30 Tage'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Fehler beim Laden</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Erneut versuchen
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Daten verfügbar</h3>
        <p className="text-gray-600">Es sind noch keine Analytics-Daten für diese Website verfügbar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">{getPeriodLabel(selectedPeriod)}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="90d">Letzte 90 Tage</option>
            <option value="1y">Letztes Jahr</option>
          </select>
          
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              // Export analytics data
              const dataStr = JSON.stringify(data, null, 2)
              const dataBlob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(dataBlob)
              const link = document.createElement('a')
              link.href = url
              link.download = `analytics-${websiteId}-${selectedPeriod}.json`
              link.click()
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamtaufrufe</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(data.overview.totalViews)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eindeutige Besucher</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(data.overview.uniqueVisitors)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absprungrate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.overview.bounceRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600">
              <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
              <span>+2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ø Sitzungsdauer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(data.overview.avgSessionDuration)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+15%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Besucherverlauf</CardTitle>
            <CardDescription>
              Tägliche Aufrufe und Besucher
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Chart wird hier angezeigt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Geräte</CardTitle>
            <CardDescription>
              Aufteilung nach Gerätetyp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Desktop</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{data.devices.desktop}%</p>
                  <p className="text-xs text-gray-500">{formatNumber(data.overview.uniqueVisitors * data.devices.desktop / 100)} Besucher</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Mobile</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{data.devices.mobile}%</p>
                  <p className="text-xs text-gray-500">{formatNumber(data.overview.uniqueVisitors * data.devices.mobile / 100)} Besucher</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Tablet</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{data.devices.tablet}%</p>
                  <p className="text-xs text-gray-500">{formatNumber(data.overview.uniqueVisitors * data.devices.tablet / 100)} Besucher</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources and Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic-Quellen</CardTitle>
            <CardDescription>
              Woher kommen Ihre Besucher?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Direkt</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{data.sources.direct}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Suchmaschinen</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{data.sources.search}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Social Media</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{data.sources.social}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Verweise</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{data.sources.referral}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Beliebte Seiten</CardTitle>
            <CardDescription>
              Meistbesuchte Seiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.pages.slice(0, 5).map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {page.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {page.path}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold">{formatNumber(page.views)}</p>
                    <p className="text-xs text-gray-500">Aufrufe</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countries */}
      <Card>
        <CardHeader>
          <CardTitle>Top Länder</CardTitle>
          <CardDescription>
            Besucher nach Ländern
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.countries.slice(0, 10).map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <Globe className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">{country.country}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatNumber(country.visitors)}</p>
                  <p className="text-xs text-gray-500">{country.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
