'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Palette, Loader2, Sparkles, Check } from 'lucide-react'
import { useWebsiteBuilder } from '@/contexts/website-builder-context'

interface AutoBrandingProps {
  onBrandingApplied: (branding: any) => void
  onError: (error: string) => void
}

interface BrandingResult {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  logoText: string
  logoStyle: string
  borderRadius: string
  spacing: string
}

export function AutoBranding({ onBrandingApplied, onError }: AutoBrandingProps) {
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [description, setDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [brandingResult, setBrandingResult] = useState<BrandingResult | null>(null)
  const [isApplied, setIsApplied] = useState(false)

  const { state } = useWebsiteBuilder()

  const businessTypes = [
    'Restaurant',
    'Café',
    'Bäckerei',
    'Imbiss',
    'Bar',
    'Hotel',
    'Handwerk',
    'Dienstleistung',
    'Einzelhandel',
    'Sonstiges',
  ]

  const generateBranding = async () => {
    if (!businessName.trim() || !businessType) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/ai/auto-branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: businessName.trim(),
          businessType,
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Branding generation failed')
      }

      const data = await response.json()
      setBrandingResult(data.branding)
    } catch (error) {
      console.error('Error generating branding:', error)
      onError('Fehler bei der Branding-Generierung. Bitte versuchen Sie es erneut.')
    } finally {
      setIsProcessing(false)
    }
  }

  const applyBranding = () => {
    if (!brandingResult) return

    onBrandingApplied(brandingResult)
    setIsApplied(true)
    
    // Reset after 2 seconds
    setTimeout(() => {
      setIsApplied(false)
    }, 2000)
  }

  const resetForm = () => {
    setBusinessName('')
    setBusinessType('')
    setDescription('')
    setBrandingResult(null)
    setIsApplied(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="w-5 h-5" />
          <span>Auto-Branding</span>
        </CardTitle>
        <CardDescription>
          Lassen Sie KI ein passendes Branding für Ihr Unternehmen erstellen
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessName">Unternehmensname *</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="z.B. Restaurant Zur Alten Post"
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label htmlFor="businessType">Branche *</Label>
            <select
              id="businessType"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={isProcessing}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Branche auswählen</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Traditionelle deutsche Küche mit modernem Touch"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateBranding}
          disabled={!businessName.trim() || !businessType || isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Branding generieren
        </Button>

        {/* Branding Result */}
        {brandingResult && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Generiertes Branding:</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Primärfarbe</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: brandingResult.primaryColor }}
                  />
                  <span className="text-sm font-mono">{brandingResult.primaryColor}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Sekundärfarbe</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: brandingResult.secondaryColor }}
                  />
                  <span className="text-sm font-mono">{brandingResult.secondaryColor}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Logo-Text</Label>
              <p className="text-sm text-gray-800 mt-1">{brandingResult.logoText}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Schriftart</Label>
              <p className="text-sm text-gray-800 mt-1">{brandingResult.fontFamily}</p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={applyBranding}
                disabled={isApplied}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isApplied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Palette className="w-4 h-4 mr-2" />
                )}
                {isApplied ? 'Angewendet!' : 'Branding anwenden'}
              </Button>
              
              <Button
                onClick={resetForm}
                variant="outline"
                className="flex-1"
              >
                Neu generieren
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Tipp:</strong> Je detaillierter Ihre Beschreibung, desto passender das Branding</p>
          <p><strong>Beispiel:</strong> "Moderne Bäckerei mit traditionellen Rezepten"</p>
        </div>
      </CardContent>
    </Card>
  )
}
