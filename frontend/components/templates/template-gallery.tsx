'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Star, 
  Eye, 
  Download, 
  Crown,
  Grid3X3,
  List,
  ChevronDown
} from 'lucide-react'
import { Template } from '@/types'

interface TemplateGalleryProps {
  templates: Template[]
  onSelectTemplate: (template: Template) => void
  onPreviewTemplate: (template: Template) => void
  isLoading?: boolean
}

interface FilterState {
  category: string
  isPremium: boolean | null
  search: string
  sortBy: 'newest' | 'popular' | 'name'
  viewMode: 'grid' | 'list'
}

export function TemplateGallery({ 
  templates, 
  onSelectTemplate, 
  onPreviewTemplate, 
  isLoading = false 
}: TemplateGalleryProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    isPremium: null,
    search: '',
    sortBy: 'newest',
    viewMode: 'grid',
  })

  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(templates)
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { id: 'all', name: 'Alle Kategorien', count: templates.length },
    { id: 'restaurant', name: 'Restaurant', count: templates.filter(t => t.category === 'restaurant').length },
    { id: 'cafe', name: 'Café', count: templates.filter(t => t.category === 'cafe').length },
    { id: 'handwerker', name: 'Handwerk', count: templates.filter(t => t.category === 'handwerker').length },
    { id: 'shop', name: 'Shop', count: templates.filter(t => t.category === 'shop').length },
    { id: 'service', name: 'Service', count: templates.filter(t => t.category === 'service').length },
  ]

  useEffect(() => {
    let filtered = [...templates]

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category)
    }

    // Filter by premium status
    if (filters.isPremium !== null) {
      filtered = filtered.filter(t => t.isPremium === filters.isPremium)
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'popular':
          return (b.usageCount || 0) - (a.usageCount || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredTemplates(filtered)
  }, [templates, filters])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      isPremium: null,
      search: '',
      sortBy: 'newest',
      viewMode: 'grid',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
          <p className="text-gray-600">
            {filteredTemplates.length} von {templates.length} Templates
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('viewMode', 'grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('viewMode', 'list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Template suchen..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Premium Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typ
              </label>
              <select
                value={filters.isPremium === null ? 'all' : filters.isPremium ? 'premium' : 'free'}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? null : e.target.value === 'premium'
                  handleFilterChange('isPremium', value)
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Alle</option>
                <option value="free">Kostenlos</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sortieren nach
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Neueste</option>
                  <option value="popular">Beliebteste</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Filter zurücksetzen
            </Button>
          </div>
        </div>
      )}

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Templates gefunden
          </h3>
          <p className="text-gray-600 mb-4">
            Versuchen Sie andere Suchbegriffe oder Filter
          </p>
          <Button onClick={clearFilters}>
            Filter zurücksetzen
          </Button>
        </div>
      ) : (
        <div className={
          filters.viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              viewMode={filters.viewMode}
              onSelect={() => onSelectTemplate(template)}
              onPreview={() => onPreviewTemplate(template)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TemplateCardProps {
  template: Template
  viewMode: 'grid' | 'list'
  onSelect: () => void
  onPreview: () => void
}

function TemplateCard({ template, viewMode, onSelect, onPreview }: TemplateCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                {template.isPremium && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{template.category}</span>
                <span>•</span>
                <span>{template.pages?.length || 0} Seiten</span>
                <span>•</span>
                <span>{template.usageCount || 0} verwendet</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                Vorschau
              </Button>
              <Button
                size="sm"
                onClick={onSelect}
              >
                <Download className="w-4 h-4 mr-2" />
                Verwenden
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <div className="relative">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        
        {template.isPremium && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-t-lg" />
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <CardDescription className="text-sm">
          {template.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{template.category}</Badge>
            <span className="text-xs text-gray-500">
              {template.pages?.length || 0} Seiten
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Star className="w-4 h-4" />
            <span>{template.rating || 4.5}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onPreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            Vorschau
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onSelect}
          >
            <Download className="w-4 h-4 mr-2" />
            Verwenden
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
