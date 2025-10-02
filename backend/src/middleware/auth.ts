import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../index'
import { logger } from '../utils/logger'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET!)
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Kein gültiger Authentifizierungstoken gefunden',
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Kein Authentifizierungstoken gefunden',
      })
    }

    // Verify token
    const decoded = verifyToken(token) as any
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: 'Ungültiger Authentifizierungstoken',
      })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Benutzer nicht gefunden',
      })
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    }

    next()
  } catch (error) {
    logger.error('Authentication error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Ungültiger Authentifizierungstoken',
      })
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Authentifizierungstoken ist abgelaufen',
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Authentifizierungsfehler',
    })
  }
}

export const requireActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentifizierung erforderlich',
      })
    }

    // Get user subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    })

    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Aktives Abonnement erforderlich',
      })
    }

    // Check if subscription is active
    if (subscription.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Abonnement ist nicht aktiv',
      })
    }

    // Check if subscription has expired
    if (subscription.currentPeriodEnd < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Abonnement ist abgelaufen',
      })
    }

    next()
  } catch (error) {
    logger.error('Subscription check error:', error)
    return res.status(500).json({
      success: false,
      error: 'Fehler bei der Abonnement-Überprüfung',
    })
  }
}

export const requirePremiumPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentifizierung erforderlich',
      })
    }

    // Get user subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    })

    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Premium-Abonnement erforderlich',
      })
    }

    // Check if subscription is active
    if (subscription.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Premium-Abonnement ist nicht aktiv',
      })
    }

    // Check if subscription has expired
    if (subscription.currentPeriodEnd < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Premium-Abonnement ist abgelaufen',
      })
    }

    // Check if plan is premium (not FREE)
    if (subscription.plan === 'FREE') {
      return res.status(403).json({
        success: false,
        error: 'Premium-Abonnement erforderlich',
      })
    }

    next()
  } catch (error) {
    logger.error('Premium plan check error:', error)
    return res.status(500).json({
      success: false,
      error: 'Fehler bei der Premium-Plan-Überprüfung',
    })
  }
}

export const requireBusinessPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentifizierung erforderlich',
      })
    }

    // Get user subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    })

    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Business-Abonnement erforderlich',
      })
    }

    // Check if subscription is active
    if (subscription.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Business-Abonnement ist nicht aktiv',
      })
    }

    // Check if subscription has expired
    if (subscription.currentPeriodEnd < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Business-Abonnement ist abgelaufen',
      })
    }

    // Check if plan is business
    if (subscription.plan !== 'BUSINESS') {
      return res.status(403).json({
        success: false,
        error: 'Business-Abonnement erforderlich',
      })
    }

    next()
  } catch (error) {
    logger.error('Business plan check error:', error)
    return res.status(500).json({
      success: false,
      error: 'Fehler bei der Business-Plan-Überprüfung',
    })
  }
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next()
    }

    const token = authHeader.substring(7)
    
    if (!token) {
      return next()
    }

    // Verify token
    const decoded = verifyToken(token) as any
    
    if (!decoded || !decoded.userId) {
      return next()
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    })

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    }

    next()
  } catch (error) {
    // If there's an error with the token, just continue without authentication
    next()
  }
}