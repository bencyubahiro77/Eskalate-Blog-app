import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import prisma from '../src/config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

jest.mock('../src/config/prisma');

const authorToken = jwt.sign({ sub: 'author-1', role: 'author' }, JWT_SECRET, { expiresIn: '1h' });
const readerToken = jwt.sign({ sub: 'reader-1', role: 'reader' }, JWT_SECRET, { expiresIn: '1h' });

const fakeArticle = {
    id: 'article-1',
    title: 'Test Article',
    content: 'A'.repeat(50),
    category: 'Tech',
    status: 'Draft',
    authorId: 'author-1',
    createdAt: new Date(),
    deletedAt: null,
};

describe('Articles — POST /articles', () => {
    it('201: author creates article', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'author-1', role: 'author' });
        (prisma.article.create as jest.Mock).mockResolvedValueOnce(fakeArticle);

        const res = await request(app)
            .post('/articles')
            .set('Authorization', `Bearer ${authorToken}`)
            .send({ title: 'Test Article', content: 'A'.repeat(50), category: 'Tech' });

        expect(res.status).toBe(201);
        expect(res.body.Success).toBe(true);
        expect(res.body.Object.title).toBe('Test Article');
    });

    it('401: rejects unauthenticated request', async () => {
        const res = await request(app)
            .post('/articles')
            .send({ title: 'Test Article', content: 'A'.repeat(50), category: 'Tech' });
        expect(res.status).toBe(401);
    });

    it('403: rejects reader trying to create article', async () => {
        const res = await request(app)
            .post('/articles')
            .set('Authorization', `Bearer ${readerToken}`)
            .send({ title: 'Test Article', content: 'A'.repeat(50), category: 'Tech' });
        expect(res.status).toBe(403);
    });

    it('400: rejects title over 150 characters', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'author-1', role: 'author' });

        const res = await request(app)
            .post('/articles')
            .set('Authorization', `Bearer ${authorToken}`)
            .send({ title: 'A'.repeat(151), content: 'A'.repeat(50), category: 'Tech' });

        expect(res.status).toBe(400);
        expect(res.body.Success).toBe(false);
    });

    it('400: rejects content under 50 characters', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'author-1', role: 'author' });

        const res = await request(app)
            .post('/articles')
            .set('Authorization', `Bearer ${authorToken}`)
            .send({ title: 'Short Content', content: 'Too short', category: 'Tech' });

        expect(res.status).toBe(400);
        expect(res.body.Success).toBe(false);
    });
});

describe('Articles — GET /articles/me', () => {
    it('200: returns paginated articles for the author', async () => {
        (prisma.article.findMany as jest.Mock).mockResolvedValueOnce([fakeArticle]);
        (prisma.article.count as jest.Mock).mockResolvedValueOnce(1);

        const res = await request(app)
            .get('/articles/me')
            .set('Authorization', `Bearer ${authorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.Success).toBe(true);
        expect(res.body.Object).toHaveLength(1);
        expect(res.body.TotalSize).toBe(1);
    });

    it('401: rejects unauthenticated request', async () => {
        const res = await request(app).get('/articles/me');
        expect(res.status).toBe(401);
    });
});

describe('Articles — PUT /articles/:id', () => {
    it('200: author updates own article', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce(fakeArticle);
        (prisma.article.update as jest.Mock).mockResolvedValueOnce({ ...fakeArticle, title: 'Updated' });

        const res = await request(app)
            .put('/articles/article-1')
            .set('Authorization', `Bearer ${authorToken}`)
            .send({ title: 'Updated' });

        expect(res.status).toBe(200);
        expect(res.body.Object.title).toBe('Updated');
    });

    it('403: rejects update of another author\'s article', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce({ ...fakeArticle, authorId: 'other-author' });

        const res = await request(app)
            .put('/articles/article-1')
            .set('Authorization', `Bearer ${authorToken}`)
            .send({ title: 'Hijack' });

        expect(res.status).toBe(403);
        expect(res.body.Success).toBe(false);
    });

    it('400: cannot edit a soft-deleted article', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce({ ...fakeArticle, deletedAt: new Date() });

        const res = await request(app)
            .put('/articles/article-1')
            .set('Authorization', `Bearer ${authorToken}`)
            .send({ title: 'Edit deleted' });

        expect(res.status).toBe(400);
        expect(res.body.Success).toBe(false);
    });
});

describe('Articles — DELETE /articles/:id', () => {
    it('200: soft-deletes own article', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce(fakeArticle);
        (prisma.article.update as jest.Mock).mockResolvedValueOnce({ ...fakeArticle, deletedAt: new Date() });

        const res = await request(app)
            .delete('/articles/article-1')
            .set('Authorization', `Bearer ${authorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.Success).toBe(true);
        expect(res.body.Message).toBe('Article deleted successfully');
    });

    it('403: rejects deletion of another author\'s article', async () => {
        (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce({ ...fakeArticle, authorId: 'other-author' });

        const res = await request(app)
            .delete('/articles/article-1')
            .set('Authorization', `Bearer ${authorToken}`);

        expect(res.status).toBe(403);
        expect(res.body.Success).toBe(false);
    });
});
