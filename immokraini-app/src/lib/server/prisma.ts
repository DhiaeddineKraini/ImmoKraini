// src/lib/server/prisma.ts
import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '$env/static/private'; // Import the URL

// Ensure required variables are present
if (!DATABASE_URL) {
    // Throw an error during initialization if the URL is missing
    // This prevents the server from starting in an invalid state
    throw new Error("DATABASE_URL environment variable is not set. Cannot initialize Prisma Client.");
}

// Standard Prisma Client initialization
// It automatically reads the DATABASE_URL from the environment via $env/static/private
const prisma = new PrismaClient();

console.log('Prisma Client initialized for local PostgreSQL.'); 

export default prisma; 