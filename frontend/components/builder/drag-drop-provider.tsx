'use client'

import React, { createContext, useContext, useCallback, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface DragItem {
  id: string
  type: string
  index: number
  sectionType?: string
}

interface DropResult {
  dropEffect: string
}

interface DragDropContextType {
  isDragging: boolean
  draggedItem: DragItem | null
  dropTarget: string | null
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined)

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  const value: DragDropContextType = {
    isDragging,
    draggedItem,
    dropTarget,
  }

  return (
    <DragDropContext.Provider value={value}>
      <DndProvider backend={HTML5Backend}>
        {children}
      </DndProvider>
    </DragDropContext.Provider>
  )
}

export function useDragDrop() {
  const context = useContext(DragDropContext)
  if (context === undefined) {
    throw new Error('useDragDrop must be used within a DragDropProvider')
  }
  return context
}

// Drag hook for sections
export function useSectionDrag(sectionId: string, index: number, sectionType: string) {
  const [{ isDragging }, drag] = useDrag({
    type: 'section',
    item: { id: sectionId, type: 'section', index, sectionType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return { isDragging, drag }
}

// Drop hook for sections
export function useSectionDrop(
  pageId: string,
  onDrop: (draggedItem: DragItem, targetIndex: number) => void
) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'section',
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return

      const targetIndex = 0 // Calculate based on drop position
      onDrop(item, targetIndex)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  return { isOver, canDrop, drop }
}

// Drag hook for components
export function useComponentDrag(componentType: string) {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { id: `component-${componentType}`, type: 'component', sectionType: componentType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return { isDragging, drag }
}

// Drop hook for components
export function useComponentDrop(
  pageId: string,
  onDrop: (componentType: string, targetIndex: number) => void
) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'component',
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return

      const targetIndex = 0 // Calculate based on drop position
      onDrop(item.sectionType!, targetIndex)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  return { isOver, canDrop, drop }
}
