"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class AuthorService {
    static async getDashboard(authorId, page = 1, size = 10) {
        const skip = (page - 1) * size;
        const where = {
            authorId,
            deletedAt: null,
        };
        const [articles, total] = await Promise.all([
            prisma_1.default.article.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    dailyAnalytics: {
                        select: {
                            viewCount: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: size,
            }),
            prisma_1.default.article.count({ where }),
        ]);
        const dashboardData = articles.map((article) => ({
            Title: article.title,
            CreatedAt: article.createdAt,
            TotalViews: article.dailyAnalytics.reduce((sum, ad) => sum + ad.viewCount, 0),
        }));
        return { data: dashboardData, total };
    }
}
exports.AuthorService = AuthorService;
