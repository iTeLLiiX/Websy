import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config()

// Initialize Prisma
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Create Express app
const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL!]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

// Compression
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WebsiteBuilder AI API is running! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  })
})

// Import routes
import authRoutes from './routes/auth'
import websiteRoutes from './routes/websites'
import templateRoutes from './routes/templates'
import paymentRoutes from './routes/payments'
import fileRoutes from './routes/files'
import analyticsRoutes from './routes/analytics'
import aiRoutes from './routes/ai'
import userRoutes from './routes/users'
import pageRoutes from './routes/pages'
import sectionRoutes from './routes/sections'

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/websites', websiteRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/users', userRoutes)
app.use('/api/pages', pageRoutes)
app.use('/api/sections', sectionRoutes)

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API funktioniert perfekt! 🎉',
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} nicht gefunden`,
  })
})

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error)
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Interner Serverfehler' 
      : error.message,
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect()
    console.log('✅ Connected to database')

    // Start server
    app.listen(PORT, () => {
      console.log('🚀 Server running!')
      console.log(`📍 Port: ${PORT}`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
      console.log(`🔗 Health check: http://localhost:${PORT}/health`)
      console.log(`🧪 API test: http://localhost:${PORT}/api/test`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app