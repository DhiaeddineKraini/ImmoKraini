// src/lib/server/prisma.ts
import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '$env/static/private'; 

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

// For Vercel Serverless Functions connecting to Neon, 
// using the pooled connection string is still recommended.
// Add ?pgbouncer=true if not already present in your Neon URL.
// Prisma's default pooling might suffice, but pgbouncer is often better for serverless.
const connectionString = DATABASE_URL.includes('pgbouncer=true') 
                         ? DATABASE_URL 
                         : `${DATABASE_URL}?pgbouncer=true&connection_limit=1`; 
                         // Or simply use DATABASE_URL if Neon provides pgbouncer by default

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: connectionString, // Use potentially modified URL
        }
    }
});

console.log('Prisma Client initialized for Vercel (PostgreSQL/Neon).'); 

export default prisma; 