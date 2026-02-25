"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 400, errors = null) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errors = err.errors || (err.message ? [err.message] : null);
    const response = {
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
exports.errorHandler = errorHandler;
