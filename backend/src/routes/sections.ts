import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../index'
import { authMiddleware } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = Router()

// Apply authentication to all routes
router.use(authMiddleware)

// Get single section
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sectionId = req.params.id
    const userId = req.user!.id

    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        page: {
          website: {
            userId,
          },
        },
      },
      include: {
        page: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: {
              select: {
                id: true,
                name: true,
                domain: true,
                subdomain: true,
              },
            },
          },
        },
      },
    })

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Sektion nicht gefunden',
      })
    }

    res.json({
      success: true,
      data: section,
    })
  })
)

// Create new section
router.post(
  '/',
  [
    body('pageId').isString().isLength({ min: 1 }),
    body('type').isString().isLength({ min: 1 }),
    body('content').isObject(),
    body('settings').optional().isObject(),
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

    const { pageId, type, content, settings = {} } = req.body
    const userId = req.user!.id

    // Check if page exists and belongs to user
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        website: {
          userId,
        },
      },
    })

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Seite nicht gefunden',
      })
    }

    // Get current section count for ordering
    const sectionCount = await prisma.section.count({
      where: { pageId },
    })

    // Create section
    const section = await prisma.section.create({
      data: {
        pageId,
        type,
        content,
        settings,
        order: sectionCount,
      },
      include: {
        page: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: {
              select: {
                id: true,
                name: true,
                domain: true,
                subdomain: true,
              },
            },
          },
        },
      },
    })

    logger.info('Section created', {
      sectionId: section.id,
      pageId,
      userId,
      type,
    })

    res.status(201).json({
      success: true,
      data: section,
    })
  })
)

// Update section
router.patch(
  '/:id',
  [
    body('content').optional().isObject(),
    body('settings').optional().isObject(),
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

    const sectionId = req.params.id
    const userId = req.user!.id
    const updates = req.body

    // Check if section exists and belongs to user
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        page: {
          website: {
            userId,
          },
        },
      },
    })

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Sektion nicht gefunden',
      })
    }

    // Update section
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(updates.content && { content: updates.content }),
        ...(updates.settings && { settings: updates.settings }),
      },
      include: {
        page: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: {
              select: {
                id: true,
                name: true,
                domain: true,
                subdomain: true,
              },
            },
          },
        },
      },
    })

    logger.info('Section updated', {
      sectionId,
      userId,
      updates,
    })

    res.json({
      success: true,
      data: updatedSection,
    })
  })
)

// Delete section
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sectionId = req.params.id
    const userId = req.user!.id

    // Check if section exists and belongs to user
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        page: {
          website: {
            userId,
          },
        },
      },
    })

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Sektion nicht gefunden',
      })
    }

    // Delete section
    await prisma.section.delete({
      where: { id: sectionId },
    })

    logger.info('Section deleted', {
      sectionId,
      userId,
    })

    res.json({
      success: true,
      message: 'Sektion erfolgreich gelöscht',
    })
  })
)

// Move section
router.patch(
  '/:id/move',
  [
    body('newOrder').isInt({ min: 0 }),
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

    const sectionId = req.params.id
    const userId = req.user!.id
    const { newOrder } = req.body

    // Check if section exists and belongs to user
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        page: {
          website: {
            userId,
          },
        },
      },
    })

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Sektion nicht gefunden',
      })
    }

    // Get all sections for this page
    const sections = await prisma.section.findMany({
      where: { pageId: section.pageId },
      orderBy: { order: 'asc' },
    })

    // Remove the section from its current position
    const sectionToMove = sections.find(s => s.id === sectionId)
    const otherSections = sections.filter(s => s.id !== sectionId)

    // Insert the section at the new position
    otherSections.splice(newOrder, 0, sectionToMove!)

    // Update order for all sections
    await Promise.all(
      otherSections.map((s, index) =>
        prisma.section.update({
          where: { id: s.id },
          data: { order: index },
        })
      )
    )

    logger.info('Section moved', {
      sectionId,
      userId,
      newOrder,
    })

    res.json({
      success: true,
      message: 'Sektion erfolgreich verschoben',
    })
  })
)

// Duplicate section
router.post(
  '/:id/duplicate',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sectionId = req.params.id
    const userId = req.user!.id

    // Check if section exists and belongs to user
    const originalSection = await prisma.section.findFirst({
      where: {
        id: sectionId,
        page: {
          website: {
            userId,
          },
        },
      },
    })

    if (!originalSection) {
      return res.status(404).json({
        success: false,
        error: 'Sektion nicht gefunden',
      })
    }

    // Get current section count for ordering
    const sectionCount = await prisma.section.count({
      where: { pageId: originalSection.pageId },
    })

    // Create duplicated section
    const duplicatedSection = await prisma.section.create({
      data: {
        pageId: originalSection.pageId,
        type: originalSection.type,
        content: originalSection.content,
        settings: originalSection.settings,
        order: sectionCount,
      },
      include: {
        page: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: {
              select: {
                id: true,
                name: true,
                domain: true,
                subdomain: true,
              },
            },
          },
        },
      },
    })

    logger.info('Section duplicated', {
      originalSectionId: sectionId,
      newSectionId: duplicatedSection.id,
      userId,
    })

    res.status(201).json({
      success: true,
      data: duplicatedSection,
    })
  })
)

// Get section types
router.get(
  '/types/available',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sectionTypes = [
      {
        id: 'hero',
        name: 'Hero Section',
        description: 'Große Überschrift mit Call-to-Action',
        icon: 'hero',
        category: 'layout',
        isPremium: false,
      },
      {
        id: 'text',
        name: 'Text Block',
        description: 'Einfacher Textblock',
        icon: 'text',
        category: 'content',
        isPremium: false,
      },
      {
        id: 'image',
        name: 'Bild',
        description: 'Einzelnes Bild mit Beschreibung',
        icon: 'image',
        category: 'media',
        isPremium: false,
      },
      {
        id: 'gallery',
        name: 'Galerie',
        description: 'Bildergalerie',
        icon: 'gallery',
        category: 'media',
        isPremium: false,
      },
      {
        id: 'menu',
        name: 'Speisekarte',
        description: 'Restaurant-Speisekarte',
        icon: 'menu',
        category: 'restaurant',
        isPremium: false,
      },
      {
        id: 'contact',
        name: 'Kontakt',
        description: 'Kontaktinformationen',
        icon: 'contact',
        category: 'info',
        isPremium: false,
      },
      {
        id: 'about',
        name: 'Über uns',
        description: 'Über uns Sektion',
        icon: 'about',
        category: 'info',
        isPremium: false,
      },
      {
        id: 'services',
        name: 'Services',
        description: 'Leistungen/Dienstleistungen',
        icon: 'services',
        category: 'business',
        isPremium: false,
      },
      {
        id: 'testimonials',
        name: 'Bewertungen',
        description: 'Kundenbewertungen',
        icon: 'testimonials',
        category: 'social',
        isPremium: true,
      },
      {
        id: 'booking',
        name: 'Reservierung',
        description: 'Online-Reservierung',
        icon: 'booking',
        category: 'restaurant',
        isPremium: true,
      },
      {
        id: 'shop',
        name: 'Online-Shop',
        description: 'Produktverkauf',
        icon: 'shop',
        category: 'ecommerce',
        isPremium: true,
      },
      {
        id: 'blog',
        name: 'Blog',
        description: 'Blog-Artikel',
        icon: 'blog',
        category: 'content',
        isPremium: true,
      },
    ]

    res.json({
      success: true,
      data: sectionTypes,
    })
  })
)

export default router
