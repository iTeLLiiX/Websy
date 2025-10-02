'use client'

import React from 'react'
import { useSectionDrag } from './drag-drop-provider'
import { useWebsiteBuilder } from '@/contexts/website-builder-context'
import { Section } from '@/types'
import { GripVertical, Trash2, Copy, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DraggableSectionProps {
  section: Section
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onEdit: () => void
  children: React.ReactNode
}

export function DraggableSection({
  section,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onEdit,
  children,
}: DraggableSectionProps) {
  const { isDragging, drag } = useSectionDrag(section.id, index, section.type)
  const { moveSection } = useWebsiteBuilder()

  const handleMove = async (newIndex: number) => {
    try {
      await moveSection(section.id, newIndex)
    } catch (error) {
      console.error('Failed to move section:', error)
    }
  }

  return (
    <div
      ref={drag}
      className={`
        relative group border-2 rounded-lg transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-transparent hover:border-gray-300'
        }
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      onClick={onSelect}
    >
      {/* Section Header */}
      <div className="absolute -top-2 -left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-1 bg-white rounded-lg shadow-lg border">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Settings className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Section Content */}
      <div className="min-h-[100px] p-4">
        {children}
      </div>

      {/* Section Type Badge */}
      <div className="absolute bottom-2 right-2">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {section.type}
        </span>
      </div>
    </div>
  )
}
