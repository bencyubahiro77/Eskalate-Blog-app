"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const validation_1 = require("../utils/validation");
class ArticleService {
    static async create(authorId, data) {
        const validatedData = validation_1.articleSchema.parse(data);
        // Check if user is author (RBAC middleware should handle this, but extra check)
        const author = await prisma_1.default.user.findUnique({ where: { id: authorId } });
        if (!author || author.role !== 'author') {
            throw new error_middleware_1.AppError('Only authors can create articles', 403);
        }
        return await prisma_1.default.article.create({
            data: {
                ...validatedData,
                authorId,
            },
        });
    }
    static async update(articleId, authorId, data) {
        const validatedData = validation_1.articleSchema.partial().parse(data);
        const article = await prisma_1.default.article.findUnique({
            where: { id: articleId },
        });
        if (!article) {
            throw new error_middleware_1.AppError('Article not found', 404);
        }
        if (article.authorId !== authorId) {
            throw new error_middleware_1.AppError('Forbidden: You can only edit your own work', 403);
        }
        if (article.deletedAt) {
            throw new error_middleware_1.AppError('Cannot edit a deleted article', 400);
        }
        return await prisma_1.default.article.update({
            where: { id: articleId },
            data: validatedData,
        });
    }
    static async softDelete(articleId, authorId) {
        const article = await prisma_1.default.article.findUnique({
            where: { id: articleId },
        });
        if (!article) {
            throw new error_middleware_1.AppError('Article not found', 404);
        }
        if (article.authorId !== authorId) {
            throw new error_middleware_1.AppError('Forbidden: You can only delete your own work', 403);
        }
        return await prisma_1.default.article.update({
            where: { id: articleId },
            data: { deletedAt: new Date() },
        });
    }
    static async getMyArticles(authorId, page = 1, size = 10) {
        const skip = (page - 1) * size;
        const [articles, total] = await Promise.all([
            prisma_1.default.article.findMany({
                where: { authorId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: size,
            }),
            prisma_1.default.article.count({ where: { authorId } }),
        ]);
        return { articles, total };
    }
}
exports.ArticleService = ArticleService;
