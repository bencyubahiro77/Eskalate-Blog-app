"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleSchema = exports.loginSchema = exports.signupSchema = exports.RoleEnum = void 0;
const zod_1 = require("zod");
exports.RoleEnum = zod_1.z.enum(['author', 'reader']);
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Name is required')
        .regex(/^[a-zA-Z\s]+$/, 'Name must contain only alphabets and spaces'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    role: exports.RoleEnum,
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.articleSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(150, 'Title must be 150 characters or less'),
    content: zod_1.z.string().min(50, 'Content must be at least 50 characters'),
    category: zod_1.z.string().min(1, 'Category is required'),
    status: zod_1.z.enum(['Draft', 'Published']).optional().default('Draft'),
});
