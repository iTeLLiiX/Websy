import Stripe from 'stripe'
import { logger } from '../utils/logger'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export class StripeService {
  // Create or get customer
  static async createOrGetCustomer(userId: string, email: string, name: string): Promise<Stripe.Customer> {
    try {
      // First, try to find existing customer
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        logger.info('Existing Stripe customer found', {
          userId,
          customerId: existingCustomers.data[0].id,
        })
        return existingCustomers.data[0]
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      })

      logger.info('New Stripe customer created', {
        userId,
        customerId: customer.id,
      })

      return customer
    } catch (error) {
      logger.error('Error creating/getting Stripe customer:', error)
      throw new Error('Fehler bei der Stripe-Kunden-Erstellung')
    }
  }

  // Create checkout session
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string>
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        subscription_data: {
          metadata,
        },
      })

      logger.info('Checkout session created', {
        sessionId: session.id,
        customerId,
        priceId,
      })

      return session
    } catch (error) {
      logger.error('Error creating checkout session:', error)
      throw new Error('Fehler bei der Checkout-Session-Erstellung')
    }
  }

  // Create portal session
  static async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })

      logger.info('Portal session created', {
        sessionId: session.id,
        customerId,
      })

      return session
    } catch (error) {
      logger.error('Error creating portal session:', error)
      throw new Error('Fehler bei der Portal-Session-Erstellung')
    }
  }

  // Get subscription
  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      return subscription
    } catch (error) {
      logger.error('Error retrieving subscription:', error)
      throw new Error('Fehler beim Abrufen des Abonnements')
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
        ...(immediately && { status: 'canceled' }),
      })

      logger.info('Subscription cancelled', {
        subscriptionId,
        immediately,
      })

      return subscription
    } catch (error) {
      logger.error('Error cancelling subscription:', error)
      throw new Error('Fehler beim Kündigen des Abonnements')
    }
  }

  // Reactivate subscription
  static async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      })

      logger.info('Subscription reactivated', {
        subscriptionId,
      })

      return subscription
    } catch (error) {
      logger.error('Error reactivating subscription:', error)
      throw new Error('Fehler beim Reaktivieren des Abonnements')
    }
  }

  // Update subscription plan
  static async updateSubscriptionPlan(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
    try {
      // Get current subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      // Update subscription with new price
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      })

      logger.info('Subscription plan updated', {
        subscriptionId,
        newPriceId,
      })

      return updatedSubscription
    } catch (error) {
      logger.error('Error updating subscription plan:', error)
      throw new Error('Fehler beim Aktualisieren des Abonnement-Plans')
    }
  }

  // Get price
  static async getPrice(priceId: string): Promise<Stripe.Price> {
    try {
      const price = await stripe.prices.retrieve(priceId)
      return price
    } catch (error) {
      logger.error('Error retrieving price:', error)
      throw new Error('Fehler beim Abrufen des Preises')
    }
  }

  // Get product
  static async getProduct(productId: string): Promise<Stripe.Product> {
    try {
      const product = await stripe.products.retrieve(productId)
      return product
    } catch (error) {
      logger.error('Error retrieving product:', error)
      throw new Error('Fehler beim Abrufen des Produkts')
    }
  }

  // Get payment methods
  static async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      })

      return paymentMethods.data
    } catch (error) {
      logger.error('Error retrieving payment methods:', error)
      throw new Error('Fehler beim Abrufen der Zahlungsmethoden')
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )

      return event
    } catch (error) {
      logger.error('Webhook signature verification failed:', error)
      throw new Error('Webhook-Signatur-Verifizierung fehlgeschlagen')
    }
  }

  // Create product (for admin use)
  static async createProduct(name: string, description: string): Promise<Stripe.Product> {
    try {
      const product = await stripe.products.create({
        name,
        description,
        type: 'service',
      })

      logger.info('Product created', {
        productId: product.id,
        name,
      })

      return product
    } catch (error) {
      logger.error('Error creating product:', error)
      throw new Error('Fehler beim Erstellen des Produkts')
    }
  }

  // Create price (for admin use)
  static async createPrice(
    productId: string,
    unitAmount: number,
    currency: string = 'eur',
    interval: 'month' | 'year' = 'month'
  ): Promise<Stripe.Price> {
    try {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: unitAmount,
        currency,
        recurring: {
          interval,
        },
      })

      logger.info('Price created', {
        priceId: price.id,
        productId,
        unitAmount,
        currency,
        interval,
      })

      return price
    } catch (error) {
      logger.error('Error creating price:', error)
      throw new Error('Fehler beim Erstellen des Preises')
    }
  }

  // Get all products
  static async getAllProducts(): Promise<Stripe.Product[]> {
    try {
      const products = await stripe.products.list({
        active: true,
        limit: 100,
      })

      return products.data
    } catch (error) {
      logger.error('Error retrieving products:', error)
      throw new Error('Fehler beim Abrufen der Produkte')
    }
  }

  // Get all prices for a product
  static async getProductPrices(productId: string): Promise<Stripe.Price[]> {
    try {
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 100,
      })

      return prices.data
    } catch (error) {
      logger.error('Error retrieving product prices:', error)
      throw new Error('Fehler beim Abrufen der Produktpreise')
    }
  }

  // Create invoice item
  static async createInvoiceItem(
    customerId: string,
    amount: number,
    currency: string = 'eur',
    description: string
  ): Promise<Stripe.InvoiceItem> {
    try {
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customerId,
        amount,
        currency,
        description,
      })

      logger.info('Invoice item created', {
        invoiceItemId: invoiceItem.id,
        customerId,
        amount,
        description,
      })

      return invoiceItem
    } catch (error) {
      logger.error('Error creating invoice item:', error)
      throw new Error('Fehler beim Erstellen des Rechnungspostens')
    }
  }

  // Create invoice
  static async createInvoice(customerId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
      })

      logger.info('Invoice created', {
        invoiceId: invoice.id,
        customerId,
      })

      return invoice
    } catch (error) {
      logger.error('Error creating invoice:', error)
      throw new Error('Fehler beim Erstellen der Rechnung')
    }
  }

  // Finalize invoice
  static async finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.finalizeInvoice(invoiceId)

      logger.info('Invoice finalized', {
        invoiceId,
      })

      return invoice
    } catch (error) {
      logger.error('Error finalizing invoice:', error)
      throw new Error('Fehler beim Finalisieren der Rechnung')
    }
  }

  // Pay invoice
  static async payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.pay(invoiceId)

      logger.info('Invoice paid', {
        invoiceId,
      })

      return invoice
    } catch (error) {
      logger.error('Error paying invoice:', error)
      throw new Error('Fehler beim Bezahlen der Rechnung')
    }
  }

  // Get customer invoices
  static async getCustomerInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit,
      })

      return invoices.data
    } catch (error) {
      logger.error('Error retrieving customer invoices:', error)
      throw new Error('Fehler beim Abrufen der Kundenrechnungen')
    }
  }

  // Get upcoming invoice
  static async getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice | null> {
    try {
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
      })

      return invoice
    } catch (error) {
      if (error.code === 'invoice_upcoming_none') {
        return null
      }
      logger.error('Error retrieving upcoming invoice:', error)
      throw new Error('Fehler beim Abrufen der anstehenden Rechnung')
    }
  }

  // Create setup intent
  static async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      })

      logger.info('Setup intent created', {
        setupIntentId: setupIntent.id,
        customerId,
      })

      return setupIntent
    } catch (error) {
      logger.error('Error creating setup intent:', error)
      throw new Error('Fehler beim Erstellen des Setup-Intents')
    }
  }

  // Get setup intents
  static async getSetupIntents(customerId: string): Promise<Stripe.SetupIntent[]> {
    try {
      const setupIntents = await stripe.setupIntents.list({
        customer: customerId,
        limit: 10,
      })

      return setupIntents.data
    } catch (error) {
      logger.error('Error retrieving setup intents:', error)
      throw new Error('Fehler beim Abrufen der Setup-Intents')
    }
  }
}

export const stripeService = StripeService