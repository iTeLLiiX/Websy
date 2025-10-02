'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  Star,
  Calendar,
  Tag
} from 'lucide-react'

interface ImageFile {
  id: string
  name: string
  url: string
  thumbnail: string
  size: number
  type: string
  tags: string[]
  uploadedAt: Date
  isFavorite?: boolean
}

interface ImageGalleryProps {
  images: ImageFile[]
  onImageSelect: (image: ImageFile) => void
  onImageDelete: (imageId: string) => void
  onImageFavorite: (imageId: string) => void
  onImageTag: (imageId: string, tags: string[]) => void
  isLoading?: boolean
}

export function ImageGallery({
  images,
  onImageSelect,
  onImageDelete,
  onImageFavorite,
  onImageTag,
  isLoading = false,
}: ImageGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Get unique tags from all images
  const allTags = Array.from(new Set(images.flatMap(img => img.tags)))
  
  // Filter images based on search and tag
  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTag = selectedTag === 'all' || image.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const handleImageSelect = (image: ImageFile) => {
    onImageSelect(image)
  }

  const handleImageDelete = (imageId: string) => {
    onImageDelete(imageId)
    setSelectedImages(prev => prev.filter(id => id !== imageId))
  }

  const handleImageFavorite = (imageId: string) => {
    onImageFavorite(imageId)
  }

  const handleBulkDelete = () => {
    selectedImages.forEach(imageId => {
      onImageDelete(imageId)
    })
    setSelectedImages([])
  }

  const handleBulkDownload = () => {
    selectedImages.forEach(imageId => {
      const image = images.find(img => img.id === imageId)
      if (image) {
        const link = document.createElement('a')
        link.href = image.url
        link.download = image.name
        link.click()
      }
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Bildergalerie</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bildergalerie</h2>
          <p className="text-sm text-gray-600">
            {filteredImages.length} von {images.length} Bildern
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
          </Button>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Bilder suchen..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Alle Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedImages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedImages.length} Bilder ausgewählt
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Herunterladen
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Löschen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images Grid/List */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Bilder gefunden
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedTag !== 'all' 
              ? 'Versuchen Sie andere Suchbegriffe oder Filter'
              : 'Laden Sie Ihre ersten Bilder hoch'
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
        }>
          {filteredImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              viewMode={viewMode}
              isSelected={selectedImages.includes(image.id)}
              onSelect={() => handleImageSelect(image)}
              onDelete={() => handleImageDelete(image.id)}
              onFavorite={() => handleImageFavorite(image.id)}
              onToggleSelect={() => {
                setSelectedImages(prev => 
                  prev.includes(image.id)
                    ? prev.filter(id => id !== image.id)
                    : [...prev, image.id]
                )
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ImageCardProps {
  image: ImageFile
  viewMode: 'grid' | 'list'
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onFavorite: () => void
  onToggleSelect: () => void
}

function ImageCard({ 
  image, 
  viewMode, 
  isSelected, 
  onSelect, 
  onDelete, 
  onFavorite, 
  onToggleSelect 
}: ImageCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (viewMode === 'list') {
    return (
      <Card className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={image.thumbnail}
                alt={image.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="absolute top-1 left-1 w-4 h-4"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{image.name}</h3>
              <p className="text-sm text-gray-600">
                {formatFileSize(image.size)} • {image.type}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {image.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onFavorite}
                className={image.isFavorite ? 'text-yellow-600' : ''}
              >
                <Star className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onSelect}
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="relative">
        <img
          src={image.thumbnail}
          alt={image.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        
        <div className="absolute top-2 left-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4"
          />
        </div>
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onFavorite}
              className={`bg-white ${image.isFavorite ? 'text-yellow-600' : ''}`}
            >
              <Star className="w-3 h-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSelect}
              className="bg-white"
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="w-full bg-white text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 mr-2" />
            Löschen
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
          {image.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{formatFileSize(image.size)}</span>
          <span>{new Date(image.uploadedAt).toLocaleDateString('de-DE')}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {image.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {image.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{image.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
