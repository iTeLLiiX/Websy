'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Loader2, Bot, User } from 'lucide-react'
import { useWebsiteBuilder } from '@/contexts/website-builder-context'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface ChatEditorProps {
  onCommandExecuted: (command: any) => void
  onError: (error: string) => void
}

export function ChatEditor({ onCommandExecuted, onError }: ChatEditorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen bei der Gestaltung Ihrer Website helfen?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { state } = useWebsiteBuilder()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      const response = await fetch('/api/ai/chat-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: input.trim(),
          websiteData: state.selectedWebsite,
          currentPage: state.selectedPage,
          currentSection: state.selectedSection,
        }),
      })

      if (!response.ok) {
        throw new Error('Chat processing failed')
      }

      const data = await response.json()
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.explanation || 'Ich habe Ihre Anfrage verarbeitet.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
      
      if (data.action) {
        onCommandExecuted(data)
      }
    } catch (error) {
      console.error('Error processing chat:', error)
      onError('Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut.')
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut.',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const suggestedCommands = [
    'Mach den Button größer',
    'Ändere die Farbe zu blau',
    'Füge ein Bild hinzu',
    'Mache den Text fett',
    'Zentriere den Inhalt',
    'Füge einen Kontakt-Bereich hinzu',
  ]

  const handleSuggestedCommand = (command: string) => {
    setInput(command)
  }

  return (
    <Card className="w-full h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Chat-Editor</span>
        </CardTitle>
        <CardDescription>
          Sprechen Sie mit der KI, um Ihre Website zu bearbeiten
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 max-h-48">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] p-3 rounded-lg
                  ${message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                  }
                `}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">KI denkt nach...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Commands */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Vorschläge:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedCommands.map((command, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedCommand(command)}
                className="text-xs"
              >
                {command}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Sagen Sie mir, was Sie ändern möchten..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isProcessing}
            size="sm"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
