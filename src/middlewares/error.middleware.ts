import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { BaseResponse } from '../interfaces/response.interface';

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 400,
        public errors: string[] | null = null
    ) {
        super(message);
    }
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Handle Zod validation errors — return 400 with field messages
    if (err instanceof ZodError) {
        const issues = err.issues ?? (err as any).errors ?? [];
        const response: BaseResponse = {
            Success: false,
            Message: 'Validation failed',
            Object: null,
            Errors: issues.map((e: { message: string }) => e.message),
        };
        return res.status(400).json(response);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errors = err.errors || (err.message ? [err.message] : null);

    const response: BaseResponse = {
        Success: false,
        Message: message,
        Object: null,
        Errors: errors,
    };

    // Do not leak stack traces in production
    if (process.env.NODE_ENV === 'development' && statusCode === 500) {
        console.error(err);
    }

    res.status(statusCode).json(response);
};
