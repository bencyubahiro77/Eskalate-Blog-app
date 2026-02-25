"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.optionalAuthenticate = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_middleware_1 = require("./error.middleware");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new error_middleware_1.AppError('Authentication required', 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        throw new error_middleware_1.AppError('Invalid or expired token', 401);
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.sub,
                role: decoded.role,
            };
        }
        catch (error) {
            // Ignore if guest
        }
    }
    next();
};
exports.optionalAuthenticate = optionalAuthenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new error_middleware_1.AppError('Forbidden: Access denied', 403);
        }
        next();
    };
};
exports.authorize = authorize;
