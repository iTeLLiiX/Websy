import { Request, Response, NextFunction } from 'express'
import { CustomError } from './errorHandler'

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`Route ${req.originalUrl} nicht gefunden`, 404)
  next(error)
}

export default notFound