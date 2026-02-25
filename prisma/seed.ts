import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaClient, Role, Status } from '@prisma/client';

const prisma = new PrismaClient();


async function main() {
    console.log('Seed started...');

    const password = await argon2.hash('Password123!');

    // Create an author
    const author = await prisma.user.upsert({
        where: { email: 'author@test.com' },
        update: {},
        create: {
            email: 'author@test.com',
            name: 'Test Author',
            password,
            role: Role.author,
        },
    });

    // Create a reader
    const reader = await prisma.user.upsert({
        where: { email: 'reader@test.com' },
        update: {},
        create: {
            email: 'reader@test.com',
            name: 'Test Reader',
            password,
            role: Role.reader,
        },
    });

    // Create some articles
    const articlesCount = await prisma.article.count();
    if (articlesCount === 0) {
        await prisma.article.createMany({
            data: [
                {
                    title: 'Introduction to News API',
                    content: 'This is the first article on the platform. It explores how the News API works and how engagement is tracked.',
                    category: 'Tech',
                    status: Status.Published,
                    authorId: author.id,
                },
                {
                    title: 'Healthy Living',
                    content: 'A comprehensive guide to healthy living, diet, and exercise. Stay fit and healthy with these tips.',
                    category: 'Health',
                    status: Status.Published,
                    authorId: author.id,
                },
                {
                    title: 'Sports Highlights',
                    content: 'Draft content for sports highlights of the week. Still ongoing and needs more info.',
                    category: 'Sports',
                    status: Status.Draft,
                    authorId: author.id,
                },
            ],
        });
    }

    console.log('Seed finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
