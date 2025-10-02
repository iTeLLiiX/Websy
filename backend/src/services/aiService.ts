import OpenAI from 'openai'
import { logger } from '../utils/logger'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class AIService {
  // Voice-to-Website: Convert speech to website content
  static async generateWebsiteFromVoice(audioBuffer: Buffer, businessType: string): Promise<any> {
    try {
      logger.info('Starting voice-to-website generation', { businessType })

      // Transcribe audio using Whisper
      const transcription = await this.transcribeAudio(audioBuffer)
      logger.info('Audio transcribed successfully', { length: transcription.length })

      // Generate website content from transcription
      const websiteContent = await this.generateWebsiteContent(transcription, businessType)
      logger.info('Website content generated successfully')

      return {
        success: true,
        data: {
          transcription,
          websiteContent,
          businessType,
        },
      }
    } catch (error) {
      logger.error('Voice-to-website generation failed:', error)
      throw new Error('Fehler bei der Sprach-zu-Website-Generierung')
    }
  }

  // Photo-to-Website: Convert image to website content
  static async generateWebsiteFromPhoto(imageBuffer: Buffer, businessType?: string): Promise<any> {
    try {
      logger.info('Starting photo-to-website generation', { businessType })

      // Analyze image using GPT-4 Vision
      const imageAnalysis = await this.analyzeImage(imageBuffer)
      logger.info('Image analyzed successfully')

      // Generate website content from image analysis
      const websiteContent = await this.generateWebsiteContent(imageAnalysis, businessType)
      logger.info('Website content generated successfully')

      return {
        success: true,
        data: {
          imageAnalysis,
          websiteContent,
          businessType: businessType || 'service',
        },
      }
    } catch (error) {
      logger.error('Photo-to-website generation failed:', error)
      throw new Error('Fehler bei der Foto-zu-Website-Generierung')
    }
  }

  // Chat-based editing: Process natural language commands
  static async chatEditWebsite(command: string, websiteData: any): Promise<any> {
    try {
      logger.info('Processing chat command', { command: command.substring(0, 100) })

      const prompt = `
        Du bist ein Website-Builder-Assistent. Der Benutzer hat folgende Anfrage:
        "${command}"
        
        Aktuelle Website-Daten:
        ${JSON.stringify(websiteData, null, 2)}
        
        Bitte analysiere die Anfrage und gib eine strukturierte Antwort zurück, die folgende Informationen enthält:
        - action: Die Aktion, die ausgeführt werden soll (z.B. "update_text", "change_color", "add_section", etc.)
        - target: Das Ziel-Element (z.B. "header", "button", "section_1", etc.)
        - changes: Die spezifischen Änderungen
        - explanation: Eine Erklärung der Änderungen
        
        Antworte nur mit einem gültigen JSON-Objekt.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein hilfreicher Website-Builder-Assistent. Antworte immer in strukturiertem JSON-Format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      logger.info('Chat command processed successfully', { action: result.action })

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      logger.error('Chat editing failed:', error)
      throw new Error('Fehler bei der Chat-Bearbeitung')
    }
  }

  // Auto-branding: Generate brand colors and styling
  static async autoBrand(businessType: string, businessName: string, description?: string): Promise<any> {
    try {
      logger.info('Starting auto-branding', { businessType, businessName })

      const prompt = `
        Du bist ein Branding-Experte. Erstelle ein professionelles Branding für:
        - Unternehmen: ${businessName}
        - Branche: ${businessType}
        ${description ? `- Beschreibung: ${description}` : ''}
        
        Bitte erstelle:
        1. Eine Farbpalette (Primärfarbe, Sekundärfarbe, Akzentfarbe)
        2. Eine Schriftart-Empfehlung
        3. Ein Logo-Konzept (Text-basiert)
        4. Styling-Empfehlungen
        
        Antworte mit einem JSON-Objekt mit folgenden Feldern:
        - primaryColor: Hex-Code der Primärfarbe
        - secondaryColor: Hex-Code der Sekundärfarbe
        - accentColor: Hex-Code der Akzentfarbe
        - fontFamily: Empfohlene Schriftart
        - logoText: Logo-Text
        - logoStyle: Logo-Styling (z.B. "bold", "elegant", "modern")
        - borderRadius: Border-Radius-Empfehlung
        - spacing: Spacing-Empfehlung
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein professioneller Branding-Experte. Erstelle konsistente und professionelle Branding-Lösungen.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      })

      const branding = JSON.parse(response.choices[0].message.content || '{}')
      logger.info('Auto-branding completed successfully')

      return {
        success: true,
        data: branding,
      }
    } catch (error) {
      logger.error('Auto-branding failed:', error)
      throw new Error('Fehler bei der automatischen Branding-Generierung')
    }
  }

  // Content translation
  static async translateContent(content: string, targetLanguage: string): Promise<any> {
    try {
      logger.info('Starting content translation', { targetLanguage, contentLength: content.length })

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Du bist ein professioneller Übersetzer. Übersetze den folgenden Text ins ${targetLanguage}. Behalte die ursprüngliche Formatierung bei und verwende natürliche, professionelle Sprache.`,
          },
          {
            role: 'user',
            content: content,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })

      const translation = response.choices[0].message.content || ''
      logger.info('Content translated successfully', { translationLength: translation.length })

      return {
        success: true,
        data: {
          original: content,
          translation,
          targetLanguage,
        },
      }
    } catch (error) {
      logger.error('Content translation failed:', error)
      throw new Error('Fehler bei der Übersetzung')
    }
  }

  // Auto-optimize website content
  static async autoOptimize(websiteData: any, optimizationType: string): Promise<any> {
    try {
      logger.info('Starting auto-optimization', { optimizationType })

      let prompt = ''
      
      switch (optimizationType) {
        case 'seo':
          prompt = `
            Du bist ein SEO-Experte. Optimiere den folgenden Website-Inhalt für Suchmaschinen:
            ${JSON.stringify(websiteData, null, 2)}
            
            Bitte optimiere:
            - Meta-Titel und -Beschreibungen
            - Überschriften-Struktur
            - Keyword-Integration
            - Alt-Texte für Bilder
            - Interne Verlinkung
            
            Antworte mit einem JSON-Objekt mit den optimierten Inhalten.
          `
          break
          
        case 'performance':
          prompt = `
            Du bist ein Performance-Experte. Optimiere den folgenden Website-Inhalt für bessere Performance:
            ${JSON.stringify(websiteData, null, 2)}
            
            Bitte optimiere:
            - Bildgrößen und -formate
            - CSS- und JavaScript-Optimierung
            - Lazy Loading-Empfehlungen
            - Caching-Strategien
            
            Antworte mit einem JSON-Objekt mit den Performance-Optimierungen.
          `
          break
          
        case 'accessibility':
          prompt = `
            Du bist ein Accessibility-Experte. Optimiere den folgenden Website-Inhalt für Barrierefreiheit:
            ${JSON.stringify(websiteData, null, 2)}
            
            Bitte optimiere:
            - ARIA-Labels
            - Farbkontraste
            - Tastaturnavigation
            - Screen-Reader-Kompatibilität
            
            Antworte mit einem JSON-Objekt mit den Accessibility-Optimierungen.
          `
          break
          
        default:
          throw new Error('Unbekannter Optimierungstyp')
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Website-Optimierung. Erstelle professionelle und effektive Optimierungen.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const optimization = JSON.parse(response.choices[0].message.content || '{}')
      logger.info('Auto-optimization completed successfully', { optimizationType })

      return {
        success: true,
        data: {
          type: optimizationType,
          optimizations: optimization,
          originalData: websiteData,
        },
      }
    } catch (error) {
      logger.error('Auto-optimization failed:', error)
      throw new Error('Fehler bei der automatischen Optimierung')
    }
  }

  // Generate website content from text input
  private static async generateWebsiteContent(input: string, businessType: string): Promise<any> {
    const prompt = `
      Du bist ein professioneller Website-Designer. Erstelle eine komplette Website-Struktur basierend auf:
      - Eingabe: ${input}
      - Branche: ${businessType}
      
      Bitte erstelle:
      1. Eine Homepage mit Hero-Sektion
      2. Über uns-Sektion
      3. Services/Produkte-Sektion
      4. Kontakt-Sektion
      5. Footer
      
      Für jede Sektion erstelle:
      - Titel
      - Beschreibung
      - Call-to-Action-Buttons
      - Styling-Empfehlungen
      
      Antworte mit einem JSON-Objekt mit der Website-Struktur.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein professioneller Website-Designer. Erstelle moderne, benutzerfreundliche Website-Strukturen.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  // Transcribe audio using Whisper
  private static async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' })
    
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'de', // German language
    })

    return response.text
  }

  // Analyze image using GPT-4 Vision
  private static async analyzeImage(imageBuffer: Buffer): Promise<string> {
    const base64Image = imageBuffer.toString('base64')
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analysiere dieses Bild und beschreibe, was du siehst. Konzentriere dich auf Geschäftstyp, Stil, Farben und wichtige Elemente.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    return response.choices[0].message.content || ''
  }

  // Generate image using DALL-E
  static async generateImage(prompt: string, size: '256x256' | '512x512' | '1024x1024' = '512x512'): Promise<any> {
    try {
      logger.info('Generating image with DALL-E', { prompt: prompt.substring(0, 100) })

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size,
        quality: 'standard',
        n: 1,
      })

      const imageUrl = response.data[0].url
      logger.info('Image generated successfully', { imageUrl })

      return {
        success: true,
        data: {
          imageUrl,
          prompt,
          size,
        },
      }
    } catch (error) {
      logger.error('Image generation failed:', error)
      throw new Error('Fehler bei der Bildgenerierung')
    }
  }

  // Generate content for specific sections
  static async generateSectionContent(sectionType: string, businessInfo: any): Promise<any> {
    try {
      logger.info('Generating section content', { sectionType })

      const prompt = `
        Du bist ein professioneller Content-Writer. Erstelle Inhalt für eine "${sectionType}"-Sektion für:
        - Unternehmen: ${businessInfo.name}
        - Branche: ${businessInfo.type}
        ${businessInfo.description ? `- Beschreibung: ${businessInfo.description}` : ''}
        
        Erstelle:
        - Einen ansprechenden Titel
        - Eine überzeugende Beschreibung
        - Call-to-Action-Buttons
        - Styling-Empfehlungen
        
        Antworte mit einem JSON-Objekt.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein professioneller Content-Writer. Erstelle überzeugende und benutzerfreundliche Inhalte.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const content = JSON.parse(response.choices[0].message.content || '{}')
      logger.info('Section content generated successfully', { sectionType })

      return {
        success: true,
        data: content,
      }
    } catch (error) {
      logger.error('Section content generation failed:', error)
      throw new Error('Fehler bei der Sektions-Content-Generierung')
    }
  }

  // Speech to text
  static async speechToText(audioBuffer: Buffer, language: string = 'de'): Promise<string> {
    try {
      logger.info('Starting speech to text conversion', { language })

      const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' })
      
      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language,
      })

      const transcription = response.text
      logger.info('Speech to text completed', { 
        language, 
        transcriptionLength: transcription.length 
      })

      return transcription
    } catch (error) {
      logger.error('Speech to text failed:', error)
      throw new Error('Fehler bei der Spracherkennung')
    }
  }

  // Generate content
  static async generateContent(prompt: string, context: any): Promise<any> {
    try {
      logger.info('Generating content', { promptLength: prompt.length })

      const systemPrompt = `
        Du bist ein professioneller Content-Writer für Websites. 
        Erstelle hochwertige, SEO-optimierte Inhalte basierend auf dem gegebenen Kontext.
        
        Kontext:
        - Branche: ${context.businessType || 'Allgemein'}
        - Zielgruppe: ${context.targetAudience || 'Allgemein'}
        - Ton: ${context.tone || 'professionell'}
        - Sprache: ${context.language || 'Deutsch'}
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })

      const content = response.choices[0].message.content || ''
      logger.info('Content generated successfully', { contentLength: content.length })

      return {
        success: true,
        data: {
          content,
          prompt,
          context,
        },
      }
    } catch (error) {
      logger.error('Content generation failed:', error)
      throw new Error('Fehler bei der Content-Generierung')
    }
  }

  // Generate images
  static async generateImages(prompt: string, count: number = 1, size: string = '1024x1024'): Promise<any> {
    try {
      logger.info('Generating images', { prompt: prompt.substring(0, 100), count, size })

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size: size as any,
        quality: 'standard',
        n: Math.min(count, 1), // DALL-E 3 only supports n=1
      })

      const images = response.data.map(img => ({
        url: img.url,
        prompt,
        size,
      }))

      logger.info('Images generated successfully', { count: images.length })

      return {
        success: true,
        data: images,
      }
    } catch (error) {
      logger.error('Image generation failed:', error)
      throw new Error('Fehler bei der Bildgenerierung')
    }
  }

  // Generate branding
  static async generateBranding(businessType: string, preferences: any): Promise<any> {
    try {
      logger.info('Generating branding', { businessType })

      const prompt = `
        Du bist ein Branding-Experte. Erstelle ein professionelles Branding für:
        - Branche: ${businessType}
        - Stil: ${preferences.style || 'modern'}
        - Farben: ${preferences.colors ? preferences.colors.join(', ') : 'automatisch'}
        
        Erstelle:
        1. Eine Farbpalette (Primär, Sekundär, Akzent)
        2. Schriftart-Empfehlungen
        3. Logo-Konzept
        4. Styling-Richtlinien
        
        Antworte mit einem JSON-Objekt.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein professioneller Branding-Experte. Erstelle konsistente und professionelle Branding-Lösungen.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const branding = JSON.parse(response.choices[0].message.content || '{}')
      logger.info('Branding generated successfully')

      return {
        success: true,
        data: branding,
      }
    } catch (error) {
      logger.error('Branding generation failed:', error)
      throw new Error('Fehler bei der Branding-Generierung')
    }
  }

  // Optimize content
  static async optimizeContent(content: string, type: string, context: any): Promise<any> {
    try {
      logger.info('Optimizing content', { type, contentLength: content.length })

      let prompt = ''
      
      switch (type) {
        case 'seo':
          prompt = `
            Du bist ein SEO-Experte. Optimiere den folgenden Inhalt für Suchmaschinen:
            
            Inhalt: ${content}
            Zielgruppe: ${context.targetAudience || 'Allgemein'}
            Keywords: ${context.targetKeywords ? context.targetKeywords.join(', ') : 'automatisch'}
            
            Optimiere:
            - Meta-Titel und -Beschreibungen
            - Überschriften-Struktur
            - Keyword-Integration
            - Lesbarkeit
            
            Antworte mit einem JSON-Objekt mit den optimierten Inhalten.
          `
          break
          
        case 'readability':
          prompt = `
            Du bist ein Content-Experte. Verbessere die Lesbarkeit des folgenden Inhalts:
            
            Inhalt: ${content}
            Zielgruppe: ${context.targetAudience || 'Allgemein'}
            
            Verbessere:
            - Satzstruktur
            - Wortwahl
            - Absatzaufteilung
            - Verständlichkeit
            
            Antworte mit einem JSON-Objekt mit dem verbesserten Inhalt.
          `
          break
          
        case 'conversion':
          prompt = `
            Du bist ein Conversion-Experte. Optimiere den folgenden Inhalt für bessere Conversion:
            
            Inhalt: ${content}
            Zielgruppe: ${context.targetAudience || 'Allgemein'}
            
            Optimiere:
            - Call-to-Action-Buttons
            - Überzeugende Formulierungen
            - Vertrauensaufbau
            - Handlungsaufforderungen
            
            Antworte mit einem JSON-Objekt mit dem optimierten Inhalt.
          `
          break
          
        default:
          throw new Error('Unbekannter Optimierungstyp')
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Content-Optimierung. Erstelle professionelle und effektive Optimierungen.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const optimization = JSON.parse(response.choices[0].message.content || '{}')
      logger.info('Content optimization completed', { type })

      return {
        success: true,
        data: {
          type,
          originalContent: content,
          optimizedContent: optimization,
        },
      }
    } catch (error) {
      logger.error('Content optimization failed:', error)
      throw new Error('Fehler bei der Content-Optimierung')
    }
  }

  // Process chat command
  static async processChatCommand(command: string, currentContent: any, context: any): Promise<any> {
    try {
      logger.info('Processing chat command', { command: command.substring(0, 100) })

      const prompt = `
        Du bist ein Website-Builder-Assistent. Der Benutzer hat folgende Anfrage:
        "${command}"
        
        Aktueller Website-Inhalt:
        ${JSON.stringify(currentContent, null, 2)}
        
        Kontext:
        - Website-Typ: ${context.websiteType || 'Allgemein'}
        - Aktuelle Seite: ${context.currentPage || 'Homepage'}
        - Benutzer-Präferenzen: ${JSON.stringify(context.userPreferences || {}, null, 2)}
        
        Analysiere die Anfrage und gib eine strukturierte Antwort zurück:
        - action: Die Aktion (update_text, change_color, add_section, etc.)
        - target: Das Ziel-Element (header, button, section_1, etc.)
        - changes: Die spezifischen Änderungen
        - explanation: Eine Erklärung der Änderungen
        
        Antworte nur mit einem gültigen JSON-Objekt.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein hilfreicher Website-Builder-Assistent. Antworte immer in strukturiertem JSON-Format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      logger.info('Chat command processed successfully', { action: result.action })

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      logger.error('Chat command processing failed:', error)
      throw new Error('Fehler bei der Chat-Befehls-Verarbeitung')
    }
  }

  // Generate FAQ content
  static async generateFAQ(businessInfo: any): Promise<any> {
    try {
      logger.info('Generating FAQ content', { businessName: businessInfo.name })

      const prompt = `
        Du bist ein professioneller Content-Writer. Erstelle 5-7 häufig gestellte Fragen (FAQ) für:
        - Unternehmen: ${businessInfo.name}
        - Branche: ${businessInfo.type}
        ${businessInfo.description ? `- Beschreibung: ${businessInfo.description}` : ''}
        
        Erstelle realistische Fragen, die Kunden in dieser Branche stellen würden, und gib hilfreiche, professionelle Antworten.
        
        Antworte mit einem JSON-Objekt mit einem "faqs"-Array, wobei jedes FAQ-Objekt "question" und "answer" enthält.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein professioneller Content-Writer. Erstelle hilfreiche und realistische FAQ-Inhalte.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })

      const faq = JSON.parse(response.choices[0].message.content || '{}')
      logger.info('FAQ content generated successfully')

      return {
        success: true,
        data: faq,
      }
    } catch (error) {
      logger.error('FAQ generation failed:', error)
      throw new Error('Fehler bei der FAQ-Generierung')
    }
  }

  // Generate testimonials
  static async generateTestimonials(businessInfo: any): Promise<any> {
    try {
      logger.info('Generating testimonials', { businessName: businessInfo.name })

      const prompt = `
        Du bist ein professioneller Content-Writer. Erstelle 3-5 realistische Kundenbewertungen für:
        - Unternehmen: ${businessInfo.name}
        - Branche: ${businessInfo.type}
        ${businessInfo.description ? `- Beschreibung: ${businessInfo.description}` : ''}
        
        Erstelle verschiedene Kundenpersönlichkeiten und schreibe authentische, positive Bewertungen.
        
        Antworte mit einem JSON-Objekt mit einem "testimonials"-Array, wobei jedes Testimonial-Objekt "name", "role", "content" und "rating" enthält.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein professioneller Content-Writer. Erstelle authentische und überzeugende Kundenbewertungen.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1200,
      })

      const testimonials = JSON.parse(response.choices[0].message.content || '{}')
      logger.info('Testimonials generated successfully')

      return {
        success: true,
        data: testimonials,
      }
    } catch (error) {
      logger.error('Testimonials generation failed:', error)
      throw new Error('Fehler bei der Testimonial-Generierung')
    }
  }
}

export const aiService = AIService