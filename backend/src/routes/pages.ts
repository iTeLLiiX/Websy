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

// Get single page
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const pageId = req.params.id
    const userId = req.user!.id

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        website: {
          userId,
        },
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
            subdomain: true,
          },
        },
      },
    })

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Seite nicht gefunden',
      })
    }

    res.json({
      success: true,
      data: page,
    })
  })
)

// Create new page
router.post(
  '/',
  [
    body('websiteId').isString().isLength({ min: 1 }),
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('slug').isString().isLength({ min: 1, max: 100 }),
    body('isHomePage').optional().isBoolean(),
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

    const { websiteId, name, slug, isHomePage = false } = req.body
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

    // If this is the home page, unset other home pages
    if (isHomePage) {
      await prisma.page.updateMany({
        where: {
          websiteId,
          isHomePage: true,
        },
        data: {
          isHomePage: false,
        },
      })
    }

    // Get current page count for ordering
    const pageCount = await prisma.page.count({
      where: { websiteId },
    })

    // Create page
    const page = await prisma.page.create({
      data: {
        websiteId,
        name,
        slug,
        isHomePage,
        order: pageCount,
        isPublished: false,
      },
      include: {
        sections: true,
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
            subdomain: true,
          },
        },
      },
    })

    logger.info('Page created', {
      pageId: page.id,
      websiteId,
      userId,
      name,
      slug,
    })

    res.status(201).json({
      success: true,
      data: page,
    })
  })
)

// Update page
router.patch(
  '/:id',
  [
    body('name').optional().isString().isLength({ min: 1, max: 100 }),
    body('slug').optional().isString().isLength({ min: 1, max: 100 }),
    body('isHomePage').optional().isBoolean(),
    body('isPublished').optional().isBoolean(),
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

    const pageId = req.params.id
    const userId = req.user!.id
    const updates = req.body

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

    // If this is being set as home page, unset other home pages
    if (updates.isHomePage === true) {
      await prisma.page.updateMany({
        where: {
          websiteId: page.websiteId,
          isHomePage: true,
          id: { not: pageId },
        },
        data: {
          isHomePage: false,
        },
      })
    }

    // Update page
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.slug && { slug: updates.slug }),
        ...(updates.isHomePage !== undefined && { isHomePage: updates.isHomePage }),
        ...(updates.isPublished !== undefined && { isPublished: updates.isPublished }),
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
            subdomain: true,
          },
        },
      },
    })

    logger.info('Page updated', {
      pageId,
      userId,
      updates,
    })

    res.json({
      success: true,
      data: updatedPage,
    })
  })
)

// Delete page
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const pageId = req.params.id
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

    // Don't allow deleting the home page if it's the only page
    if (page.isHomePage) {
      const pageCount = await prisma.page.count({
        where: { websiteId: page.websiteId },
      })

      if (pageCount === 1) {
        return res.status(400).json({
          success: false,
          error: 'Die Startseite kann nicht gelöscht werden, wenn es die einzige Seite ist',
        })
      }
    }

    // Delete page (cascade will handle sections)
    await prisma.page.delete({
      where: { id: pageId },
    })

    logger.info('Page deleted', {
      pageId,
      userId,
    })

    res.json({
      success: true,
      message: 'Seite erfolgreich gelöscht',
    })
  })
)

// Move page
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

    const pageId = req.params.id
    const userId = req.user!.id
    const { newOrder } = req.body

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

    // Get all pages for this website
    const pages = await prisma.page.findMany({
      where: { websiteId: page.websiteId },
      orderBy: { order: 'asc' },
    })

    // Remove the page from its current position
    const pageToMove = pages.find(p => p.id === pageId)
    const otherPages = pages.filter(p => p.id !== pageId)

    // Insert the page at the new position
    otherPages.splice(newOrder, 0, pageToMove!)

    // Update order for all pages
    await Promise.all(
      otherPages.map((p, index) =>
        prisma.page.update({
          where: { id: p.id },
          data: { order: index },
        })
      )
    )

    logger.info('Page moved', {
      pageId,
      userId,
      newOrder,
    })

    res.json({
      success: true,
      message: 'Seite erfolgreich verschoben',
    })
  })
)

// Duplicate page
router.post(
  '/:id/duplicate',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const pageId = req.params.id
    const userId = req.user!.id

    // Check if page exists and belongs to user
    const originalPage = await prisma.page.findFirst({
      where: {
        id: pageId,
        website: {
          userId,
        },
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!originalPage) {
      return res.status(404).json({
        success: false,
        error: 'Seite nicht gefunden',
      })
    }

    // Get current page count for ordering
    const pageCount = await prisma.page.count({
      where: { websiteId: originalPage.websiteId },
    })

    // Create duplicated page
    const duplicatedPage = await prisma.page.create({
      data: {
        websiteId: originalPage.websiteId,
        name: `${originalPage.name} (Kopie)`,
        slug: `${originalPage.slug}-kopie`,
        isHomePage: false, // Duplicated pages are never home pages
        order: pageCount,
        isPublished: false,
        sections: {
          create: originalPage.sections.map(section => ({
            type: section.type,
            content: section.content,
            settings: section.settings,
            order: section.order,
          })),
        },
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
            subdomain: true,
          },
        },
      },
    })

    logger.info('Page duplicated', {
      originalPageId: pageId,
      newPageId: duplicatedPage.id,
      userId,
    })

    res.status(201).json({
      success: true,
      data: duplicatedPage,
    })
  })
)

export default router
