import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { aiService } from '../services/aiService'
import { authMiddleware } from '../middleware/auth'
import { aiRateLimiter } from '../middleware/rateLimiter'
import { upload } from '../middleware/upload'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Apply rate limiting to all AI routes
router.use(aiRateLimiter)

// Apply authentication to all AI routes
router.use(authMiddleware)

// Speech to text endpoint
router.post(
  '/speech-to-text',
  upload.single('audio'),
  [
    body('language').optional().isString().isLength({ min: 2, max: 5 }),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: errors.array(),
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Keine Audiodatei hochgeladen',
      })
    }

    const language = req.body.language || 'de'
    const text = await aiService.speechToText(req.file.buffer, language)

    res.json({
      success: true,
      data: {
        text,
        language,
        confidence: 0.95, // Whisper doesn't provide confidence scores
      },
    })
  })
)

// Voice to text endpoint (alias for speech-to-text)
router.post(
  '/voice-to-text',
  upload.single('audio'),
  [
    body('language').optional().isString().isLength({ min: 2, max: 5 }),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: errors.array(),
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Keine Audiodatei hochgeladen',
      })
    }

    const language = req.body.language || 'de'
    const text = await aiService.speechToText(req.file.buffer, language)

    res.json({
      success: true,
      data: {
        transcription: text,
        language,
        confidence: 0.95,
      },
    })
  })
)

// Voice to website endpoint
router.post(
  '/voice-to-website',
  [
    body('transcription').isString().isLength({ min: 1 }),
    body('businessType').optional().isString(),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: errors.array(),
      })
    }

    const { transcription, businessType = 'restaurant' } = req.body

    try {
      const result = await aiService.generateWebsiteFromVoice(
        Buffer.from(transcription), 
        businessType
      )

      res.json({
        success: true,
        data: result.data,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Fehler bei der Website-Generierung',
      })
    }
  })
)

// Photo to website endpoint
router.post(
  '/photo-to-website',
  upload.single('image'),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Kein Bild hochgeladen',
      })
    }

    try {
      const result = await aiService.generateWebsiteFromPhoto(req.file.buffer)

      res.json({
        success: true,
        data: result.data,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Fehler bei der Website-Generierung',
      })
    }
  })
)

// Chat edit endpoint (alias for chat-command)
router.post(
  '/chat-edit',
  [
    body('command').isString().isLength({ min: 1, max: 500 }),
    body('websiteData').optional().isObject(),
    body('currentPage').optional().isObject(),
    body('currentSection').optional().isObject(),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: errors.array(),
      })
    }

    const { command, websiteData, currentPage, currentSection } = req.body

    try {
      const result = await aiService.processChatCommand(
        command,
        websiteData,
        {
          websiteType: websiteData?.templateId || 'restaurant',
          currentPage: currentPage?.name || 'Homepage',
          userPreferences: {},
        }
      )

      res.json({
        success: true,
        data: result.data,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Fehler bei der Chat-Verarbeitung',
      })
    }
  })
)

// Generate content endpoint
router.post(
  '/generate-content',
  [
    body('prompt').isString().isLength({ min: 1, max: 1000 }),
    body('context.businessType').optional().isString(),
    body('context.industry').optional().isString(),
    body('context.targetAudience').optional().isString(),
    body('context.tone').optional().isIn(['professional', 'casual', 'friendly', 'formal']),
    body('context.language').optional().isString(),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: errors.array(),
      })
    }

    const { prompt, context } = req.body
    const result = await aiService.generateContent(prompt, context)

    res.json({
      success: true,
      data: result,
    })
  })
)

// Generate images endpoint
router.post(
  '/generate-images',
  [
    body('prompt').isString().isLength({ min: 1, max: 500 }),
    body('count').optional().isInt({ min: 1, max: 4 }),
    body('size').optional().isIn(['1024x1024', '1792x1024', '1024x1792']),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: errors.array(),
      })
    }

    const { prompt, count = 1, size = '1024x1024' } = req.body
    const images = await aiService.generateImages(prompt, count, size)

    res.json({
      success: true,
      data: {
        images,
        count: images.length,
      },
    })
  })
)

// Auto-branding endpoint
router.post(
  '/auto-branding',
  [
    body('businessType').isString().isLength({ min: 1, max: 100 }),
    body('preferences.colors').optional().isArray(),
    body('preferences.style').optional().isIn(['modern', 'classic', 'playful', 'elegant']),
    body('preferences.industry').optional().isString(),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: errors.array(),
      })
    }

    const { businessType, preferences } = req.body
    const branding = await aiService.generateBranding(businessType, preferences)

    res.json({
      success: true,
      data: branding,
    })
  })
)

// Optimize content endpoint
router.post(
  '/optimize-content',
  [
    body('content').isString().isLength({ min: 1, max: 10000 }),
    body('type').isIn(['seo', 'readability', 'conversion']),
    body('context.targetKeywords').optional().isArray(),
    body('context.industry').optional().isString(),
    body('context.targetAudience').optional().isString(),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: errors.array(),
      })
    }

    const { content, type, context } = req.body
    const result = await aiService.optimizeContent(content, type, context)

    res.json({
      success: true,
      data: result,
    })
  })
)

// Chat command processing endpoint
router.post(
  '/chat-command',
  [
    body('command').isString().isLength({ min: 1, max: 500 }),
    body('currentContent').isObject(),
    body('context.websiteType').optional().isString(),
    body('context.currentPage').optional().isString(),
    body('context.userPreferences').optional().isObject(),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Eingabedaten',
        details: errors.array(),
      })
    }

    const { command, currentContent, context } = req.body
    const result = await aiService.processChatCommand(command, currentContent, context)

    res.json({
      success: true,
      data: result,
    })
  })
)

// Get AI suggestions for website improvement
router.get(
  '/suggestions/:websiteId',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { websiteId } = req.params

    // This would typically analyze the website and provide AI-powered suggestions
    const suggestions = [
      {
        type: 'seo',
        title: 'SEO-Optimierung',
        description: 'Verbessere deine Suchmaschinenoptimierung',
        priority: 'high',
        action: 'optimize-seo',
      },
      {
        type: 'design',
        title: 'Design-Verbesserung',
        description: 'Aktualisiere das Design für bessere Benutzerfreundlichkeit',
        priority: 'medium',
        action: 'improve-design',
      },
      {
        type: 'content',
        title: 'Content-Optimierung',
        description: 'Verbessere deine Texte für bessere Conversion',
        priority: 'medium',
        action: 'optimize-content',
      },
    ]

    res.json({
      success: true,
      data: {
        suggestions,
        websiteId,
      },
    })
  })
)

// Get AI analytics insights
router.get(
  '/analytics/:websiteId',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { websiteId } = req.params
    const { period = '30d' } = req.query

    // This would typically analyze website analytics and provide AI insights
    const insights = {
      summary: 'Deine Website zeigt positive Trends',
      recommendations: [
        'Erhöhe die Seitenladegeschwindigkeit',
        'Optimiere deine Meta-Beschreibungen',
        'Füge mehr Call-to-Action Buttons hinzu',
      ],
      trends: {
        traffic: '+15%',
        bounceRate: '-8%',
        conversionRate: '+12%',
      },
      period,
      websiteId,
    }

    res.json({
      success: true,
      data: insights,
    })
  })
)

export default router
