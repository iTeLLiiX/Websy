'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Image as ImageIcon, X, Loader2, Sparkles } from 'lucide-react'
import { useWebsiteBuilder } from '@/contexts/website-builder-context'

interface PhotoUploaderProps {
  onWebsiteGenerated: (websiteData: any) => void
  onError: (error: string) => void
}

export function PhotoUploader({ onWebsiteGenerated, onError }: PhotoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysis, setAnalysis] = useState<string>('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setAnalysis('')
  }

  const analyzeImage = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/ai/photo-to-website', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Image analysis failed')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Error analyzing image:', error)
      onError('Fehler bei der Bildanalyse. Bitte versuchen Sie es erneut.')
    } finally {
      setIsProcessing(false)
    }
  }

  const generateWebsiteFromPhoto = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/ai/photo-to-website', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Website generation failed')
      }

      const data = await response.json()
      onWebsiteGenerated(data.websiteData)
    } catch (error) {
      console.error('Error generating website:', error)
      onError('Fehler bei der Website-Generierung. Bitte versuchen Sie es erneut.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5" />
          <span>Foto zu Website</span>
        </CardTitle>
        <CardDescription>
          Laden Sie ein Foto hoch und lassen Sie KI eine passende Website erstellen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        {!selectedFile ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Foto hier ablegen oder klicken zum Auswählen
            </p>
            <p className="text-sm text-gray-500">
              JPG, PNG, GIF bis zu 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={previewUrl!}
                alt="Selected"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                onClick={removeFile}
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* File Info */}
            <div className="text-sm text-gray-600">
              <p><strong>Datei:</strong> {selectedFile.name}</p>
              <p><strong>Größe:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Typ:</strong> {selectedFile.type}</p>
            </div>
          </div>
        )}

        {/* Analysis Result */}
        {analysis && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Bildanalyse:
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-800">{analysis}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedFile && (
          <div className="flex space-x-2">
            <Button
              onClick={analyzeImage}
              disabled={isProcessing}
              variant="outline"
              className="flex-1"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 mr-2" />
              )}
              Bild analysieren
            </Button>
            
            <Button
              onClick={generateWebsiteFromPhoto}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Website erstellen
            </Button>
          </div>
        )}

        {/* Status */}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">KI analysiert Ihr Bild...</span>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Tipp:</strong> Verwenden Sie klare, gut beleuchtete Fotos</p>
          <p><strong>Empfohlen:</strong> Restaurant-Interieur, Produkte, oder Geschäftsfassade</p>
        </div>
      </CardContent>
    </Card>
  )
}
