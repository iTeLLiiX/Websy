import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { logger } from '../utils/logger'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export class CustomError extends Error implements AppError {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Interner Serverfehler'
  let details: any = null

  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    statusCode,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })

  // Handle different error types
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database errors
    switch (error.code) {
      case 'P2002':
        statusCode = 409
        message = 'Ein Datensatz mit diesen Informationen existiert bereits'
        details = {
          field: error.meta?.target,
          code: error.code,
        }
        break
      case 'P2025':
        statusCode = 404
        message = 'Datensatz nicht gefunden'
        details = {
          code: error.code,
        }
        break
      case 'P2003':
        statusCode = 400
        message = 'Ungültige Referenz zu einem anderen Datensatz'
        details = {
          field: error.meta?.field_name,
          code: error.code,
        }
        break
      case 'P2014':
        statusCode = 400
        message = 'Konflikt bei der Beziehung zwischen Datensätzen'
        details = {
          relation: error.meta?.relation_name,
          code: error.code,
        }
        break
      default:
        statusCode = 400
        message = 'Datenbankfehler'
        details = {
          code: error.code,
        }
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    message = 'Ungültige Datenvalidierung'
    details = {
      message: error.message,
    }
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500
    message = 'Datenbankverbindungsfehler'
    logger.error('Database connection error:', error)
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500
    message = 'Kritischer Datenbankfehler'
    logger.error('Database panic error:', error)
  } else if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validierungsfehler'
    details = error.message
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = 'Ungültiger Datentyp'
  } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    statusCode = 500
    message = 'Datenbankfehler'
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Ungültiger Authentifizierungstoken'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Authentifizierungstoken ist abgelaufen'
  } else if (error.name === 'NotBeforeError') {
    statusCode = 401
    message = 'Authentifizierungstoken ist noch nicht gültig'
  } else if (error.name === 'MulterError') {
    statusCode = 400
    message = 'Datei-Upload-Fehler'
    details = error.message
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    statusCode = 400
    message = 'Ungültiges JSON-Format'
  } else if (error.name === 'TypeError' && error.message.includes('Cannot read property')) {
    statusCode = 400
    message = 'Ungültige Anfrage'
  } else if (error.name === 'ReferenceError') {
    statusCode = 500
    message = 'Interner Serverfehler'
  } else if (error.name === 'RangeError') {
    statusCode = 400
    message = 'Wert außerhalb des gültigen Bereichs'
  } else if (error.name === 'URIError') {
    statusCode = 400
    message = 'Ungültige URL'
  } else if (error.name === 'EvalError') {
    statusCode = 500
    message = 'Ausführungsfehler'
  } else if (error.name === 'AggregateError') {
    statusCode = 500
    message = 'Mehrere Fehler aufgetreten'
  } else if (error.name === 'Error' && error.message.includes('ENOTFOUND')) {
    statusCode = 500
    message = 'Netzwerkfehler'
  } else if (error.name === 'Error' && error.message.includes('ECONNREFUSED')) {
    statusCode = 500
    message = 'Verbindung verweigert'
  } else if (error.name === 'Error' && error.message.includes('ETIMEDOUT')) {
    statusCode = 500
    message = 'Verbindungstimeout'
  } else if (error.name === 'Error' && error.message.includes('EADDRINUSE')) {
    statusCode = 500
    message = 'Port bereits in Verwendung'
  } else if (error.name === 'Error' && error.message.includes('EACCES')) {
    statusCode = 500
    message = 'Berechtigungsfehler'
  } else if (error.name === 'Error' && error.message.includes('ENOENT')) {
    statusCode = 500
    message = 'Datei oder Verzeichnis nicht gefunden'
  } else if (error.name === 'Error' && error.message.includes('EMFILE')) {
    statusCode = 500
    message = 'Zu viele geöffnete Dateien'
  } else if (error.name === 'Error' && error.message.includes('ENOSPC')) {
    statusCode = 500
    message = 'Kein Speicherplatz verfügbar'
  } else if (error.name === 'Error' && error.message.includes('EPIPE')) {
    statusCode = 500
    message = 'Verbindung unterbrochen'
  } else if (error.name === 'Error' && error.message.includes('ECONNRESET')) {
    statusCode = 500
    message = 'Verbindung zurückgesetzt'
  } else if (error.name === 'Error' && error.message.includes('EHOSTUNREACH')) {
    statusCode = 500
    message = 'Host nicht erreichbar'
  } else if (error.name === 'Error' && error.message.includes('ENETUNREACH')) {
    statusCode = 500
    message = 'Netzwerk nicht erreichbar'
  } else if (error.name === 'Error' && error.message.includes('EISDIR')) {
    statusCode = 500
    message = 'Ist ein Verzeichnis'
  } else if (error.name === 'Error' && error.message.includes('ENOTDIR')) {
    statusCode = 500
    message = 'Ist kein Verzeichnis'
  } else if (error.name === 'Error' && error.message.includes('EEXIST')) {
    statusCode = 500
    message = 'Datei existiert bereits'
  } else if (error.name === 'Error' && error.message.includes('EXDEV')) {
    statusCode = 500
    message = 'Cross-device link'
  } else if (error.name === 'Error' && error.message.includes('ENODEV')) {
    statusCode = 500
    message = 'Gerät nicht verfügbar'
  } else if (error.name === 'Error' && error.message.includes('ENOMEM')) {
    statusCode = 500
    message = 'Nicht genügend Speicher'
  } else if (error.name === 'Error' && error.message.includes('EINVAL')) {
    statusCode = 400
    message = 'Ungültiger Parameter'
  } else if (error.name === 'Error' && error.message.includes('EPERM')) {
    statusCode = 403
    message = 'Berechtigung verweigert'
  } else if (error.name === 'Error' && error.message.includes('EBUSY')) {
    statusCode = 500
    message = 'Ressource ist beschäftigt'
  } else if (error.name === 'Error' && error.message.includes('EAGAIN')) {
    statusCode = 500
    message = 'Ressource temporär nicht verfügbar'
  } else if (error.name === 'Error' && error.message.includes('EINTR')) {
    statusCode = 500
    message = 'Systemaufruf unterbrochen'
  } else if (error.name === 'Error' && error.message.includes('EIO')) {
    statusCode = 500
    message = 'E/A-Fehler'
  } else if (error.name === 'Error' && error.message.includes('ENXIO')) {
    statusCode = 500
    message = 'Gerät oder Adresse nicht verfügbar'
  } else if (error.name === 'Error' && error.message.includes('E2BIG')) {
    statusCode = 400
    message = 'Argumentliste zu lang'
  } else if (error.name === 'Error' && error.message.includes('ENOEXEC')) {
    statusCode = 500
    message = 'Ausführungsformatfehler'
  } else if (error.name === 'Error' && error.message.includes('EBADF')) {
    statusCode = 500
    message = 'Ungültiger Dateideskriptor'
  } else if (error.name === 'Error' && error.message.includes('ECHILD')) {
    statusCode = 500
    message = 'Keine Kindprozesse'
  } else if (error.name === 'Error' && error.message.includes('EDEADLK')) {
    statusCode = 500
    message = 'Deadlock erkannt'
  } else if (error.name === 'Error' && error.message.includes('ENOMSG')) {
    statusCode = 500
    message = 'Keine Nachricht des gewünschten Typs'
  } else if (error.name === 'Error' && error.message.includes('EIDRM')) {
    statusCode = 500
    message = 'Bezeichner entfernt'
  } else if (error.name === 'Error' && error.message.includes('ENOSTR')) {
    statusCode = 500
    message = 'Nicht ein Stream'
  } else if (error.name === 'Error' && error.message.includes('ENODATA')) {
    statusCode = 500
    message = 'Keine Daten verfügbar'
  } else if (error.name === 'Error' && error.message.includes('ETIME')) {
    statusCode = 500
    message = 'Timer abgelaufen'
  } else if (error.name === 'Error' && error.message.includes('ENOSR')) {
    statusCode = 500
    message = 'Keine Stream-Ressourcen'
  } else if (error.name === 'Error' && error.message.includes('ENONET')) {
    statusCode = 500
    message = 'Maschine nicht im Netzwerk'
  } else if (error.name === 'Error' && error.message.includes('ENOPKG')) {
    statusCode = 500
    message = 'Paket nicht installiert'
  } else if (error.name === 'Error' && error.message.includes('EREMOTE')) {
    statusCode = 500
    message = 'Objekt ist remote'
  } else if (error.name === 'Error' && error.message.includes('ENOLINK')) {
    statusCode = 500
    message = 'Link wurde unterbrochen'
  } else if (error.name === 'Error' && error.message.includes('EADV')) {
    statusCode = 500
    message = 'Advertise-Fehler'
  } else if (error.name === 'Error' && error.message.includes('ESRMNT')) {
    statusCode = 500
    message = 'Srmount-Fehler'
  } else if (error.name === 'Error' && error.message.includes('ECOMM')) {
    statusCode = 500
    message = 'Kommunikationsfehler'
  } else if (error.name === 'Error' && error.message.includes('EPROTO')) {
    statusCode = 500
    message = 'Protokollfehler'
  } else if (error.name === 'Error' && error.message.includes('EMULTIHOP')) {
    statusCode = 500
    message = 'Multihop versucht'
  } else if (error.name === 'Error' && error.message.includes('EDOTDOT')) {
    statusCode = 500
    message = 'RFS-Fehler'
  } else if (error.name === 'Error' && error.message.includes('EBADMSG')) {
    statusCode = 500
    message = 'Ungültige Nachricht'
  } else if (error.name === 'Error' && error.message.includes('EOVERFLOW')) {
    statusCode = 500
    message = 'Wert zu groß für definierten Datentyp'
  } else if (error.name === 'Error' && error.message.includes('ENOTUNIQ')) {
    statusCode = 500
    message = 'Name nicht eindeutig im Netzwerk'
  } else if (error.name === 'Error' && error.message.includes('EBADFD')) {
    statusCode = 500
    message = 'Dateideskriptor in schlechtem Zustand'
  } else if (error.name === 'Error' && error.message.includes('EREMCHG')) {
    statusCode = 500
    message = 'Remote-Adresse geändert'
  } else if (error.name === 'Error' && error.message.includes('ELIBACC')) {
    statusCode = 500
    message = 'Kann nicht auf benötigte geteilte Bibliothek zugreifen'
  } else if (error.name === 'Error' && error.message.includes('ELIBBAD')) {
    statusCode = 500
    message = 'Zugriff auf beschädigte geteilte Bibliothek'
  } else if (error.name === 'Error' && error.message.includes('ELIBSCN')) {
    statusCode = 500
    message = '.lib-Abschnitt in a.out beschädigt'
  } else if (error.name === 'Error' && error.message.includes('ELIBMAX')) {
    statusCode = 500
    message = 'Versucht, mehr Bibliotheken zu verknüpfen als das System erlaubt'
  } else if (error.name === 'Error' && error.message.includes('ELIBEXEC')) {
    statusCode = 500
    message = 'Kann ausführbare Bibliothek nicht direkt ausführen'
  } else if (error.name === 'Error' && error.message.includes('EILSEQ')) {
    statusCode = 500
    message = 'Ungültige oder unvollständige Multibyte- oder Breitzeichensequenz'
  } else if (error.name === 'Error' && error.message.includes('ERESTART')) {
    statusCode = 500
    message = 'Systemaufruf sollte neu gestartet werden'
  } else if (error.name === 'Error' && error.message.includes('ESTRPIPE')) {
    statusCode = 500
    message = 'Streams-Pipe-Fehler'
  } else if (error.name === 'Error' && error.message.includes('EUSERS')) {
    statusCode = 500
    message = 'Zu viele Benutzer'
  } else if (error.name === 'Error' && error.message.includes('ENOTSOCK')) {
    statusCode = 500
    message = 'Socket-Operation auf Nicht-Socket'
  } else if (error.name === 'Error' && error.message.includes('EDESTADDRREQ')) {
    statusCode = 500
    message = 'Zieladresse erforderlich'
  } else if (error.name === 'Error' && error.message.includes('EMSGSIZE')) {
    statusCode = 500
    message = 'Nachricht zu lang'
  } else if (error.name === 'Error' && error.message.includes('EPROTOTYPE')) {
    statusCode = 500
    message = 'Protokolltyp falsch für Socket'
  } else if (error.name === 'Error' && error.message.includes('ENOPROTOOPT')) {
    statusCode = 500
    message = 'Protokolloption nicht verfügbar'
  } else if (error.name === 'Error' && error.message.includes('EPROTONOSUPPORT')) {
    statusCode = 500
    message = 'Protokoll nicht unterstützt'
  } else if (error.name === 'Error' && error.message.includes('ESOCKTNOSUPPORT')) {
    statusCode = 500
    message = 'Socket-Typ nicht unterstützt'
  } else if (error.name === 'Error' && error.message.includes('EOPNOTSUPP')) {
    statusCode = 500
    message = 'Operation nicht unterstützt'
  } else if (error.name === 'Error' && error.message.includes('EPFNOSUPPORT')) {
    statusCode = 500
    message = 'Protokollfamilie nicht unterstützt'
  } else if (error.name === 'Error' && error.message.includes('EAFNOSUPPORT')) {
    statusCode = 500
    message = 'Adressfamilie nicht von Protokoll unterstützt'
  } else if (error.name === 'Error' && error.message.includes('EADDRINUSE')) {
    statusCode = 500
    message = 'Adresse bereits in Verwendung'
  } else if (error.name === 'Error' && error.message.includes('EADDRNOTAVAIL')) {
    statusCode = 500
    message = 'Adresse nicht verfügbar'
  } else if (error.name === 'Error' && error.message.includes('ENETDOWN')) {
    statusCode = 500
    message = 'Netzwerk ist ausgefallen'
  } else if (error.name === 'Error' && error.message.includes('ENETUNREACH')) {
    statusCode = 500
    message = 'Netzwerk nicht erreichbar'
  } else if (error.name === 'Error' && error.message.includes('ENETRESET')) {
    statusCode = 500
    message = 'Netzwerk hat Verbindung zurückgesetzt'
  } else if (error.name === 'Error' && error.message.includes('ECONNABORTED')) {
    statusCode = 500
    message = 'Verbindung abgebrochen'
  } else if (error.name === 'Error' && error.message.includes('ECONNRESET')) {
    statusCode = 500
    message = 'Verbindung zurückgesetzt'
  } else if (error.name === 'Error' && error.message.includes('ENOBUFS')) {
    statusCode = 500
    message = 'Kein Pufferspeicher verfügbar'
  } else if (error.name === 'Error' && error.message.includes('EISCONN')) {
    statusCode = 500
    message = 'Transport-Endpunkt ist bereits verbunden'
  } else if (error.name === 'Error' && error.message.includes('ENOTCONN')) {
    statusCode = 500
    message = 'Transport-Endpunkt ist nicht verbunden'
  } else if (error.name === 'Error' && error.message.includes('ESHUTDOWN')) {
    statusCode = 500
    message = 'Transport-Endpunkt wurde heruntergefahren'
  } else if (error.name === 'Error' && error.message.includes('ETOOMANYREFS')) {
    statusCode = 500
    message = 'Zu viele Referenzen: kann Verbindung nicht aufteilen'
  } else if (error.name === 'Error' && error.message.includes('EHOSTDOWN')) {
    statusCode = 500
    message = 'Host ist ausgefallen'
  } else if (error.name === 'Error' && error.message.includes('EHOSTUNREACH')) {
    statusCode = 500
    message = 'Host nicht erreichbar'
  } else if (error.name === 'Error' && error.message.includes('EALREADY')) {
    statusCode = 500
    message = 'Operation bereits im Gange'
  } else if (error.name === 'Error' && error.message.includes('EINPROGRESS')) {
    statusCode = 500
    message = 'Operation läuft bereits'
  } else if (error.name === 'Error' && error.message.includes('ESTALE')) {
    statusCode = 500
    message = 'Stale-Datei-Handle'
  } else if (error.name === 'Error' && error.message.includes('EUCLEAN')) {
    statusCode = 500
    message = 'Struktur muss bereinigt werden'
  } else if (error.name === 'Error' && error.message.includes('ENOTNAM')) {
    statusCode = 500
    message = 'Nicht ein XENIX-named-Typ-Datei'
  } else if (error.name === 'Error' && error.message.includes('ENAVAIL')) {
    statusCode = 500
    message = 'Kein XENIX-Semaphor verfügbar'
  } else if (error.name === 'Error' && error.message.includes('EISNAM')) {
    statusCode = 500
    message = 'Ist ein Named-Typ-Datei'
  } else if (error.name === 'Error' && error.message.includes('EREMOTEIO')) {
    statusCode = 500
    message = 'Remote-I/O-Fehler'
  } else if (error.name === 'Error' && error.message.includes('EDQUOT')) {
    statusCode = 500
    message = 'Festplattenkontingent überschritten'
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Interner Serverfehler'
    details = null
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  })
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`Route ${req.originalUrl} nicht gefunden`, 404)
  next(error)
}

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}