import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { body, validationResult, query } from 'express-validator'
import { prisma } from '../index'
import { authMiddleware, requireActiveSubscription } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = Router()

// Apply authentication to all routes
router.use(authMiddleware)

// Get all websites for user
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Abfrageparameter',
        details: errors.array(),
      })
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    const websites = await prisma.website.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        template: true,
        settings: true,
        pages: {
          include: {
            sections: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: offset,
      take: limit,
    })

    const total = await prisma.website.count({
      where: {
        userId: req.user!.id,
      },
    })

    res.json({
      success: true,
      data: websites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  })
)

// Get single website
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const websiteId = req.params.id

    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: req.user!.id,
      },
      include: {
        template: true,
        settings: true,
        pages: {
          include: {
            sections: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!website) {
      return res.status(404).json({
        success: false,
        error: 'Website nicht gefunden',
      })
    }

    res.json({
      success: true,
      data: website,
    })
  })
)

// Create new website
router.post(
  '/',
  [
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('templateId').isString().isLength({ min: 1 }),
    body('domain').optional().isString().isLength({ min: 1, max: 100 }),
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

    const { name, templateId, domain } = req.body
    const userId = req.user!.id

    // Get template
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template nicht gefunden',
      })
    }

    // Generate unique subdomain
    const baseSubdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    let subdomain = baseSubdomain
    let counter = 1

    while (true) {
      const existingWebsite = await prisma.website.findUnique({
        where: { subdomain },
      })

      if (!existingWebsite) {
        break
      }

      subdomain = `${baseSubdomain}-${counter}`
      counter++
    }

    // Generate unique domain for internal use
    const internalDomain = `${subdomain}.websitbuilder.ai`

    // Create website
    const website = await prisma.website.create({
      data: {
        name,
        domain: internalDomain,
        subdomain,
        templateId,
        userId,
        customDomain: domain,
        pages: {
          create: template.pages.map((templatePage, index) => ({
            name: templatePage.name,
            slug: templatePage.slug,
            isHomePage: templatePage.isHomePage,
            order: index,
            isPublished: false,
            sections: {
              create: templatePage.sections.map((section, sectionIndex) => ({
                type: section.type,
                content: section.content,
                settings: section.settings,
                order: sectionIndex,
              })),
            },
          })),
        },
        settings: {
          create: {
            theme: {
              primaryColor: '#2563eb',
              secondaryColor: '#10b981',
              accentColor: '#f59e0b',
              fontFamily: 'Inter',
              borderRadius: 'medium',
              spacing: 'normal',
              headerStyle: 'standard',
              footerStyle: 'standard',
            },
            seo: {
              title: name,
              description: `Professionelle Website für ${name}`,
              keywords: [],
              robots: 'index',
            },
            integrations: {},
            aiSettings: {
              voiceEnabled: true,
              autoBranding: true,
              contentGeneration: true,
              imageOptimization: true,
            },
          },
        },
      },
      include: {
        template: true,
        settings: true,
        pages: {
          include: {
            sections: true,
          },
        },
      },
    })

    logger.info('Website created', {
      websiteId: website.id,
      userId,
      templateId,
      subdomain,
    })

    res.status(201).json({
      success: true,
      data: website,
    })
  })
)

// Update website
router.patch(
  '/:id',
  [
    body('name').optional().isString().isLength({ min: 1, max: 100 }),
    body('customDomain').optional().isString().isLength({ min: 1, max: 100 }),
    body('status').optional().isIn(['draft', 'published', 'archived']),
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

    const websiteId = req.params.id
    const userId = req.user!.id
    const updates = req.body

    // Check if website exists and belongs to user
    const existingWebsite = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    })

    if (!existingWebsite) {
      return res.status(404).json({
        success: false,
        error: 'Website nicht gefunden',
      })
    }

    // Update website
    const updatedWebsite = await prisma.website.update({
      where: { id: websiteId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.customDomain && { customDomain: updates.customDomain }),
        ...(updates.status && { 
          status: updates.status,
          ...(updates.status === 'published' && { publishedAt: new Date() })
        }),
      },
      include: {
        template: true,
        settings: true,
        pages: {
          include: {
            sections: true,
          },
        },
      },
    })

    logger.info('Website updated', {
      websiteId,
      userId,
      updates,
    })

    res.json({
      success: true,
      data: updatedWebsite,
    })
  })
)

// Delete website
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const websiteId = req.params.id
    const userId = req.user!.id

    // Check if website exists and belongs to user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    })

    if (!website) {
      return res.status(404).json({
        success: false,
        error: 'Website nicht gefunden',
      })
    }

    // Delete website (cascade will handle related data)
    await prisma.website.delete({
      where: { id: websiteId },
    })

    logger.info('Website deleted', {
      websiteId,
      userId,
    })

    res.json({
      success: true,
      message: 'Website erfolgreich gelöscht',
    })
  })
)

// Publish website
router.post(
  '/:id/publish',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const websiteId = req.params.id
    const userId = req.user!.id

    // Check if website exists and belongs to user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    })

    if (!website) {
      return res.status(404).json({
        success: false,
        error: 'Website nicht gefunden',
      })
    }

    // Update website status
    const updatedWebsite = await prisma.website.update({
      where: { id: websiteId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    })

    logger.info('Website published', {
      websiteId,
      userId,
    })

    res.json({
      success: true,
      data: updatedWebsite,
      message: 'Website erfolgreich veröffentlicht',
    })
  })
)

// Unpublish website
router.post(
  '/:id/unpublish',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const websiteId = req.params.id
    const userId = req.user!.id

    // Check if website exists and belongs to user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    })

    if (!website) {
      return res.status(404).json({
        success: false,
        error: 'Website nicht gefunden',
      })
    }

    // Update website status
    const updatedWebsite = await prisma.website.update({
      where: { id: websiteId },
      data: {
        status: 'draft',
        publishedAt: null,
      },
    })

    logger.info('Website unpublished', {
      websiteId,
      userId,
    })

    res.json({
      success: true,
      data: updatedWebsite,
      message: 'Website erfolgreich zurückgezogen',
    })
  })
)

// Get website pages
router.get(
  '/:id/pages',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const websiteId = req.params.id
    const userId = req.user!.id

    // Check if website exists and belongs to user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    })

    if (!website) {
      return res.status(404).json({
        success: false,
        error: 'Website nicht gefunden',
      })
    }

    // Get pages
    const pages = await prisma.page.findMany({
      where: { websiteId },
      include: {
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    res.json({
      success: true,
      data: pages,
    })
  })
)

// Add section to page
router.post(
  '/:id/pages/:pageId/sections',
  [
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

    const { id: websiteId, pageId } = req.params
    const userId = req.user!.id
    const { type, content, settings } = req.body

    // Check if website exists and belongs to user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    })

    if (!website) {
      return res.status(404).json({
        success: false,
        error: 'Website nicht gefunden',
      })
    }

    // Check if page exists
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        websiteId,
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
        settings: settings || {},
        order: sectionCount,
      },
    })

    logger.info('Section added to page', {
      sectionId: section.id,
      pageId,
      websiteId,
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
  '/sections/:sectionId',
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

    const { sectionId } = req.params
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
  '/sections/:sectionId',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { sectionId } = req.params
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

export default router
