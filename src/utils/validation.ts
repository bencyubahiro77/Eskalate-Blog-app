import { z } from 'zod';

export const RoleEnum = z.enum(['author', 'reader']);

export const signupSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .regex(/^[a-zA-Z\s]+$/, 'Name must contain only alphabets and spaces'),
    email: z.string().email('Invalid email format'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    role: RoleEnum,
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const articleSchema = z.object({
    title: z.string().min(1, 'Title is required').max(150, 'Title must be 150 characters or less'),
    content: z.string().min(50, 'Content must be at least 50 characters'),
    category: z.string().min(1, 'Category is required'),
    status: z.enum(['Draft', 'Published']).optional().default('Draft'),
});
