import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: 'author' | 'reader';
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };
        next();
    } catch (error) {
        throw new AppError('Invalid or expired token', 401);
    }
};

export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            req.user = {
                id: decoded.sub,
                role: decoded.role,
            };
        } catch (error) {
            // Ignore if guest
        }
    }
    next();
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError('Forbidden: Access denied', 403);
        }
        next();
    };
};
