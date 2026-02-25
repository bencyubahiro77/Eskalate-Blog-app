"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const validation_1 = require("../utils/validation");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
class AuthService {
    static async signup(data) {
        const validatedData = validation_1.signupSchema.parse(data);
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            throw new error_middleware_1.AppError('Conflict: Email already exists', 409, ['Email already in use']);
        }
        const hashedPassword = await argon2_1.default.hash(validatedData.password);
        const user = await prisma_1.default.user.create({
            data: {
                ...validatedData,
                password: hashedPassword,
            },
        });
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
    static async login(data) {
        const validatedData = validation_1.loginSchema.parse(data);
        const user = await prisma_1.default.user.findUnique({
            where: { email: validatedData.email },
        });
        if (!user || !(await argon2_1.default.verify(user.password, validatedData.password))) {
            throw new error_middleware_1.AppError('Invalid credentials', 401);
        }
        const token = jsonwebtoken_1.default.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
        };
    }
}
exports.AuthService = AuthService;
