import prisma from '../config/prisma';

export class AuthorService {
    static async getDashboard(authorId: string, page: number = 1, size: number = 10) {
        const skip = (page - 1) * size;

        const where = {
            authorId,
            deletedAt: null,
        };

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
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
            prisma.article.count({ where }),
        ]);

        const dashboardData = articles.map((article: any) => ({
            Title: article.title,
            CreatedAt: article.createdAt,
            TotalViews: article.dailyAnalytics.reduce((sum: number, ad: any) => sum + ad.viewCount, 0),
        }));

        return { data: dashboardData, total };
    }
}
