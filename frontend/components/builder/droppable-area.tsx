'use client'

import React from 'react'
import { useSectionDrop, useComponentDrop } from './drag-drop-provider'
import { useWebsiteBuilder } from '@/contexts/website-builder-context'
import { Plus } from 'lucide-react'

interface DroppableAreaProps {
  pageId: string
  children: React.ReactNode
  onAddSection: (sectionType: string, index: number) => void
}

export function DroppableArea({ pageId, children, onAddSection }: DroppableAreaProps) {
  const { isOver, canDrop, drop } = useSectionDrop(pageId, (draggedItem, targetIndex) => {
    // Handle section reordering
    console.log('Section dropped:', draggedItem, targetIndex)
  })

  const { isOver: isComponentOver, canDrop: canComponentDrop, drop: componentDrop } = useComponentDrop(
    pageId,
    (componentType, targetIndex) => {
      onAddSection(componentType, targetIndex)
    }
  )

  const isActive = isOver || isComponentOver
  const canDropHere = canDrop || canComponentDrop

  return (
    <div
      ref={(node) => {
        drop(node)
        componentDrop(node)
      }}
      className={`
        min-h-[200px] transition-all duration-200
        ${isActive && canDropHere 
          ? 'bg-blue-100 border-2 border-blue-300 border-dashed' 
          : 'bg-transparent'
        }
        ${canDropHere ? 'border-dashed border-gray-300' : ''}
      `}
    >
      {children}
      
      {/* Drop Zone Indicator */}
      {isActive && canDropHere && (
        <div className="flex items-center justify-center py-8 text-blue-600">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Hier ablegen</span>
          </div>
        </div>
      )}
    </div>
  )
}
