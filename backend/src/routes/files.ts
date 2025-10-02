import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../index'
import { authMiddleware } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const router = Router()

// Apply authentication to all routes
router.use(authMiddleware)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads')
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    const filename = file.fieldname + '-' + uniqueSuffix + extension
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|txt/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Nur Bilder, PDFs und Dokumente sind erlaubt'))
    }
  }
})

// Upload single file
router.post(
  '/upload',
  upload.single('file'),
  [
    body('websiteId').isString().isLength({ min: 1 }),
    body('type').optional().isIn(['image', 'document', 'logo', 'background']),
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Keine Datei hochgeladen',
      })
    }

    const { websiteId, type = 'image' } = req.body
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

    // Get file info
    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
    }

    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        websiteId,
        userId,
        originalName: fileInfo.originalName,
        filename: fileInfo.filename,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
        path: fileInfo.path,
        url: fileInfo.url,
        type,
      },
    })

    logger.info('File uploaded', {
      fileId: fileRecord.id,
      websiteId,
      userId,
      filename: fileInfo.filename,
      type,
    })

    res.status(201).json({
      success: true,
      data: fileRecord,
    })
  })
)

// Upload multiple files
router.post(
  '/upload-multiple',
  upload.array('files', 10), // Max 10 files
  [
    body('websiteId').isString().isLength({ min: 1 }),
    body('type').optional().isIn(['image', 'document', 'logo', 'background']),
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

    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Keine Dateien hochgeladen',
      })
    }

    const { websiteId, type = 'image' } = req.body
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

    // Process each file
    const fileRecords = await Promise.all(
      files.map(async (file) => {
        const fileInfo = {
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/${file.filename}`,
        }

        return prisma.file.create({
          data: {
            websiteId,
            userId,
            originalName: fileInfo.originalName,
            filename: fileInfo.filename,
            mimetype: fileInfo.mimetype,
            size: fileInfo.size,
            path: fileInfo.path,
            url: fileInfo.url,
            type,
          },
        })
      })
    )

    logger.info('Multiple files uploaded', {
      websiteId,
      userId,
      fileCount: files.length,
      type,
    })

    res.status(201).json({
      success: true,
      data: fileRecords,
    })
  })
)

// Get files for website
router.get(
  '/website/:websiteId',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { websiteId } = req.params
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

    // Get files
    const files = await prisma.file.findMany({
      where: { websiteId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json({
      success: true,
      data: files,
    })
  })
)

// Get user files
router.get(
  '/user/files',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    const files = await prisma.file.findMany({
      where: { userId },
      include: {
        website: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json({
      success: true,
      data: files,
    })
  })
)

// Get single file
router.get(
  '/:fileId',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { fileId } = req.params
    const userId = req.user!.id

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'Datei nicht gefunden',
      })
    }

    res.json({
      success: true,
      data: file,
    })
  })
)

// Update file metadata
router.patch(
  '/:fileId',
  [
    body('originalName').optional().isString().isLength({ min: 1, max: 255 }),
    body('type').optional().isIn(['image', 'document', 'logo', 'background']),
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

    const { fileId } = req.params
    const userId = req.user!.id
    const updates = req.body

    // Check if file exists and belongs to user
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'Datei nicht gefunden',
      })
    }

    // Update file
    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: {
        ...(updates.originalName && { originalName: updates.originalName }),
        ...(updates.type && { type: updates.type }),
      },
    })

    logger.info('File metadata updated', {
      fileId,
      userId,
      updates,
    })

    res.json({
      success: true,
      data: updatedFile,
    })
  })
)

// Delete file
router.delete(
  '/:fileId',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { fileId } = req.params
    const userId = req.user!.id

    // Check if file exists and belongs to user
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'Datei nicht gefunden',
      })
    }

    // Delete physical file
    try {
      const unlink = promisify(fs.unlink)
      await unlink(file.path)
    } catch (error) {
      logger.error('Failed to delete physical file', {
        fileId,
        path: file.path,
        error: error.message,
      })
    }

    // Delete file record from database
    await prisma.file.delete({
      where: { id: fileId },
    })

    logger.info('File deleted', {
      fileId,
      userId,
      filename: file.filename,
    })

    res.json({
      success: true,
      message: 'Datei erfolgreich gelöscht',
    })
  })
)

// Serve uploaded files
router.get(
  '/serve/:filename',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { filename } = req.params

    // Find file in database
    const file = await prisma.file.findFirst({
      where: { filename },
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'Datei nicht gefunden',
      })
    }

    // Check if physical file exists
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        error: 'Datei nicht gefunden',
      })
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.mimetype)
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`)

    // Stream file
    const fileStream = fs.createReadStream(file.path)
    fileStream.pipe(res)
  })
)

// Get file usage statistics
router.get(
  '/stats/usage',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    // Get file statistics
    const [
      totalFiles,
      totalSize,
      filesByType,
      recentFiles,
    ] = await Promise.all([
      prisma.file.count({
        where: { userId },
      }),
      prisma.file.aggregate({
        where: { userId },
        _sum: {
          size: true,
        },
      }),
      prisma.file.groupBy({
        by: ['type'],
        where: { userId },
        _count: {
          id: true,
        },
      }),
      prisma.file.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          originalName: true,
          type: true,
          size: true,
          createdAt: true,
        },
      }),
    ])

    const stats = {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      filesByType: filesByType.map(item => ({
        type: item.type,
        count: item._count.id,
      })),
      recentFiles,
    }

    res.json({
      success: true,
      data: stats,
    })
  })
)

// Clean up orphaned files (admin function)
router.post(
  '/cleanup/orphaned',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    // Get all files for user
    const files = await prisma.file.findMany({
      where: { userId },
    })

    let deletedCount = 0
    let errorCount = 0

    // Check each file
    for (const file of files) {
      try {
        // Check if physical file exists
        if (!fs.existsSync(file.path)) {
          // Delete database record
          await prisma.file.delete({
            where: { id: file.id },
          })
          deletedCount++
        }
      } catch (error) {
        errorCount++
        logger.error('Error cleaning up file', {
          fileId: file.id,
          error: error.message,
        })
      }
    }

    logger.info('File cleanup completed', {
      userId,
      deletedCount,
      errorCount,
    })

    res.json({
      success: true,
      data: {
        deletedCount,
        errorCount,
      },
      message: `${deletedCount} verwaiste Dateien bereinigt`,
    })
  })
)

export default router
