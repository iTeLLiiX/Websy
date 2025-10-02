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

// Get user profile
router.get(
  '/profile',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        websites: {
          include: {
            template: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 5,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
        websites: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Benutzer nicht gefunden',
      })
    }

    res.json({
      success: true,
      data: user,
    })
  })
)

// Update user profile
router.patch(
  '/profile',
  [
    body('name').optional().isString().isLength({ min: 2, max: 100 }),
    body('avatar').optional().isString().isURL(),
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

    const userId = req.user!.id
    const updates = req.body

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.avatar && { avatar: updates.avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    logger.info('User profile updated', {
      userId,
      updates,
    })

    res.json({
      success: true,
      data: updatedUser,
    })
  })
)

// Get user websites
router.get(
  '/websites',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    const websites = await prisma.website.findMany({
      where: { userId },
      include: {
        template: true,
        settings: true,
        pages: {
          select: {
            id: true,
            name: true,
            slug: true,
            isHomePage: true,
            isPublished: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    res.json({
      success: true,
      data: websites,
    })
  })
)

// Get user subscription
router.get(
  '/subscription',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription) {
      // Return free subscription if none exists
      return res.json({
        success: true,
        data: {
          id: null,
          plan: 'FREE',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        },
      })
    }

    res.json({
      success: true,
      data: subscription,
    })
  })
)

// Get user analytics
router.get(
  '/analytics',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    // Get user statistics
    const [
      totalWebsites,
      publishedWebsites,
      draftWebsites,
      totalPages,
      totalSections,
    ] = await Promise.all([
      prisma.website.count({
        where: { userId },
      }),
      prisma.website.count({
        where: { userId, status: 'published' },
      }),
      prisma.website.count({
        where: { userId, status: 'draft' },
      }),
      prisma.page.count({
        where: {
          website: { userId },
        },
      }),
      prisma.section.count({
        where: {
          page: {
            website: { userId },
          },
        },
      }),
    ])

    // Get recent activity
    const recentWebsites = await prisma.website.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true,
        template: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    })

    // Get usage by template category
    const templateUsage = await prisma.website.groupBy({
      by: ['templateId'],
      where: { userId },
      _count: {
        id: true,
      },
    })

    const templateCategories = await Promise.all(
      templateUsage.map(async (usage) => {
        const template = await prisma.template.findUnique({
          where: { id: usage.templateId },
          select: {
            name: true,
            category: true,
          },
        })
        return {
          templateName: template?.name || 'Unknown',
          category: template?.category || 'unknown',
          count: usage._count.id,
        }
      })
    )

    const analytics = {
      overview: {
        totalWebsites,
        publishedWebsites,
        draftWebsites,
        totalPages,
        totalSections,
      },
      recentActivity: recentWebsites,
      templateUsage: templateCategories,
      createdAt: new Date(),
    }

    res.json({
      success: true,
      data: analytics,
    })
  })
)

// Delete user account
router.delete(
  '/account',
  [
    body('password').isString().isLength({ min: 1 }),
    body('confirmDeletion').equals('DELETE'),
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

    const { password } = req.body
    const userId = req.user!.id

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Benutzer nicht gefunden',
      })
    }

    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Ungültiges Passwort',
      })
    }

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id: userId },
    })

    logger.info('User account deleted', {
      userId,
      email: user.email,
    })

    res.json({
      success: true,
      message: 'Konto erfolgreich gelöscht',
    })
  })
)

// Export user data (GDPR compliance)
router.get(
  '/export-data',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    // Get all user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        websites: {
          include: {
            template: true,
            settings: true,
            pages: {
              include: {
                sections: true,
              },
            },
          },
        },
        analytics: true,
        payments: true,
      },
    })

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Benutzer nicht gefunden',
      })
    }

    // Remove sensitive data
    const exportData = {
      ...userData,
      password: '[REMOVED]',
      subscription: userData.subscription ? {
        ...userData.subscription,
        stripeCustomerId: '[REMOVED]',
        stripeSubscriptionId: '[REMOVED]',
      } : null,
      payments: userData.payments.map(payment => ({
        ...payment,
        stripePaymentId: '[REMOVED]',
      })),
    }

    res.json({
      success: true,
      data: exportData,
      exportedAt: new Date(),
    })
  })
)

export default router
