import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limiter for authentication
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Zu viele Anmeldeversuche, bitte versuchen Sie es in 15 Minuten erneut.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
})

// Rate limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    error: 'Zu viele Passwort-Reset-Anfragen, bitte versuchen Sie es in einer Stunde erneut.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for AI endpoints
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 AI requests per minute
  message: {
    success: false,
    error: 'Zu viele KI-Anfragen, bitte warten Sie einen Moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 uploads per minute
  message: {
    success: false,
    error: 'Zu viele Datei-Uploads, bitte warten Sie einen Moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for payment endpoints
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 payment requests per minute
  message: {
    success: false,
    error: 'Zu viele Zahlungsanfragen, bitte warten Sie einen Moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for analytics tracking
export const analyticsRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 analytics events per minute
  message: {
    success: false,
    error: 'Zu viele Analytics-Events, bitte warten Sie einen Moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Dynamic rate limiter based on user subscription
export const subscriptionBasedLimiter = (req: Request, res: Response, next: Function) => {
  // This would be used with a custom rate limiter that checks user subscription
  // For now, we'll use the standard API limiter
  return apiLimiter(req, res, next)
}

// Rate limiter for public endpoints (no auth required)
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for webhook endpoints
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 webhook requests per minute
  message: {
    success: false,
    error: 'Zu viele Webhook-Anfragen, bitte warten Sie einen Moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for search endpoints
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 search requests per minute
  message: {
    success: false,
    error: 'Zu viele Suchanfragen, bitte warten Sie einen Moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for contact/support endpoints
export const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 contact requests per hour
  message: {
    success: false,
    error: 'Zu viele Kontaktanfragen, bitte versuchen Sie es in einer Stunde erneut.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})