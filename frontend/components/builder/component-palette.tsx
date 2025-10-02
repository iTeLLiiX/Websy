'use client'

import React from 'react'
import { useComponentDrag } from './drag-drop-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Type, 
  Image, 
  Gallery, 
  Menu, 
  Phone, 
  Users, 
  Star, 
  Calendar,
  ShoppingCart,
  FileText,
  Coffee,
  Utensils
} from 'lucide-react'

interface ComponentPaletteProps {
  onAddComponent: (componentType: string) => void
}

const componentTypes = [
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Große Überschrift mit Call-to-Action',
    icon: Type,
    category: 'layout',
    isPremium: false,
  },
  {
    id: 'text',
    name: 'Text Block',
    description: 'Einfacher Textblock',
    icon: Type,
    category: 'content',
    isPremium: false,
  },
  {
    id: 'image',
    name: 'Bild',
    description: 'Einzelnes Bild mit Beschreibung',
    icon: Image,
    category: 'media',
    isPremium: false,
  },
  {
    id: 'gallery',
    name: 'Galerie',
    description: 'Bildergalerie',
    icon: Gallery,
    category: 'media',
    isPremium: false,
  },
  {
    id: 'menu',
    name: 'Speisekarte',
    description: 'Restaurant-Speisekarte',
    icon: Menu,
    category: 'restaurant',
    isPremium: false,
  },
  {
    id: 'contact',
    name: 'Kontakt',
    description: 'Kontaktinformationen',
    icon: Phone,
    category: 'info',
    isPremium: false,
  },
  {
    id: 'about',
    name: 'Über uns',
    description: 'Über uns Sektion',
    icon: Users,
    category: 'info',
    isPremium: false,
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Leistungen/Dienstleistungen',
    icon: Star,
    category: 'business',
    isPremium: false,
  },
  {
    id: 'testimonials',
    name: 'Bewertungen',
    description: 'Kundenbewertungen',
    icon: Star,
    category: 'social',
    isPremium: true,
  },
  {
    id: 'booking',
    name: 'Reservierung',
    description: 'Online-Reservierung',
    icon: Calendar,
    category: 'restaurant',
    isPremium: true,
  },
  {
    id: 'shop',
    name: 'Online-Shop',
    description: 'Produktverkauf',
    icon: ShoppingCart,
    category: 'ecommerce',
    isPremium: true,
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Blog-Artikel',
    icon: FileText,
    category: 'content',
    isPremium: true,
  },
]

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const categories = [
    { id: 'layout', name: 'Layout', color: 'bg-blue-100 text-blue-800' },
    { id: 'content', name: 'Inhalt', color: 'bg-green-100 text-green-800' },
    { id: 'media', name: 'Medien', color: 'bg-purple-100 text-purple-800' },
    { id: 'restaurant', name: 'Restaurant', color: 'bg-orange-100 text-orange-800' },
    { id: 'info', name: 'Information', color: 'bg-gray-100 text-gray-800' },
    { id: 'business', name: 'Business', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'social', name: 'Social', color: 'bg-pink-100 text-pink-800' },
    { id: 'ecommerce', name: 'E-Commerce', color: 'bg-yellow-100 text-yellow-800' },
  ]

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Komponenten</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ziehe Komponenten in den Website-Bereich, um sie hinzuzufügen
        </p>
      </div>

      {categories.map((category) => {
        const categoryComponents = componentTypes.filter(c => c.category === category.id)
        
        if (categoryComponents.length === 0) return null

        return (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category.id)}`}>
                {category.name}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {categoryComponents.map((component) => (
                <DraggableComponent
                  key={component.id}
                  component={component}
                  onAddComponent={onAddComponent}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface DraggableComponentProps {
  component: typeof componentTypes[0]
  onAddComponent: (componentType: string) => void
}

function DraggableComponent({ component, onAddComponent }: DraggableComponentProps) {
  const { isDragging, drag } = useComponentDrag(component.id)

  return (
    <Card
      ref={drag}
      className={`
        cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:shadow-md
      `}
      onClick={() => onAddComponent(component.id)}
    >
      <CardHeader className="p-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <component.icon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm font-medium text-gray-900">
              {component.name}
            </CardTitle>
            <CardDescription className="text-xs text-gray-600">
              {component.description}
            </CardDescription>
          </div>
          {component.isPremium && (
            <Badge variant="secondary" className="text-xs">
              Pro
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
