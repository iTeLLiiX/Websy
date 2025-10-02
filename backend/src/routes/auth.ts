import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../index'
import { authMiddleware, generateToken } from '../middleware/auth'
import { authRateLimiter } from '../middleware/rateLimiter'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = Router()

// Apply rate limiting to auth routes
router.use(authRateLimiter)

// Register endpoint
router.post(
  '/register',
  [
    body('name').isString().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
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

    const { name, email, password, businessType } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with free subscription
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        subscription: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          },
        },
      },
      include: {
        subscription: true,
      },
    })

    // Generate JWT token
    const token = generateToken(user.id)

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      businessType,
    })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        subscription: user.subscription,
        token,
      },
    })
  })
)

// Login endpoint
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 1 }),
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

    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Ungültige E-Mail-Adresse oder Passwort',
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Ungültige E-Mail-Adresse oder Passwort',
      })
    }

    // Generate JWT token
    const token = generateToken(user.id)

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
    })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        subscription: user.subscription,
        token,
      },
    })
  })
)

// Get current user
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        subscription: true,
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
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        subscription: user.subscription,
      },
    })
  })
)

// Update profile
router.patch(
  '/profile',
  authMiddleware,
  [
    body('name').optional().isString().isLength({ min: 2, max: 100 }),
    body('avatar').optional().isString(),
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

    const { name, avatar } = req.body
    const userId = req.user!.id

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
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
      updates: { name, avatar },
    })

    res.json({
      success: true,
      data: updatedUser,
    })
  })
)

// Change password
router.patch(
  '/password',
  authMiddleware,
  [
    body('currentPassword').isString().isLength({ min: 1 }),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
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

    const { currentPassword, newPassword } = req.body
    const userId = req.user!.id

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Benutzer nicht gefunden',
      })
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Aktuelles Passwort ist falsch',
      })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    })

    logger.info('User password changed', {
      userId,
    })

    res.json({
      success: true,
      message: 'Passwort erfolgreich geändert',
    })
  })
)

// Logout endpoint
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // In a stateless JWT setup, logout is handled client-side by removing the token
    // But we can log the logout event for security purposes
    logger.info('User logged out', {
      userId: req.user!.id,
    })

    res.json({
      success: true,
      message: 'Erfolgreich abgemeldet',
    })
  })
)

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })
    }

    const { email } = req.body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine Passwort-Reset-E-Mail gesendet',
      })
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    // TODO: Send email with reset token
    // For now, just log it (in production, send actual email)
    logger.info('Password reset requested', {
      userId: user.id,
      email: user.email,
      resetToken, // Remove this in production
    })

    res.json({
      success: true,
      message: 'Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine Passwort-Reset-E-Mail gesendet',
    })
  })
)

// Reset password
router.post(
  '/reset-password',
  [
    body('token').isString().isLength({ min: 1 }),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
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

    const { token, password } = req.body

    try {
      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      if (decoded.type !== 'password-reset') {
        return res.status(400).json({
          success: false,
          error: 'Ungültiger Reset-Token',
        })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Update password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          password: hashedPassword,
        },
      })

      logger.info('Password reset successfully', {
        userId: decoded.userId,
      })

      res.json({
        success: true,
        message: 'Passwort erfolgreich zurückgesetzt',
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Ungültiger oder abgelaufener Reset-Token',
      })
    }
  })
)

export default router
