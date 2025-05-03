import { fail } from '@sveltejs/kit'; 
import type { Actions } from './$types'; 
import { Resend } from 'resend'; 
import { RESEND_API_KEY } from '$env/static/private'; 

// --- Initialize Resend ---
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
if (!resend && process.env.NODE_ENV !== 'test') { 
    console.warn("RESEND_API_KEY not found - Contact form email sending disabled.");
}

// --- ACTIONS OBJECT ---
export const actions: Actions = {
  // Using 'default' action since there's only one form on the page
  default: async ({ request }) => { 
    if (!resend) {
        return fail(500, { error: 'Email service is not configured.' });
    }

    const formData = await request.formData();
    
    const name = formData.get('contact-name') as string;
    const email = formData.get('contact-email') as string;
    const subject = formData.get('contact-subject') as string | null; // Subject might be optional
    const message = formData.get('contact-message') as string;

    // --- Server-side Validation ---
    if (!name || !email || !message) {
      return fail(400, { error: 'Missing required fields (Name, Email, Message).', name, email, subject, message });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return fail(400, { error: 'Please provide a valid email address.', name, email, subject, message });
    }
    // --- End Validation ---

    // --- Send Email using Resend ---
    try {
        console.log(`Attempting to send general contact email from: ${name}`);

        const emailSubject = subject ? `Contact Form: ${subject}` : 'New Contact Form Submission';

        const { data, error: sendError } = await resend.emails.send({
            from: 'ImmoKraini Inquiry <onboarding@resend.dev>', // UPDATE THIS
            to: ['dhiadoudo@gmail.com'], // UPDATE THIS
            subject: emailSubject,
            html: `
                <h2>New Contact Form Submission</h2>
                <hr>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
                <hr>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p> 
            `,
            replyTo: email 
        });

        if (sendError) {
            console.error("Resend API Error:", sendError);
            return fail(500, { error: 'Failed to send message. Please try again later.', name, email, subject, message });
        }

        console.log(`Contact email sent successfully! ID: ${data?.id}`);
        return { success: true, messageSent: true }; // Return different success flag if needed

    } catch (err) {
        console.error("Error processing contact form:", err);
        return fail(500, { error: 'There was a problem submitting your message.', name, email, subject, message });
    }
    // --- End Email Sending ---
  }
};