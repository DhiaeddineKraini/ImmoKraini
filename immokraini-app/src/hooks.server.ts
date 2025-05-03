// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '$env/static/private';
import { Buffer } from 'buffer'; // Node.js Buffer for Basic Auth

const username = ADMIN_USERNAME;
const password = ADMIN_PASSWORD;

export const handle: Handle = async ({ event, resolve }) => {
    const { url, request } = event;

    // Apply basic auth only to routes starting with /admin
    if (url.pathname.startsWith('/admin')) {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            // No auth header, request authentication
            return new Response('Not authorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="Admin Area", charset="UTF-8"',
                },
            });
        }

        // Check Basic Auth credentials
        const encodedCreds = authHeader.split(' ')[1];
        if (!encodedCreds) {
             return new Response('Invalid auth header', { status: 401 });
        }
        
        const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8');
        const [user, pass] = decodedCreds.split(':');

        if (user === username && pass === password) {
            // Credentials match, proceed to the requested route
            return resolve(event);
        } else {
            // Credentials don't match
             return new Response('Invalid credentials', { status: 401 });
        }
    }

    // For non-admin routes, proceed normally
    return resolve(event);
};