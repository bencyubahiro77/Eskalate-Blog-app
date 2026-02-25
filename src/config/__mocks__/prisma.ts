// Jest auto-mock for src/config/prisma
// Place adjacent to the real module so Jest resolves it automatically
// when tests call jest.mock('../src/config/prisma') with no factory.

const prisma = {
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    article: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    readLog: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
    },
    dailyAnalytics: {
        upsert: jest.fn(),
    },
};

export default prisma;
