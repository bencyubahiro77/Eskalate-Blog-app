import prisma from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';

export class PublicService {
    static async getArticles(query: {
        category?: string;
        author?: string;
        q?: string;
        page?: number;
        size?: number;
    }) {
        const { category, author, q, page = 1, size = 10 } = query;
        const skip = (page - 1) * size;

        const where: any = {
            status: 'Published',
            deletedAt: null,
        };

        if (category) {
            where.category = category;
        }

        if (author) {
            where.author = {
                name: { contains: author, mode: 'insensitive' },
            };
        }

        if (q) {
            where.title = { contains: q, mode: 'insensitive' };
        }

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where,
                include: {
                    author: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: size,
            }),
            prisma.article.count({ where }),
        ]);

        return { articles, total };
    }

    static async getArticleById(id: string, readerId?: string) {
        const article = await prisma.article.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, name: true }
                }
            }
        });

        if (!article || article.deletedAt) {
            throw new AppError('News article no longer available', 404);
        }

        // Allow the article's own author to view their drafts; block everyone else
        if (article.status !== 'Published' && article.authorId !== readerId) {
            throw new AppError('Article not available', 403);
        }

        // Capture read log asynchronously (don't block the response)
        this.trackRead(id, readerId).catch(err => console.error('Read tracking failed:', err));

        return article;
    }

    private static async trackRead(articleId: string, readerId?: string) {
        // Bonus: Prevent refresh spamming by checking if a read exists in the last hour
        const oneHourAgo = new Date();
        oneHourAgo.setUTCHours(oneHourAgo.getUTCHours() - 1);

        const existingRead = await prisma.readLog.findFirst({
            where: {
                articleId,
                readerId: readerId || null,
                readAt: {
                    gte: oneHourAgo
                }
            }
        });

        if (existingRead) {
            return; // Skip logging if same user read it recently
        }

        await prisma.readLog.create({
            data: {
                articleId,
                readerId: readerId || null,
            },
        });
    }
}
