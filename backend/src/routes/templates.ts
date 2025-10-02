import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { query, validationResult } from 'express-validator'
import { prisma } from '../index'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = Router()

// Get all templates
router.get(
  '/',
  [
    query('category').optional().isString(),
    query('isPremium').optional().isBoolean(),
    query('search').optional().isString(),
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

    const { category, isPremium, search } = req.query

    // Build where clause
    const where: any = {}

    if (category) {
      where.category = category
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } },
      ]
    }

    const templates = await prisma.template.findMany({
      where,
      include: {
        pages: true,
      },
      orderBy: [
        { isPremium: 'asc' }, // Free templates first
        { createdAt: 'desc' },
      ],
    })

    res.json({
      success: true,
      data: templates,
    })
  })
)

// Get single template
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const templateId = req.params.id

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        pages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template nicht gefunden',
      })
    }

    res.json({
      success: true,
      data: template,
    })
  })
)

// Get template categories
router.get(
  '/categories/list',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await prisma.template.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    })

    const categoryList = categories.map(cat => ({
      category: cat.category,
      count: cat._count.id,
    }))

    res.json({
      success: true,
      data: categoryList,
    })
  })
)

// Get popular templates
router.get(
  '/popular/list',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Get templates with most websites created
    const popularTemplates = await prisma.template.findMany({
      include: {
        _count: {
          select: {
            websites: true,
          },
        },
      },
      orderBy: {
        websites: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    res.json({
      success: true,
      data: popularTemplates,
    })
  })
)

// Get templates by business type
router.get(
  '/business-type/:businessType',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { businessType } = req.params

    // Map business types to template categories
    const businessTypeMapping: Record<string, string[]> = {
      'restaurant': ['restaurant'],
      'cafe': ['restaurant'],
      'handwerker': ['handwerker'],
      'shop': ['shop'],
      'service': ['service'],
      'fitness': ['fitness'],
      'beauty': ['beauty'],
      'medical': ['medical'],
      'legal': ['legal'],
      'education': ['education'],
    }

    const categories = businessTypeMapping[businessType.toLowerCase()] || ['service']

    const templates = await prisma.template.findMany({
      where: {
        category: {
          in: categories,
        },
      },
      include: {
        pages: true,
      },
      orderBy: [
        { isPremium: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    res.json({
      success: true,
      data: templates,
    })
  })
)

// Get template preview data
router.get(
  '/:id/preview',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const templateId = req.params.id

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        thumbnail: true,
        preview: true,
        features: true,
        isPremium: true,
        tags: true,
        pages: {
          select: {
            id: true,
            name: true,
            slug: true,
            isHomePage: true,
            sections: {
              select: {
                id: true,
                type: true,
                content: true,
                settings: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template nicht gefunden',
      })
    }

    res.json({
      success: true,
      data: template,
    })
  })
)

// Search templates
router.get(
  '/search/query',
  [
    query('q').isString().isLength({ min: 1 }),
    query('category').optional().isString(),
    query('isPremium').optional().isBoolean(),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Suchparameter',
        details: errors.array(),
      })
    }

    const { q, category, isPremium, limit = 20 } = req.query

    // Build search query
    const where: any = {
      OR: [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { tags: { has: q as string } },
        { features: { has: q as string } },
      ],
    }

    if (category) {
      where.category = category
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium === 'true'
    }

    const templates = await prisma.template.findMany({
      where,
      include: {
        _count: {
          select: {
            websites: true,
          },
        },
      },
      orderBy: [
        { isPremium: 'asc' },
        { websites: { _count: 'desc' } },
      ],
      take: parseInt(limit as string),
    })

    res.json({
      success: true,
      data: templates,
      query: q,
      filters: {
        category,
        isPremium,
      },
    })
  })
)

// Get template statistics
router.get(
  '/stats/overview',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const [
      totalTemplates,
      freeTemplates,
      premiumTemplates,
      categoryStats,
      popularTemplates,
    ] = await Promise.all([
      prisma.template.count(),
      prisma.template.count({ where: { isPremium: false } }),
      prisma.template.count({ where: { isPremium: true } }),
      prisma.template.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
      }),
      prisma.template.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          isPremium: true,
          _count: {
            select: {
              websites: true,
            },
          },
        },
        orderBy: {
          websites: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
    ])

    const stats = {
      total: totalTemplates,
      free: freeTemplates,
      premium: premiumTemplates,
      categories: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count.id,
      })),
      popular: popularTemplates.map(template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        isPremium: template.isPremium,
        usageCount: template._count.websites,
      })),
    }

    res.json({
      success: true,
      data: stats,
    })
  })
)

// Get related templates
router.get(
  '/:id/related',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const templateId = req.params.id

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: {
        category: true,
        tags: true,
        isPremium: true,
      },
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template nicht gefunden',
      })
    }

    // Find related templates based on category and tags
    const relatedTemplates = await prisma.template.findMany({
      where: {
        AND: [
          { id: { not: templateId } },
          {
            OR: [
              { category: template.category },
              { tags: { hasSome: template.tags } },
            ],
          },
        ],
      },
      include: {
        _count: {
          select: {
            websites: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { websites: { _count: 'desc' } },
      ],
      take: 6,
    })

    res.json({
      success: true,
      data: relatedTemplates,
    })
  })
)

export default router
