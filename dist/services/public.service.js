"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
class PublicService {
    static async getArticles(query) {
        const { category, author, q, page = 1, size = 10 } = query;
        const skip = (page - 1) * size;
        const where = {
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
            prisma_1.default.article.findMany({
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
            prisma_1.default.article.count({ where }),
        ]);
        return { articles, total };
    }
    static async getArticleById(id, readerId) {
        const article = await prisma_1.default.article.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, name: true }
                }
            }
        });
        if (!article || article.deletedAt) {
            throw new error_middleware_1.AppError('News article no longer available', 404);
        }
        if (article.status !== 'Published') {
            throw new error_middleware_1.AppError('Article not available', 403);
        }
        // Capture read log asynchronously (don't block the response)
        this.trackRead(id, readerId).catch(err => console.error('Read tracking failed:', err));
        return article;
    }
    static async trackRead(articleId, readerId) {
        // Bonus: Prevent refresh spamming by checking if a read exists in the last hour
        const oneHourAgo = new Date();
        oneHourAgo.setUTCHours(oneHourAgo.getUTCHours() - 1);
        const existingRead = await prisma_1.default.readLog.findFirst({
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
        await prisma_1.default.readLog.create({
            data: {
                articleId,
                readerId: readerId || null,
            },
        });
    }
}
exports.PublicService = PublicService;
