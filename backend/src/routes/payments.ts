import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../index'
import { authMiddleware, requireActiveSubscription } from '../middleware/auth'
import { stripeService } from '../services/stripeService'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = Router()

// Apply authentication to all routes
router.use(authMiddleware)

// Create checkout session
router.post(
  '/create-checkout-session',
  [
    body('priceId').isString().isLength({ min: 1 }),
    body('successUrl').isString().isURL(),
    body('cancelUrl').isString().isURL(),
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

    const { priceId, successUrl, cancelUrl } = req.body
    const userId = req.user!.id

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Create or get Stripe customer
    const customer = await stripeService.createOrGetCustomer(
      userId,
      user.email,
      user.name
    )

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customer.id,
      priceId,
      successUrl,
      cancelUrl,
      {
        userId,
        email: user.email,
      }
    )

    logger.info('Checkout session created', {
      userId,
      priceId,
      sessionId: session.id,
    })

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    })
  })
)

// Create portal session for subscription management
router.post(
  '/create-portal-session',
  [
    body('returnUrl').isString().isURL(),
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

    const { returnUrl } = req.body
    const userId = req.user!.id

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user || !user.subscription || !user.subscription.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        error: 'Kein aktives Abonnement gefunden',
      })
    }

    // Create portal session
    const session = await stripeService.createPortalSession(
      user.subscription.stripeCustomerId,
      returnUrl
    )

    logger.info('Portal session created', {
      userId,
      sessionId: session.id,
    })

    res.json({
      success: true,
      data: {
        url: session.url,
      },
    })
  })
)

// Get subscription details
router.get(
  '/subscription',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user || !user.subscription) {
      return res.json({
        success: true,
        data: {
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
      data: user.subscription,
    })
  })
)

// Cancel subscription
router.post(
  '/subscription/cancel',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user || !user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        error: 'Kein aktives Abonnement gefunden',
      })
    }

    // Cancel subscription in Stripe
    const subscription = await stripeService.cancelSubscription(
      user.subscription.stripeSubscriptionId,
      false // Don't cancel immediately, cancel at period end
    )

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        status: subscription.status.toUpperCase(),
      },
    })

    logger.info('Subscription cancelled', {
      userId,
      subscriptionId: subscription.id,
    })

    res.json({
      success: true,
      data: updatedSubscription,
      message: 'Abonnement wird am Ende des aktuellen Abrechnungszeitraums gekündigt',
    })
  })
)

// Reactivate subscription
router.post(
  '/subscription/reactivate',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user || !user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        error: 'Kein Abonnement gefunden',
      })
    }

    // Reactivate subscription in Stripe
    const subscription = await stripeService.reactivateSubscription(
      user.subscription.stripeSubscriptionId
    )

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        status: subscription.status.toUpperCase(),
      },
    })

    logger.info('Subscription reactivated', {
      userId,
      subscriptionId: subscription.id,
    })

    res.json({
      success: true,
      data: updatedSubscription,
      message: 'Abonnement erfolgreich reaktiviert',
    })
  })
)

// Update subscription plan
router.post(
  '/subscription/update-plan',
  [
    body('newPriceId').isString().isLength({ min: 1 }),
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

    const { newPriceId } = req.body
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user || !user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        error: 'Kein aktives Abonnement gefunden',
      })
    }

    // Update subscription plan in Stripe
    const subscription = await stripeService.updateSubscriptionPlan(
      user.subscription.stripeSubscriptionId,
      newPriceId
    )

    // Get price details to determine plan
    const price = await stripeService.getPrice(newPriceId)
    const product = await stripeService.getProduct(price.product as string)

    // Map Stripe plan to our plan enum
    const planMapping: Record<string, string> = {
      'starter': 'STARTER',
      'professional': 'PROFESSIONAL',
      'business': 'BUSINESS',
    }

    const newPlan = planMapping[product.name.toLowerCase()] || 'STARTER'

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        plan: newPlan as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })

    logger.info('Subscription plan updated', {
      userId,
      subscriptionId: subscription.id,
      newPlan,
    })

    res.json({
      success: true,
      data: updatedSubscription,
      message: 'Abonnement-Plan erfolgreich geändert',
    })
  })
)

// Get payment methods
router.get(
  '/payment-methods',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user || !user.subscription || !user.subscription.stripeCustomerId) {
      return res.json({
        success: true,
        data: [],
      })
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripeService.getPaymentMethods(
      user.subscription.stripeCustomerId
    )

    res.json({
      success: true,
      data: paymentMethods,
    })
  })
)

// Get payment history
router.get(
  '/payments',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    res.json({
      success: true,
      data: payments,
    })
  })
)

// Webhook endpoint for Stripe events
router.post(
  '/webhook',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'] as string
    const payload = JSON.stringify(req.body)

    try {
      // Verify webhook signature
      const event = stripeService.verifyWebhookSignature(payload, sig)

      logger.info('Stripe webhook received', {
        type: event.type,
        id: event.id,
      })

      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object)
          break

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object)
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object)
          break

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object)
          break

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object)
          break

        default:
          logger.info('Unhandled webhook event type', {
            type: event.type,
          })
      }

      res.json({ received: true })
    } catch (error) {
      logger.error('Webhook signature verification failed', {
        error: error.message,
      })
      res.status(400).send('Webhook signature verification failed')
    }
  })
)

// Webhook handlers
async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata.userId

  if (!userId) {
    logger.error('No userId in checkout session metadata')
    return
  }

  // Get subscription from Stripe
  const subscription = await stripeService.getSubscription(session.subscription)

  // Map Stripe plan to our plan enum
  const planMapping: Record<string, string> = {
    'starter': 'STARTER',
    'professional': 'PROFESSIONAL',
    'business': 'BUSINESS',
  }

  const price = await stripeService.getPrice(subscription.items.data[0].price.id)
  const product = await stripeService.getProduct(price.product as string)
  const plan = planMapping[product.name.toLowerCase()] || 'STARTER'

  // Update or create subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan: plan as any,
      status: subscription.status.toUpperCase(),
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      plan: plan as any,
      status: subscription.status.toUpperCase(),
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })

  logger.info('Checkout session completed', {
    userId,
    subscriptionId: subscription.id,
    plan,
  })
}

async function handleSubscriptionUpdated(subscription: any) {
  const userId = await getUserIdFromStripeCustomer(subscription.customer)

  if (!userId) {
    logger.error('No user found for Stripe customer', {
      customerId: subscription.customer,
    })
    return
  }

  // Update subscription in database
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: subscription.status.toUpperCase(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })

  logger.info('Subscription updated', {
    userId,
    subscriptionId: subscription.id,
    status: subscription.status,
  })
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = await getUserIdFromStripeCustomer(subscription.customer)

  if (!userId) {
    logger.error('No user found for Stripe customer', {
      customerId: subscription.customer,
    })
    return
  }

  // Update subscription status to cancelled
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: false,
    },
  })

  logger.info('Subscription cancelled', {
    userId,
    subscriptionId: subscription.id,
  })
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const userId = await getUserIdFromStripeCustomer(invoice.customer)

  if (!userId) {
    logger.error('No user found for Stripe customer', {
      customerId: invoice.customer,
    })
    return
  }

  // Record successful payment
  await prisma.payment.create({
    data: {
      userId,
      stripePaymentId: invoice.payment_intent,
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      status: 'COMPLETED',
      description: invoice.description,
      metadata: {
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription,
      },
    },
  })

  logger.info('Invoice payment succeeded', {
    userId,
    invoiceId: invoice.id,
    amount: invoice.amount_paid,
  })
}

async function handleInvoicePaymentFailed(invoice: any) {
  const userId = await getUserIdFromStripeCustomer(invoice.customer)

  if (!userId) {
    logger.error('No user found for Stripe customer', {
      customerId: invoice.customer,
    })
    return
  }

  // Record failed payment
  await prisma.payment.create({
    data: {
      userId,
      stripePaymentId: invoice.payment_intent || `failed_${invoice.id}`,
      amount: invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      status: 'FAILED',
      description: `Failed payment: ${invoice.description}`,
      metadata: {
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription,
      },
    },
  })

  // Update subscription status
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'PAST_DUE',
    },
  })

  logger.info('Invoice payment failed', {
    userId,
    invoiceId: invoice.id,
    amount: invoice.amount_due,
  })
}

async function getUserIdFromStripeCustomer(customerId: string): Promise<string | null> {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  })

  return subscription?.userId || null
}

export default router
