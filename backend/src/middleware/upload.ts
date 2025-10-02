import multer from 'multer'
import path from 'path'
import { Request } from 'express'
import { logger } from '../utils/logger'

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    const uploadPath = process.env.UPLOAD_PATH || 'uploads'
    cb(null, uploadPath)
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    const filename = file.fieldname + '-' + uniqueSuffix + extension
    cb(null, filename)
  }
})

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Dateityp nicht erlaubt. Erlaubte Typen: Bilder, PDF, Text, Word'), false)
  }
}

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files per request
  }
})

// Single file upload middleware
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: any, next: any) => {
    const uploadSingleFile = upload.single(fieldName)
    
    uploadSingleFile(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err)
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              success: false,
              error: 'Datei ist zu groß. Maximum: 10MB'
            })
          case 'LIMIT_FILE_COUNT':
            return res.status(400).json({
              success: false,
              error: 'Zu viele Dateien. Maximum: 5 Dateien'
            })
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).json({
              success: false,
              error: 'Unerwartetes Dateifeld'
            })
          default:
            return res.status(400).json({
              success: false,
              error: 'Datei-Upload-Fehler: ' + err.message
            })
        }
      } else if (err) {
        logger.error('Upload error:', err)
        return res.status(400).json({
          success: false,
          error: err.message
        })
      }
      
      next()
    })
  }
}

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: any, next: any) => {
    const uploadMultipleFiles = upload.array(fieldName, maxCount)
    
    uploadMultipleFiles(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err)
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              success: false,
              error: 'Eine oder mehrere Dateien sind zu groß. Maximum: 10MB pro Datei'
            })
          case 'LIMIT_FILE_COUNT':
            return res.status(400).json({
              success: false,
              error: `Zu viele Dateien. Maximum: ${maxCount} Dateien`
            })
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).json({
              success: false,
              error: 'Unerwartetes Dateifeld'
            })
          default:
            return res.status(400).json({
              success: false,
              error: 'Datei-Upload-Fehler: ' + err.message
            })
        }
      } else if (err) {
        logger.error('Upload error:', err)
        return res.status(400).json({
          success: false,
          error: err.message
        })
      }
      
      next()
    })
  }
}

// Image only upload middleware
export const uploadImage = (fieldName: string) => {
  return (req: Request, res: any, next: any) => {
    const uploadImageFile = upload.single(fieldName)
    
    uploadImageFile(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err)
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              success: false,
              error: 'Bild ist zu groß. Maximum: 10MB'
            })
          case 'LIMIT_FILE_COUNT':
            return res.status(400).json({
              success: false,
              error: 'Zu viele Bilder. Maximum: 1 Bild'
            })
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).json({
              success: false,
              error: 'Unerwartetes Bildfeld'
            })
          default:
            return res.status(400).json({
              success: false,
              error: 'Bild-Upload-Fehler: ' + err.message
            })
        }
      } else if (err) {
        logger.error('Image upload error:', err)
        return res.status(400).json({
          success: false,
          error: err.message
        })
      }
      
      next()
    })
  }
}

// Audio upload middleware (for voice features)
export const uploadAudio = (fieldName: string) => {
  const audioFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/m4a',
      'audio/aac'
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Audio-Dateityp nicht erlaubt. Erlaubte Typen: MP3, WAV, OGG, WebM, M4A, AAC'), false)
    }
  }

  const audioUpload = multer({
    storage: storage,
    fileFilter: audioFilter,
    limits: {
      fileSize: 25 * 1024 * 1024, // 25MB limit for audio
      files: 1, // Only 1 audio file
    }
  })

  return (req: Request, res: any, next: any) => {
    const uploadAudioFile = audioUpload.single(fieldName)
    
    uploadAudioFile(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        logger.error('Audio upload error:', err)
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              success: false,
              error: 'Audio-Datei ist zu groß. Maximum: 25MB'
            })
          case 'LIMIT_FILE_COUNT':
            return res.status(400).json({
              success: false,
              error: 'Nur eine Audio-Datei erlaubt'
            })
          default:
            return res.status(400).json({
              success: false,
              error: 'Audio-Upload-Fehler: ' + err.message
            })
        }
      } else if (err) {
        logger.error('Audio upload error:', err)
        return res.status(400).json({
          success: false,
          error: err.message
        })
      }
      
      next()
    })
  }
}

export default upload