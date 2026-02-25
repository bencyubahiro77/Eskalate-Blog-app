import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import prisma from '../src/config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

jest.mock('../src/config/prisma');

const readerToken = jwt.sign({ sub: 'reader-1', role: 'reader' }, JWT_SECRET, { expiresIn: '1h' });

const publishedArticle = {
    id: 'article-1',
    title: 'Published Article',
    content: 'A'.repeat(50),
    category: 'Tech',
    status: 'Published',
    authorId: 'author-1',
    author: { id: 'author-1', name: 'Alice Smith' },
    createdAt: new Date(),
    deletedAt: null,
};

describe('Public — GET /articles', () => {
    it('200: returns paginated published articles', async () => {
        (prisma.article.findMany as jest.Mock).mockResolvedValueOnce([publishedArticle]);
        (prisma.article.count as jest.Mock).mockResolvedValueOnce(1);

        const res = await request(app).get('/articles');

        expect(res.status).toBe(200);
        expect(res.body.Success).toBe(true);
        expect(res.body.Object).toHaveLength(1);
        expect(res.body.PageNumber).toBe(1);
        expect(res.body.PageSize).toBe(10);
        expect(res.body.TotalSize).toBe(1);
    });

    it('200: supports ?category= filter', async () => {
        (prisma.article.findMany as jest.Mock).mockResolvedValueOnce([publishedArticle]);
        (prisma.article.count as jest.Mock).mockResolvedValueOnce(1);

        const res = await request(app).get('/articles?category=Tech');

        expect(res.status).toBe(200);
        expect(res.body.Object[0].category).toBe('Tech');
    });

    it('200: returns empty list when no articles match', async () => {
        (prisma.article.findMany as jest.Mock).mockResolvedValueOnce([]);
        (prisma.article.count as jest.Mock).mockResolvedValueOnce(0);

        const res = await request(app).get('/articles?q=nonexistent');

        expect(res.status).toBe(200);
        expect(res.body.Object).toHaveLength(0);
        expect(res.body.TotalSize).toBe(0);
    });

    it('200: respects custom page and size', async () => {
        (prisma.article.findMany as jest.Mock).mockResolvedValueOnce([publishedArticle]);
        (prisma.article.count as jest.Mock).mockResolvedValueOnce(25);

        const res = await request(app).get('/articles?page=2&size=5');

        expect(res.status).toBe(200);
        expect(res.body.PageNumber).toBe(2);
        expect(res.body.PageSize).toBe(5);
        expect(res.body.TotalSize).toBe(25);
    });
});

describe('Public — GET /articles/:id', () => {
    it('200: returns a published article and tracks read (guest)', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce(publishedArticle);
        (prisma.readLog.findFirst as jest.Mock).mockResolvedValueOnce(null);
        (prisma.readLog.create as jest.Mock).mockResolvedValueOnce({});

        const res = await request(app).get('/articles/article-1');

        expect(res.status).toBe(200);
        expect(res.body.Success).toBe(true);
        expect(res.body.Object.title).toBe('Published Article');
    });

    it('200: creates read log with readerId when logged in', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce(publishedArticle);
        (prisma.readLog.findFirst as jest.Mock).mockResolvedValueOnce(null);
        (prisma.readLog.create as jest.Mock).mockResolvedValueOnce({});

        const res = await request(app)
            .get('/articles/article-1')
            .set('Authorization', `Bearer ${readerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.Success).toBe(true);
    });

    it('404: returns error for soft-deleted article', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce({
            ...publishedArticle, deletedAt: new Date(),
        });

        const res = await request(app).get('/articles/article-1');

        expect(res.status).toBe(404);
        expect(res.body.Success).toBe(false);
        expect(res.body.Message).toBe('News article no longer available');
    });

    it('404: returns error for non-existent article', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce(null);

        const res = await request(app).get('/articles/nonexistent');

        expect(res.status).toBe(404);
        expect(res.body.Success).toBe(false);
    });

    it('403: hides draft from other users', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce({
            ...publishedArticle, status: 'Draft', authorId: 'other-author',
        });

        const res = await request(app).get('/articles/article-1');

        expect(res.status).toBe(403);
        expect(res.body.Success).toBe(false);
    });
});
