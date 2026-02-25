import prisma from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { articleSchema } from '../utils/validation';

export class ArticleService {
    static async create(authorId: string, data: any) {
        const validatedData = articleSchema.parse(data);

        // Check if user is author (RBAC middleware should handle this, but extra check)
        const author = await prisma.user.findUnique({ where: { id: authorId } });
        if (!author || author.role !== 'author') {
            throw new AppError('Only authors can create articles', 403);
        }

        return await prisma.article.create({
            data: {
                ...validatedData,
                authorId,
            },
        });
    }

    static async update(articleId: string, authorId: string, data: any) {
        const validatedData = articleSchema.partial().parse(data);

        const article = await prisma.article.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            throw new AppError('Article not found', 404);
        }

        if (article.authorId !== authorId) {
            throw new AppError('Forbidden: You can only edit your own work', 403);
        }

        if (article.deletedAt) {
            throw new AppError('Cannot edit a deleted article', 400);
        }

        return await prisma.article.update({
            where: { id: articleId },
            data: validatedData,
        });
    }

    static async softDelete(articleId: string, authorId: string) {
        const article = await prisma.article.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            throw new AppError('Article not found', 404);
        }

        if (article.authorId !== authorId) {
            throw new AppError('Forbidden: You can only delete your own work', 403);
        }

        return await prisma.article.update({
            where: { id: articleId },
            data: { deletedAt: new Date() },
        });
    }

    static async getMyArticles(authorId: string, page: number = 1, size: number = 10) {
        const skip = (page - 1) * size;

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where: { authorId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: size,
            }),
            prisma.article.count({ where: { authorId } }),
        ]);

        return { articles, total };
    }
}
