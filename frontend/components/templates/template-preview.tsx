'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Download, 
  Eye, 
  Star, 
  Crown, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Template } from '@/types'

interface TemplatePreviewProps {
  template: Template
  isOpen: boolean
  onClose: () => void
  onSelect: () => void
  onNext?: () => void
  onPrevious?: () => void
}

export function TemplatePreview({ 
  template, 
  isOpen, 
  onClose, 
  onSelect, 
  onNext, 
  onPrevious 
}: TemplatePreviewProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!isOpen) return null

  const currentPage = template.pages?.[currentPageIndex]
  const totalPages = template.pages?.length || 0

  const nextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }

  const previousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }

  const handleSelect = () => {
    onSelect()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[90vh]'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
            {template.isPremium && (
              <Badge className="bg-yellow-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Pro Template
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 space-y-4">
            {/* Template Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{template.rating || 4.5}</span>
                <span className="text-sm text-gray-500">({template.reviews || 0} Bewertungen)</span>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Kategorie:</strong> {template.category}</p>
                <p><strong>Seiten:</strong> {totalPages}</p>
                <p><strong>Verwendet:</strong> {template.usageCount || 0} mal</p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features</h4>
              <div className="space-y-1">
                {template.features?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {template.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pages Navigation */}
            {totalPages > 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Seiten</h4>
                <div className="space-y-1">
                  {template.pages?.map((page, index) => (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPageIndex(index)}
                      className={`w-full text-left p-2 rounded text-sm ${
                        index === currentPageIndex
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex flex-col">
            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousPage}
                    disabled={currentPageIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    {currentPageIndex + 1} von {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPageIndex === totalPages - 1}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600">
                  {currentPage?.name}
                </div>
              </div>
            )}

            {/* Preview Content */}
            <div className="flex-1 p-4 bg-gray-100 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
                {/* Mock Website Preview */}
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto"></div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-gray-600">
                      {template.description}
                    </p>
                    <div className="flex justify-center space-x-4">
                      <div className="w-24 h-16 bg-gray-200 rounded"></div>
                      <div className="w-24 h-16 bg-gray-200 rounded"></div>
                      <div className="w-24 h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  <X className="w-4 h-4 mr-2" />
                  Schließen
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Handle preview in new tab
                    window.open(template.preview, '_blank')
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vollbild
                </Button>
                
                <Button
                  onClick={handleSelect}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Template verwenden
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
