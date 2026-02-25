import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import argon2 from 'argon2';


jest.mock('../src/config/prisma');
jest.mock('argon2', () => ({
    __esModule: true,
    default: { hash: jest.fn(), verify: jest.fn() },
}));


beforeEach(() => {
    (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');
});

describe('Auth — POST /auth/signup', () => {
    it('201: creates a new user', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
        (prisma.user.create as jest.Mock).mockResolvedValueOnce({
            id: 'user-1', name: 'Alice Smith', email: 'alice@example.com', role: 'author',
        });

        const res = await request(app).post('/auth/signup').send({
            name: 'Alice Smith',
            email: 'alice@example.com',
            password: 'Str0ng!pass',
            role: 'author',
        });

        expect(res.status).toBe(201);
        expect(res.body.Success).toBe(true);
        expect(res.body.Object).toMatchObject({ email: 'alice@example.com', role: 'author' });
    });

    it('409: rejects duplicate email', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing' });

        const res = await request(app).post('/auth/signup').send({
            name: 'Bob Jones',
            email: 'existing@example.com',
            password: 'Str0ng!pass',
            role: 'reader',
        });

        expect(res.status).toBe(409);
        expect(res.body.Success).toBe(false);
        expect(res.body.Errors).toContain('Email already in use');
    });

    it('400: rejects weak password', async () => {
        const res = await request(app).post('/auth/signup').send({
            name: 'Charlie Brown', email: 'charlie@example.com', password: 'weakpass', role: 'reader',
        });
        expect(res.status).toBe(400);
        expect(res.body.Success).toBe(false);
    });

    it('400: rejects invalid role', async () => {
        const res = await request(app).post('/auth/signup').send({
            name: 'Dave Lee', email: 'dave@example.com', password: 'Str0ng!pass', role: 'admin',
        });
        expect(res.status).toBe(400);
        expect(res.body.Success).toBe(false);
    });

    it('400: rejects name with digits', async () => {
        const res = await request(app).post('/auth/signup').send({
            name: 'Eve123', email: 'eve@example.com', password: 'Str0ng!pass', role: 'reader',
        });
        expect(res.status).toBe(400);
        expect(res.body.Success).toBe(false);
    });
});

describe('Auth — POST /auth/login', () => {
    it('200: returns JWT on valid credentials', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
            id: 'user-1', name: 'Alice Smith', email: 'alice@example.com', password: 'hashed', role: 'author',
        });
        (argon2.verify as jest.Mock).mockResolvedValueOnce(true);

        const res = await request(app).post('/auth/login').send({
            email: 'alice@example.com', password: 'Str0ng!pass',
        });

        expect(res.status).toBe(200);
        expect(res.body.Success).toBe(true);
        expect(res.body.Object.token).toBeDefined();
        expect(res.body.Object.user.role).toBe('author');
    });

    it('401: rejects wrong password', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
            id: 'user-1', password: 'hashed', role: 'author',
        });
        (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

        const res = await request(app).post('/auth/login').send({
            email: 'alice@example.com', password: 'WrongPass1!',
        });

        expect(res.status).toBe(401);
        expect(res.body.Success).toBe(false);
    });

    it('401: rejects unknown email', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

        const res = await request(app).post('/auth/login').send({
            email: 'ghost@example.com', password: 'Str0ng!pass',
        });

        expect(res.status).toBe(401);
        expect(res.body.Success).toBe(false);
    });
});
