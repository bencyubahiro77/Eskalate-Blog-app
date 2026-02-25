import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { signupSchema, loginSchema } from '../utils/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class AuthService {
    static async signup(data: any) {
        const validatedData = signupSchema.parse(data);

        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            throw new AppError('Conflict: Email already exists', 409, ['Email already in use']);
        }

        const hashedPassword = await argon2.hash(validatedData.password);

        const user = await prisma.user.create({
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

    static async login(data: any) {
        const validatedData = loginSchema.parse(data);

        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (!user || !(await argon2.verify(user.password, validatedData.password))) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = jwt.sign(
            { sub: user.id, role: user.role },
            JWT_SECRET as string,
            { expiresIn: JWT_EXPIRES_IN as any }
        );

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
