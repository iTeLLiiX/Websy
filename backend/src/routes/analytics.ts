import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { body, query, validationResult } from 'express-validator'
import { prisma } from '../index'
import { authMiddleware } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = Router()

// Apply authentication to all routes
router.use(authMiddleware)

// Track website analytics event
router.post(
  '/track',
  [
    body('websiteId').isString().isLength({ min: 1 }),
    body('event').isString().isLength({ min: 1 }),
    body('data').optional().isObject(),
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

    const { websiteId, event, data } = req.body
    const userId = req.user!.id

    // Verify website belongs to user
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

    // Create analytics event
    const analyticsEvent = await prisma.analytics.create({
      data: {
        websiteId,
        userId,
        event,
        data: data || {},
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
      },
    })

    res.json({
      success: true,
      data: analyticsEvent,
    })
  })
)

// Get website analytics
router.get(
  '/:websiteId',
  [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']),
    query('event').optional().isString(),
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

    const { websiteId } = req.params
    const { period = '30d', event } = req.query
    const userId = req.user!.id

    // Verify website belongs to user
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

    // Calculate date range
    const now = new Date()
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    }[period as string] || 30

    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    // Build where clause
    const where: any = {
      websiteId,
      createdAt: {
        gte: startDate,
        lte: now,
      },
    }

    if (event) {
      where.event = event
    }

    // Get analytics data
    const [
      totalEvents,
      uniqueVisitors,
      pageViews,
      bounceRate,
      avgSessionDuration,
      topPages,
      trafficSources,
      eventsByDay,
      eventsByHour,
    ] = await Promise.all([
      // Total events
      prisma.analytics.count({ where }),

      // Unique visitors (by IP)
      prisma.analytics.groupBy({
        by: ['ipAddress'],
        where: {
          ...where,
          event: 'page_view',
        },
      }).then(result => result.length),

      // Page views
      prisma.analytics.count({
        where: {
          ...where,
          event: 'page_view',
        },
      }),

      // Bounce rate (single page visits)
      calculateBounceRate(websiteId, startDate, now),

      // Average session duration
      calculateAvgSessionDuration(websiteId, startDate, now),

      // Top pages
      getTopPages(websiteId, startDate, now),

      // Traffic sources
      getTrafficSources(websiteId, startDate, now),

      // Events by day
      getEventsByDay(websiteId, startDate, now, event as string),

      // Events by hour
      getEventsByHour(websiteId, startDate, now, event as string),
    ])

    const analytics = {
      summary: {
        totalEvents,
        uniqueVisitors,
        pageViews,
        bounceRate,
        avgSessionDuration,
        period,
        startDate,
        endDate: now,
      },
      topPages,
      trafficSources,
      eventsByDay,
      eventsByHour,
    }

    res.json({
      success: true,
      data: analytics,
    })
  })
)

// Get analytics overview for user
router.get(
  '/overview/user',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    // Get all user websites
    const websites = await prisma.website.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        status: true,
        domain: true,
      },
    })

    const websiteIds = websites.map(w => w.id)

    if (websiteIds.length === 0) {
      return res.json({
        success: true,
        data: {
          websites: [],
          totalStats: {
            totalEvents: 0,
            uniqueVisitors: 0,
            pageViews: 0,
          },
        },
      })
    }

    // Get overall stats
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalEvents,
      uniqueVisitors,
      pageViews,
    ] = await Promise.all([
      prisma.analytics.count({
        where: {
          websiteId: { in: websiteIds },
          createdAt: { gte: last30Days },
        },
      }),
      prisma.analytics.groupBy({
        by: ['ipAddress'],
        where: {
          websiteId: { in: websiteIds },
          event: 'page_view',
          createdAt: { gte: last30Days },
        },
      }).then(result => result.length),
      prisma.analytics.count({
        where: {
          websiteId: { in: websiteIds },
          event: 'page_view',
          createdAt: { gte: last30Days },
        },
      }),
    ])

    // Get stats per website
    const websiteStats = await Promise.all(
      websites.map(async (website) => {
        const [
          events,
          visitors,
          views,
        ] = await Promise.all([
          prisma.analytics.count({
            where: {
              websiteId: website.id,
              createdAt: { gte: last30Days },
            },
          }),
          prisma.analytics.groupBy({
            by: ['ipAddress'],
            where: {
              websiteId: website.id,
              event: 'page_view',
              createdAt: { gte: last30Days },
            },
          }).then(result => result.length),
          prisma.analytics.count({
            where: {
              websiteId: website.id,
              event: 'page_view',
              createdAt: { gte: last30Days },
            },
          }),
        ])

        return {
          ...website,
          stats: {
            events,
            visitors,
            views,
          },
        }
      })
    )

    const overview = {
      websites: websiteStats,
      totalStats: {
        totalEvents,
        uniqueVisitors,
        pageViews,
      },
      period: '30d',
      generatedAt: new Date(),
    }

    res.json({
      success: true,
      data: overview,
    })
  })
)

// Helper functions
async function calculateBounceRate(websiteId: string, startDate: Date, endDate: Date): Promise<number> {
  // Get all page views
  const pageViews = await prisma.analytics.findMany({
    where: {
      websiteId,
      event: 'page_view',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      ipAddress: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Group by IP and session (within 30 minutes)
  const sessions = new Map<string, number[]>()
  
  pageViews.forEach(view => {
    const key = view.ipAddress
    if (!sessions.has(key)) {
      sessions.set(key, [])
    }
    sessions.get(key)!.push(view.createdAt.getTime())
  })

  // Calculate bounce rate
  let bouncedSessions = 0
  let totalSessions = 0

  sessions.forEach(timestamps => {
    totalSessions++
    
    // Check if session has only one page view (bounce)
    if (timestamps.length === 1) {
      bouncedSessions++
    } else {
      // Check if session has multiple page views within 30 minutes
      timestamps.sort((a, b) => a - b)
      let hasMultipleViews = false
      
      for (let i = 1; i < timestamps.length; i++) {
        if (timestamps[i] - timestamps[i-1] <= 30 * 60 * 1000) {
          hasMultipleViews = true
          break
        }
      }
      
      if (!hasMultipleViews) {
        bouncedSessions++
      }
    }
  })

  return totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0
}

async function calculateAvgSessionDuration(websiteId: string, startDate: Date, endDate: Date): Promise<number> {
  // Get all page views grouped by IP
  const pageViews = await prisma.analytics.findMany({
    where: {
      websiteId,
      event: 'page_view',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      ipAddress: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Group by IP
  const sessions = new Map<string, Date[]>()
  
  pageViews.forEach(view => {
    const key = view.ipAddress
    if (!sessions.has(key)) {
      sessions.set(key, [])
    }
    sessions.get(key)!.push(view.createdAt)
  })

  // Calculate average session duration
  let totalDuration = 0
  let sessionCount = 0

  sessions.forEach(timestamps => {
    if (timestamps.length > 1) {
      const sessionStart = timestamps[0]
      const sessionEnd = timestamps[timestamps.length - 1]
      const duration = sessionEnd.getTime() - sessionStart.getTime()
      
      // Only count sessions longer than 1 minute
      if (duration > 60 * 1000) {
        totalDuration += duration
        sessionCount++
      }
    }
  })

  return sessionCount > 0 ? totalDuration / sessionCount / 1000 : 0 // Return in seconds
}

async function getTopPages(websiteId: string, startDate: Date, endDate: Date) {
  const pageViews = await prisma.analytics.findMany({
    where: {
      websiteId,
      event: 'page_view',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      data: true,
    },
  })

  // Count page views by URL
  const pageCounts = new Map<string, number>()
  
  pageViews.forEach(view => {
    const url = (view.data as any)?.url || '/'
    pageCounts.set(url, (pageCounts.get(url) || 0) + 1)
  })

  // Convert to array and sort
  const topPages = Array.from(pageCounts.entries())
    .map(([url, count]) => ({ url, views: count }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  return topPages
}

async function getTrafficSources(websiteId: string, startDate: Date, endDate: Date) {
  const pageViews = await prisma.analytics.findMany({
    where: {
      websiteId,
      event: 'page_view',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      referer: true,
    },
  })

  // Categorize traffic sources
  const sources = new Map<string, number>()
  
  pageViews.forEach(view => {
    let source = 'Direct'
    
    if (view.referer) {
      try {
        const url = new URL(view.referer)
        const hostname = url.hostname.toLowerCase()
        
        if (hostname.includes('google')) {
          source = 'Google'
        } else if (hostname.includes('facebook')) {
          source = 'Facebook'
        } else if (hostname.includes('instagram')) {
          source = 'Instagram'
        } else if (hostname.includes('twitter')) {
          source = 'Twitter'
        } else if (hostname.includes('linkedin')) {
          source = 'LinkedIn'
        } else {
          source = 'Referral'
        }
      } catch {
        source = 'Other'
      }
    }
    
    sources.set(source, (sources.get(source) || 0) + 1)
  })

  const total = Array.from(sources.values()).reduce((sum, count) => sum + count, 0)
  
  return Array.from(sources.entries())
    .map(([source, count]) => ({
      source,
      visitors: count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors)
}

async function getEventsByDay(websiteId: string, startDate: Date, endDate: Date, event?: string) {
  const where: any = {
    websiteId,
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  }

  if (event) {
    where.event = event
  }

  const events = await prisma.analytics.findMany({
    where,
    select: {
      createdAt: true,
    },
  })

  // Group by day
  const eventsByDay = new Map<string, number>()
  
  events.forEach(event => {
    const day = event.createdAt.toISOString().split('T')[0]
    eventsByDay.set(day, (eventsByDay.get(day) || 0) + 1)
  })

  // Fill missing days with 0
  const result = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const day = currentDate.toISOString().split('T')[0]
    result.push({
      date: day,
      count: eventsByDay.get(day) || 0,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}

async function getEventsByHour(websiteId: string, startDate: Date, endDate: Date, event?: string) {
  const where: any = {
    websiteId,
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  }

  if (event) {
    where.event = event
  }

  const events = await prisma.analytics.findMany({
    where,
    select: {
      createdAt: true,
    },
  })

  // Group by hour (0-23)
  const eventsByHour = new Array(24).fill(0)
  
  events.forEach(event => {
    const hour = event.createdAt.getHours()
    eventsByHour[hour]++
  })

  return eventsByHour.map((count, hour) => ({
    hour,
    count,
  }))
}

export default router
