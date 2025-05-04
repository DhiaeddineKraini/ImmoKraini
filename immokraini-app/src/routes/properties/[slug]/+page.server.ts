// src/routes/properties/[slug]/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import prisma from '$lib/server/prisma';

// --- Initialize Resend -------------------------------------------------------
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
if (!resend && process.env.NODE_ENV !== 'test') {
	console.warn(
		'WARN: RESEND_API_KEY not found in .env – Email sending via Resend will be disabled.'
	);
}
// -----------------------------------------------------------------------------



// --- LOAD FUNCTION -----------------------------------------------------------
export const load: PageServerLoad = async ({ params }) => {
	const propertySlug = params.slug;
	console.log(`--- Loading property details for slug: ${propertySlug} ---`);

	try {
		const propertyFromDb = await prisma.property.findUniqueOrThrow({
			where: { slug: propertySlug },
			include: { agent: true }
		});
		console.log(`--- Found property ID: ${propertyFromDb.id} ---`);

		// NOTE: galleryImages & features are now stored as arrays in the DB,
		// so we no longer need JSON.parse – just fall back to [] if null.
		const property = {
			...propertyFromDb,
			galleryImages: propertyFromDb.galleryImages ?? [],
			features: propertyFromDb.features ?? [],
			beds: propertyFromDb.beds ?? null,
			baths: propertyFromDb.baths ?? null,
			area: propertyFromDb.area ?? null,
			description: propertyFromDb.description ?? null,
			propertyType: propertyFromDb.propertyType ?? null,
			yearBuilt: propertyFromDb.yearBuilt ?? null,
			imageUrl: propertyFromDb.imageUrl ?? '/placeholder-property.jpg',
			videoUrl: propertyFromDb.videoUrl ?? null,
			latitude: propertyFromDb.latitude ?? null,
			longitude: propertyFromDb.longitude ?? null,
			agentId: propertyFromDb.agentId ?? null
		};
		console.log('--- Property data processed ---');

		return { property };
	} catch (err: any) {
		console.error(`Error fetching property with slug ${propertySlug}:`, err);

		if (err.code === 'P2025') {
			throw error(404, { message: 'Property not found' });
		}
		throw error(500, {
			message: 'Failed to load property details due to a server error.'
		});
	}
};
// -----------------------------------------------------------------------------



// --- ACTIONS OBJECT ----------------------------------------------------------
export const actions: Actions = {
	inquire: async ({ request, params }) => {
		if (!resend) {
			console.error(
				'Inquiry failed: Resend client is not initialized. Check RESEND_API_KEY.'
			);
			return fail(500, {
				error: 'Email service is currently unavailable. Please try again later.'
			});
		}

		const formData = await request.formData();
		const name = formData.get('inquiry-name') as string;
		const email = formData.get('inquiry-email') as string;
		const phone = formData.get('inquiry-phone') as string | null;
		const message = formData.get('inquiry-message') as string;
		const propertyTitle = formData.get('propertyTitle') as string;
		const propertySlug = params.slug;

		// --- Validation -----------------------------------------------------
		let errors: Record<string, string> = {};
		if (!name) errors.name = 'Name is required.';
		if (!email) errors.email = 'Email is required.';
		if (!message) errors.message = 'Message is required.';
		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please provide a valid email address.';
		}
		if (Object.keys(errors).length) {
			return fail(400, {
				error: 'Please correct the errors in the form.',
				errors,
				name,
				email,
				phone,
				message
			});
		}
		// ---------------------------------------------------------------------

		// --- Send email via Resend ------------------------------------------
		try {
			console.log(`Attempting to send inquiry email via Resend for: ${propertyTitle}`);

			const senderEmail = 'ImmoKraini Inquiry <onboarding@resend.dev>'; // TODO: replace with verified domain
			const recipientEmails = ['dhiadoudo@gmail.com']; // TODO: update recipients

			const { data, error: sendError } = await resend.emails.send({
				from: senderEmail,
				to: recipientEmails,
				subject: `New Inquiry: ${propertyTitle}`,
				html: `
					<html>
						<head>
							<style>
								body { font-family: sans-serif; line-height: 1.6; color: #333; }
								h2 { color: #005a9c; }
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
								<strong>Link:</strong>
								<a href="/properties/${propertySlug}">/properties/${propertySlug}</a>
							</p>
							<hr />
							<p><strong>Name:</strong> ${name}</p>
							<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
							<p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
							<hr />
							<p><strong>Message:</strong></p>
							<p>${message.replace(/\n/g, '<br>')}</p>
							<hr />
							<p class="footer">
								This email was sent from the inquiry form on the ImmoKraini website.
							</p>
						</body>
					</html>
				`,
				replyTo: email
			});

			if (sendError) {
				console.error('Resend API Error:', sendError);
				return fail(500, {
					error:
						'Failed to send inquiry email due to a provider issue. Please try again later.',
					name,
					email,
					phone,
					message
				});
			}

			console.log(`Inquiry email sent successfully! Resend ID: ${data?.id}`);
			return { success: true, submittedName: name };
		} catch (err) {
			console.error('Error processing inquiry or sending email:', err);
			return fail(500, {
				error:
					'An unexpected server error occurred while submitting your inquiry. Please try again later.',
				name,
				email,
				phone,
				message
			});
		}
		// ---------------------------------------------------------------------
	}
};
// -----------------------------------------------------------------------------
