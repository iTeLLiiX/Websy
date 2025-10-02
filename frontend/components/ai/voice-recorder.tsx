'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Play, Square, Loader2 } from 'lucide-react'
import { useWebsiteBuilder } from '@/contexts/website-builder-context'

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  onError: (error: string) => void
}

export function VoiceRecorder({ onTranscription, onError }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<string>('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      onError('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff auf Ihr Mikrofon.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
    }
  }

  const processRecording = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      const response = await fetch('/api/ai/voice-to-text', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      setTranscription(data.transcription)
      onTranscription(data.transcription)
    } catch (error) {
      console.error('Error processing recording:', error)
      onError('Fehler bei der Spracherkennung. Bitte versuchen Sie es erneut.')
    } finally {
      setIsProcessing(false)
    }
  }

  const generateWebsiteFromVoice = async () => {
    if (!transcription) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/ai/voice-to-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription,
          businessType: 'restaurant', // Default, should be dynamic
        }),
      })

      if (!response.ok) {
        throw new Error('Website generation failed')
      }

      const data = await response.json()
      // Handle website generation result
      console.log('Generated website:', data)
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
          <Mic className="w-5 h-5" />
          <span>Sprache zu Website</span>
        </CardTitle>
        <CardDescription>
          Sprechen Sie Ihre Website-Ideen und lassen Sie KI eine Website erstellen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              Aufnahme starten
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <MicOff className="w-4 h-4 mr-2" />
              Aufnahme stoppen
            </Button>
          )}
        </div>

        {/* Audio Playback */}
        {audioUrl && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={playRecording}
              variant="outline"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Abspielen
            </Button>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="flex-1"
            />
          </div>
        )}

        {/* Transcription */}
        {transcription && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Transkription:
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-800">{transcription}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={processRecording}
            disabled={!audioBlob || isProcessing}
            variant="outline"
            className="flex-1"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Transkribieren
          </Button>
          
          <Button
            onClick={generateWebsiteFromVoice}
            disabled={!transcription || isProcessing}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Website erstellen
          </Button>
        </div>

        {/* Status */}
        {isRecording && (
          <div className="flex items-center space-x-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm">Aufnahme läuft...</span>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">KI verarbeitet Ihre Aufnahme...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
