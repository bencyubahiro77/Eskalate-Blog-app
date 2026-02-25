import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import prisma from '../src/config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

jest.mock('../src/config/prisma');

const authorToken = jwt.sign({ sub: 'author-1', role: 'author' }, JWT_SECRET, { expiresIn: '1h' });
const readerToken = jwt.sign({ sub: 'reader-1', role: 'reader' }, JWT_SECRET, { expiresIn: '1h' });

const dashboardArticle = {
    id: 'article-1',
    title: 'My Great Post',
    createdAt: new Date('2024-01-01'),
    dailyAnalytics: [{ viewCount: 120 }, { viewCount: 80 }],
};

describe('Author Dashboard — GET /author/dashboard', () => {
    it('200: returns paginated dashboard with TotalViews', async () => {
        (prisma.article.findMany as jest.Mock).mockResolvedValueOnce([dashboardArticle]);
        (prisma.article.count as jest.Mock).mockResolvedValueOnce(1);

        const res = await request(app)
            .get('/author/dashboard')
            .set('Authorization', `Bearer ${authorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.Success).toBe(true);
        expect(res.body.Object).toHaveLength(1);
        expect(res.body.Object[0].Title).toBe('My Great Post');
        expect(res.body.Object[0].TotalViews).toBe(200); // 120 + 80
        expect(res.body.TotalSize).toBe(1);
    });

    it('200: returns empty list when author has no articles', async () => {
        (prisma.article.findMany as jest.Mock).mockResolvedValueOnce([]);
        (prisma.article.count as jest.Mock).mockResolvedValueOnce(0);

        const res = await request(app)
            .get('/author/dashboard')
            .set('Authorization', `Bearer ${authorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.Object).toHaveLength(0);
        expect(res.body.TotalSize).toBe(0);
    });

    it('200: respects pagination parameters', async () => {
        (prisma.article.findMany as jest.Mock).mockResolvedValueOnce([dashboardArticle]);
        (prisma.article.count as jest.Mock).mockResolvedValueOnce(50);

        const res = await request(app)
            .get('/author/dashboard?page=3&size=5')
            .set('Authorization', `Bearer ${authorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.PageNumber).toBe(3);
        expect(res.body.PageSize).toBe(5);
        expect(res.body.TotalSize).toBe(50);
    });

    it('401: rejects unauthenticated request', async () => {
        const res = await request(app).get('/author/dashboard');
        expect(res.status).toBe(401);
        expect(res.body.Success).toBe(false);
    });

    it('403: rejects reader accessing author dashboard', async () => {
        const res = await request(app)
            .get('/author/dashboard')
            .set('Authorization', `Bearer ${readerToken}`);

        expect(res.status).toBe(403);
        expect(res.body.Success).toBe(false);
    });
});
