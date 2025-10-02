'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { Website, Page, Section, BuilderState, BuilderAction } from '@/types'
import { websiteAPI } from '@/lib/api/website'

interface WebsiteBuilderContextType {
  state: BuilderState
  websites: Website[]
  loadWebsites: () => Promise<void>
  selectWebsite: (website: Website) => void
  selectPage: (page: Page) => void
  selectSection: (section: Section) => void
  addSection: (section: Omit<Section, 'id'>) => Promise<void>
  updateSection: (sectionId: string, updates: Partial<Section>) => Promise<void>
  deleteSection: (sectionId: string) => Promise<void>
  moveSection: (sectionId: string, newOrder: number) => Promise<void>
  updatePageContent: (pageId: string, updates: Partial<Page>) => Promise<void>
  togglePreviewMode: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  saveWebsite: () => Promise<void>
  publishWebsite: () => Promise<void>
}

type BuilderActionType =
  | { type: 'SELECT_WEBSITE'; payload: Website }
  | { type: 'SELECT_PAGE'; payload: Page }
  | { type: 'SELECT_SECTION'; payload: Section }
  | { type: 'ADD_SECTION'; payload: Section }
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<Section> } }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'MOVE_SECTION'; payload: { id: string; newOrder: number } }
  | { type: 'UPDATE_PAGE'; payload: { id: string; updates: Partial<Page> } }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_AI_PROCESSING'; payload: boolean }
  | { type: 'PUSH_ACTION'; payload: BuilderAction }
  | { type: 'CLEAR_REDO_STACK' }

const initialState: BuilderState = {
  selectedWebsite: undefined,
  selectedPage: undefined,
  selectedSection: undefined,
  isPreviewMode: false,
  isAIProcessing: false,
  undoStack: [],
  redoStack: [],
}

function builderReducer(state: BuilderState, action: BuilderActionType): BuilderState {
  switch (action.type) {
    case 'SELECT_WEBSITE':
      return {
        ...state,
        selectedWebsite: action.payload,
        selectedPage: action.payload.pages.find(p => p.isHomePage) || action.payload.pages[0],
        selectedSection: undefined,
      }

    case 'SELECT_PAGE':
      return {
        ...state,
        selectedPage: action.payload,
        selectedSection: action.payload.sections[0],
      }

    case 'SELECT_SECTION':
      return {
        ...state,
        selectedSection: action.payload,
      }

    case 'ADD_SECTION':
      if (!state.selectedPage) return state
      
      const newSection = {
        ...action.payload,
        order: state.selectedPage.sections.length,
      }
      
      return {
        ...state,
        selectedPage: {
          ...state.selectedPage,
          sections: [...state.selectedPage.sections, newSection],
        },
        selectedWebsite: state.selectedWebsite ? {
          ...state.selectedWebsite,
          pages: state.selectedWebsite.pages.map(p => 
            p.id === state.selectedPage!.id 
              ? { ...p, sections: [...p.sections, newSection] }
              : p
          ),
        } : undefined,
      }

    case 'UPDATE_SECTION':
      if (!state.selectedPage || !state.selectedWebsite) return state
      
      const updatedSection = state.selectedPage.sections.find(s => s.id === action.payload.id)
      if (!updatedSection) return state
      
      const updatedSections = state.selectedPage.sections.map(s =>
        s.id === action.payload.id 
          ? { ...s, ...action.payload.updates }
          : s
      )
      
      return {
        ...state,
        selectedPage: {
          ...state.selectedPage,
          sections: updatedSections,
        },
        selectedWebsite: {
          ...state.selectedWebsite,
          pages: state.selectedWebsite.pages.map(p =>
            p.id === state.selectedPage!.id
              ? { ...p, sections: updatedSections }
              : p
          ),
        },
        selectedSection: state.selectedSection?.id === action.payload.id
          ? { ...state.selectedSection, ...action.payload.updates }
          : state.selectedSection,
      }

    case 'DELETE_SECTION':
      if (!state.selectedPage || !state.selectedWebsite) return state
      
      const filteredSections = state.selectedPage.sections.filter(s => s.id !== action.payload)
      
      return {
        ...state,
        selectedPage: {
          ...state.selectedPage,
          sections: filteredSections,
        },
        selectedWebsite: {
          ...state.selectedWebsite,
          pages: state.selectedWebsite.pages.map(p =>
            p.id === state.selectedPage!.id
              ? { ...p, sections: filteredSections }
              : p
          ),
        },
        selectedSection: state.selectedSection?.id === action.payload
          ? filteredSections[0]
          : state.selectedSection,
      }

    case 'MOVE_SECTION':
      if (!state.selectedPage || !state.selectedWebsite) return state
      
      const sections = [...state.selectedPage.sections]
      const sectionIndex = sections.findIndex(s => s.id === action.payload.id)
      
      if (sectionIndex === -1) return state
      
      const [movedSection] = sections.splice(sectionIndex, 1)
      sections.splice(action.payload.newOrder, 0, movedSection)
      
      // Update order numbers
      const reorderedSections = sections.map((section, index) => ({
        ...section,
        order: index,
      }))
      
      return {
        ...state,
        selectedPage: {
          ...state.selectedPage,
          sections: reorderedSections,
        },
        selectedWebsite: {
          ...state.selectedWebsite,
          pages: state.selectedWebsite.pages.map(p =>
            p.id === state.selectedPage!.id
              ? { ...p, sections: reorderedSections }
              : p
          ),
        },
      }

    case 'UPDATE_PAGE':
      if (!state.selectedWebsite) return state
      
      const updatedPages = state.selectedWebsite.pages.map(p =>
        p.id === action.payload.id
          ? { ...p, ...action.payload.updates }
          : p
      )
      
      return {
        ...state,
        selectedWebsite: {
          ...state.selectedWebsite,
          pages: updatedPages,
        },
        selectedPage: state.selectedPage?.id === action.payload.id
          ? { ...state.selectedPage, ...action.payload.updates }
          : state.selectedPage,
      }

    case 'TOGGLE_PREVIEW':
      return {
        ...state,
        isPreviewMode: !state.isPreviewMode,
      }

    case 'SET_AI_PROCESSING':
      return {
        ...state,
        isAIProcessing: action.payload,
      }

    case 'PUSH_ACTION':
      return {
        ...state,
        undoStack: [...state.undoStack, action.payload],
        redoStack: [], // Clear redo stack when new action is pushed
      }

    case 'UNDO':
      if (state.undoStack.length === 0) return state
      
      const lastAction = state.undoStack[state.undoStack.length - 1]
      const newUndoStack = state.undoStack.slice(0, -1)
      
      return {
        ...state,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, lastAction],
      }

    case 'REDO':
      if (state.redoStack.length === 0) return state
      
      const nextAction = state.redoStack[state.redoStack.length - 1]
      const newRedoStack = state.redoStack.slice(0, -1)
      
      return {
        ...state,
        undoStack: [...state.undoStack, nextAction],
        redoStack: newRedoStack,
      }

    case 'CLEAR_REDO_STACK':
      return {
        ...state,
        redoStack: [],
      }

    default:
      return state
  }
}

const WebsiteBuilderContext = createContext<WebsiteBuilderContextType | undefined>(undefined)

export function WebsiteBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, initialState)
  const [websites, setWebsites] = React.useState<Website[]>([])

  const loadWebsites = useCallback(async () => {
    try {
      const response = await fetch('/api/websites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setWebsites(data.data)
      }
    } catch (error) {
      console.error('Error loading websites:', error)
    }
  }, [])

  const selectWebsite = useCallback((website: Website) => {
    dispatch({ type: 'SELECT_WEBSITE', payload: website })
  }, [])

  const selectPage = useCallback((page: Page) => {
    dispatch({ type: 'SELECT_PAGE', payload: page })
  }, [])

  const selectSection = useCallback((section: Section) => {
    dispatch({ type: 'SELECT_SECTION', payload: section })
  }, [])

  const addSection = useCallback(async (sectionData: Omit<Section, 'id'>) => {
    try {
      if (!state.selectedPage || !state.selectedWebsite) return
      
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      
      const newSection = await websiteAPI.addSection(state.selectedPage.id, sectionData)
      
      dispatch({ type: 'ADD_SECTION', payload: newSection })
      
      // Push action to undo stack
      dispatch({
        type: 'PUSH_ACTION',
        payload: {
          id: `add-section-${Date.now()}`,
          type: 'add',
          target: 'section',
          data: newSection,
          timestamp: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to add section:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false })
    }
  }, [state.selectedPage, state.selectedWebsite])

  const updateSection = useCallback(async (sectionId: string, updates: Partial<Section>) => {
    try {
      if (!state.selectedPage || !state.selectedWebsite) return
      
      const oldSection = state.selectedPage.sections.find(s => s.id === sectionId)
      if (!oldSection) return
      
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      
      const updatedSection = await websiteAPI.updateSection(sectionId, updates)
      
      dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, updates } })
      
      // Push action to undo stack
      dispatch({
        type: 'PUSH_ACTION',
        payload: {
          id: `update-section-${Date.now()}`,
          type: 'update',
          target: 'section',
          data: { oldSection, newSection: updatedSection },
          timestamp: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to update section:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false })
    }
  }, [state.selectedPage, state.selectedWebsite])

  const deleteSection = useCallback(async (sectionId: string) => {
    try {
      if (!state.selectedPage || !state.selectedWebsite) return
      
      const sectionToDelete = state.selectedPage.sections.find(s => s.id === sectionId)
      if (!sectionToDelete) return
      
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      
      await websiteAPI.deleteSection(sectionId)
      
      dispatch({ type: 'DELETE_SECTION', payload: sectionId })
      
      // Push action to undo stack
      dispatch({
        type: 'PUSH_ACTION',
        payload: {
          id: `delete-section-${Date.now()}`,
          type: 'delete',
          target: 'section',
          data: sectionToDelete,
          timestamp: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to delete section:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false })
    }
  }, [state.selectedPage, state.selectedWebsite])

  const moveSection = useCallback(async (sectionId: string, newOrder: number) => {
    try {
      if (!state.selectedPage || !state.selectedWebsite) return
      
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      
      await websiteAPI.moveSection(sectionId, newOrder)
      
      dispatch({ type: 'MOVE_SECTION', payload: { id: sectionId, newOrder } })
    } catch (error) {
      console.error('Failed to move section:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false })
    }
  }, [state.selectedPage, state.selectedWebsite])

  const updatePageContent = useCallback(async (pageId: string, updates: Partial<Page>) => {
    try {
      if (!state.selectedWebsite) return
      
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      
      await websiteAPI.updatePage(pageId, updates)
      
      dispatch({ type: 'UPDATE_PAGE', payload: { id: pageId, updates } })
    } catch (error) {
      console.error('Failed to update page:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false })
    }
  }, [state.selectedWebsite])

  const togglePreviewMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_PREVIEW' })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])

  const canUndo = state.undoStack.length > 0
  const canRedo = state.redoStack.length > 0

  const saveWebsite = useCallback(async () => {
    try {
      if (!state.selectedWebsite) return
      
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      
      await websiteAPI.updateWebsite(state.selectedWebsite.id, state.selectedWebsite)
    } catch (error) {
      console.error('Failed to save website:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false })
    }
  }, [state.selectedWebsite])

  const publishWebsite = useCallback(async () => {
    try {
      if (!state.selectedWebsite) return
      
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      
      await websiteAPI.publishWebsite(state.selectedWebsite.id)
      
      dispatch({
        type: 'UPDATE_PAGE',
        payload: {
          id: state.selectedWebsite.id,
          updates: { status: 'published', publishedAt: new Date() },
        },
      })
    } catch (error) {
      console.error('Failed to publish website:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false })
    }
  }, [state.selectedWebsite])

  const canUndo = state.undoStack.length > 0
  const canRedo = state.redoStack.length > 0

  const value: WebsiteBuilderContextType = {
    state,
    websites,
    loadWebsites,
    selectWebsite,
    selectPage,
    selectSection,
    addSection,
    updateSection,
    deleteSection,
    moveSection,
    updatePageContent,
    togglePreviewMode,
    undo,
    redo,
    canUndo,
    canRedo,
    saveWebsite,
    publishWebsite,
  }

  return (
    <WebsiteBuilderContext.Provider value={value}>
      {children}
    </WebsiteBuilderContext.Provider>
  )
}

export function useWebsiteBuilder() {
  const context = useContext(WebsiteBuilderContext)
  if (context === undefined) {
    throw new Error('useWebsiteBuilder must be used within a WebsiteBuilderProvider')
  }
  return context
}
