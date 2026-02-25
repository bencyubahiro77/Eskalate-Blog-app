import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function test() {
    console.log('Testing connection with URL:', process.env.DATABASE_URL);
    try {
        await prisma.$connect();
        console.log('Success! Connected to the database.');
        await prisma.$disconnect();
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

test();
