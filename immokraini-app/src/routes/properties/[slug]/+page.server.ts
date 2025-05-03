// src/routes/properties/[slug]/+page.server.ts

import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Resend } from 'resend'; // Import Resend SDK
import { RESEND_API_KEY } from '$env/static/private'; // Import API key securely
import prisma from '$lib/server/prisma'; // Import Prisma client

// --- Initialize Resend ---
// Ensure the API key exists before creating the instance
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
if (!resend && process.env.NODE_ENV !== 'test') { // Avoid warning during tests
	console.warn(
		'WARN: RESEND_API_KEY not found in .env - Email sending via Resend will be disabled.'
	);
}
// --- End Resend Initialization ---

// --- LOAD FUNCTION (Using Prisma) ---
export const load: PageServerLoad = async ({ params }) => {
	const propertySlug = params.slug;

	try {
		// --- Fetch Single Property using Prisma ---
		// findUniqueOrThrow automatically throws error if not found -> SvelteKit 404
		const propertyFromDb = await prisma.property.findUniqueOrThrow({
			where: {
				slug: propertySlug // Find by the unique slug
			},
			include: {
				// Include related agent data
				agent: true // Fetches all fields from the related Agent record
			}
		});

		// --- Parse JSON fields and ensure nulls/defaults ---
		// Process the raw data from DB into the structure expected by the frontend
		const property = {
			...propertyFromDb,
			// Parse JSON strings or provide empty arrays as default
			galleryImages: propertyFromDb.galleryImages ? JSON.parse(propertyFromDb.galleryImages) : [],
			features: propertyFromDb.features ? JSON.parse(propertyFromDb.features) : [],
			// Ensure potentially optional numeric/string fields are null if not set in DB
			beds: propertyFromDb.beds ?? null,
			baths: propertyFromDb.baths ?? null,
			area: propertyFromDb.area ?? null,
			description: propertyFromDb.description ?? null,
			propertyType: propertyFromDb.propertyType ?? null,
			yearBuilt: propertyFromDb.yearBuilt ?? null,
			imageUrl: propertyFromDb.imageUrl ?? '/placeholder-property.jpg', // Provide default image
			videoUrl: propertyFromDb.videoUrl ?? null,
			latitude: propertyFromDb.latitude ?? null, // Assuming lat/lon stored directly
			longitude: propertyFromDb.longitude ?? null,
			agentId: propertyFromDb.agentId ?? null
			// Agent data is now nested under 'agent' key due to 'include'
			// Ensure your frontend component accesses agent info via `property.agent.name` etc.
		};
		// --- End Parse JSON fields ---

		return {
			property: property // Return the processed property object
		};
	} catch (err: any) {
		// Handle potential Prisma errors or other issues
		console.error(`Error fetching property with slug ${propertySlug}:`, err);

		// If Prisma throws specific "RecordNotFound" error (P2025), SvelteKit catches it
		// via findUniqueOrThrow and converts to a 404.
		// Handle other potential errors (e.g., database connection) with a 500.
		if (err.code === 'P2025') {
			// This code block might not be strictly necessary if findUniqueOrThrow is used,
			// but it's good practice to be explicit or handle other specific Prisma errors.
			error(404, { message: 'Property not found' });
		} else {
			// Throw a generic 500 for other database or processing errors
			error(500, { message: 'Failed to load property details due to a server error.' });
		}
	}
};
// --- End LOAD FUNCTION ---

// --- ACTIONS OBJECT (Using Resend for Inquiry) ---
export const actions: Actions = {
	/* POST ?/inquire */
	inquire: async ({ request, params }) => {
		// --- Check if Resend was initialized ---
		if (!resend) {
			console.error('Inquiry failed: Resend client is not initialized. Check RESEND_API_KEY.');
			// Return a user-friendly error, but log the specific reason server-side.
			return fail(500, { error: 'Email service is currently unavailable. Please try again later.' });
		}

		const formData = await request.formData();

		const name = formData.get('inquiry-name') as string;
		const email = formData.get('inquiry-email') as string;
		const phone = formData.get('inquiry-phone') as string | null; // Optional
		const message = formData.get('inquiry-message') as string;
		const propertyTitle = formData.get('propertyTitle') as string; // Sent from hidden input
		const propertySlug = params.slug; // Get slug from route params

		// --- Server-side Validation ---
		let errors: Record<string, string> = {};
		if (!name) errors.name = 'Name is required.';
		if (!email) errors.email = 'Email is required.';
		if (!message) errors.message = 'Message is required.';
		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please provide a valid email address.';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				error: 'Please correct the errors in the form.',
				errors, // Send back specific field errors
				name, // Return submitted values to pre-fill form
				email,
				phone,
				message
			});
		}
		// --- End Validation ---

		// --- Send Email using Resend ---
		try {
			console.log(`Attempting to send inquiry email via Resend for: ${propertyTitle}`);

            // !! IMPORTANT !!
            // Replace 'YOUR_VERIFIED_DOMAIN.com' with a domain you have verified in Resend.
            // Using 'onboarding@resend.dev' works for testing ONLY and has limitations.
			const senderEmail = 'ImmoKraini Inquiry <onboarding@resend.dev>'; // <--- UPDATE REQUIRED
            // !! IMPORTANT !!
            // Replace with the actual email address(es) where inquiries should be sent.
			const recipientEmails = ['dhiadoudo@gmail.com']; // <--- UPDATE REQUIRED (Can be an array)

			const { data, error: sendError } = await resend.emails.send({
				from: senderEmail,
				to: recipientEmails,
				subject: `New Inquiry: ${propertyTitle}`,
				// Use HTML for better formatting
				html: `
          <html>
            <head>
              <style>
                body { font-family: sans-serif; line-height: 1.6; color: #333; }
                h2 { color: #005a9c; } /* Adjust color to match branding */
                p { margin-bottom: 10px; }
                strong { font-weight: bold; }
                hr { border: 0; border-top: 1px solid #eee; margin: 20px 0; }
                a { color: #005a9c; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .property-link { font-size: 0.9em; color: #555; }
                .footer { font-size: 0.9em; color: #777; margin-top: 25px; }
              </style>
            </head>
            <body>
              <h2>New Property Inquiry Received</h2>
              <p><strong>Property:</strong> ${propertyTitle}</p>
              <p class="property-link">
                <strong>Link:</strong> <a href="/properties/${propertySlug}">/properties/${propertySlug}</a> 
                <!-- Replace with your actual base URL if needed: e.g., https://yourdomain.com/properties/... -->
              </p>
              <hr>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <hr>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p class="footer">This email was sent from the inquiry form on the ImmoKraini website.</p>
            </body>
          </html>
        `,
				// Set the Reply-To header to the sender's email for easy replies
				replyTo: email
			});

			// Check for errors returned specifically by the Resend API call
			if (sendError) {
				console.error('Resend API Error:', sendError);
				return fail(500, {
					error: 'Failed to send inquiry email due to a provider issue. Please try again later.',
					name, // Return data to pre-fill form on error
					email,
					phone,
					message
				});
			}

			// --- Return Success ---
			console.log(`Inquiry email sent successfully! Resend ID: ${data?.id}`);
			// Return success and the name for a personalized confirmation message
			return { success: true, submittedName: name };

		} catch (err) {
			// Catch any other unexpected errors during the process
			console.error('Error processing inquiry or sending email:', err);
			// Provide a generic server error message
			return fail(500, {
				error: 'An unexpected server error occurred while submitting your inquiry. Please try again later.',
				name, // Return data to pre-fill form on error
				email,
				phone,
				message
			});
		}
		// --- End Email Sending ---
	}
};
// --- End ACTIONS OBJECT ---