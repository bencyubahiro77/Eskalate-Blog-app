import { Queue, Worker, Job } from 'bullmq';
import prisma from '../config/prisma';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

export const analyticsQueue = new Queue('analytics', {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
});

export const analyticsWorker = new Worker(
    'analytics',
    async (job: Job) => {
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);

        const tomorrowOfYesterday = new Date(yesterday);
        tomorrowOfYesterday.setUTCDate(tomorrowOfYesterday.getUTCDate() + 1);

        const logs = await prisma.readLog.findMany({
            where: {
                readAt: {
                    gte: yesterday,
                    lt: tomorrowOfYesterday,
                },
            },
        });

        const aggregations: Record<string, number> = {};
        logs.forEach((log: any) => {
            aggregations[log.articleId] = (aggregations[log.articleId] || 0) + 1;
        });

        for (const [articleId, count] of Object.entries(aggregations)) {
            await prisma.dailyAnalytics.upsert({
                where: {
                    articleId_date: {
                        articleId,
                        date: yesterday,
                    },
                },
                update: {
                    viewCount: count,
                },
                create: {
                    articleId,
                    date: yesterday,
                    viewCount: count,
                },
            });
        }

        console.log(`Analytics job ${job.id} completed.`);
    },
    {
        connection: {
            host: REDIS_HOST,
            port: REDIS_PORT,
        },
    }
);
