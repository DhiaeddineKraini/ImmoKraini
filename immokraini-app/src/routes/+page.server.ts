// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/prisma'; // Make sure prisma client is imported
import { fail } from '@sveltejs/kit'; // <<< Import fail
import { Resend } from 'resend'; // <<< Import Resend
import { RESEND_API_KEY } from '$env/static/private'; // <<< Import Resend Key


// --- Initialize Resend --- (Copied from contact/+page.server.ts)
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
if (!resend && process.env.NODE_ENV !== 'test') { 
    console.warn("RESEND_API_KEY not found - Homepage contact form email sending disabled.");
}



export const load: PageServerLoad = async () => {
    console.log('--- HOMEPAGE LOAD FUNCTION RUNNING ---'); 
    try {
        // Use Promise.all to fetch properties and agents concurrently
        const [propertiesResult, agentsResult] = await Promise.all([
            // Fetch Featured Properties (existing query)
            prisma.property.findMany({
                where: { isFeatured: true },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    address: true,
                    price: true,
                    beds: true,
                    baths: true,
                    area: true,
                    imageUrl: true,
                    propertyType: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 4,
            }),
            // Fetch Agents
            prisma.agent.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    imageUrl: true,
                    // Add 'title' field here if you add it to the Agent model in schema.prisma
                },
                orderBy: { name: 'asc' },
                // Optionally limit the number: take: 3
            }),
        ]);

        console.log(`--- Found ${propertiesResult.length} featured properties in DB ---`);
        console.log(`--- Found ${agentsResult.length} agents in DB ---`);

        // Process properties
        const featuredProperties = propertiesResult.map((prop) => ({
            ...prop,
            beds: prop.beds ?? null,
            baths: prop.baths ?? null,
            area: prop.area ?? null,
            imageUrl: prop.imageUrl ?? null,
            propertyType: prop.propertyType ?? null,
        }));

        // Process agents
        const agents = agentsResult.map((agent) => ({
            ...agent,
            phone: agent.phone ?? null,
            imageUrl: agent.imageUrl ?? null,
            // title: agent.title ?? 'Agent' // Uncomment if title field exists
        }));

        console.log('--- HOMEPAGE LOAD FUNCTION SUCCESS ---');
        return {
            featuredProperties,
            agents,
        };
    } catch (err) {
        console.error('--- HOMEPAGE LOAD ERROR ---:', err);
        return {
            featuredProperties: [],
            agents: [],
            error: 'Could not load page data.',
        };
    }
};



// --- ACTIONS OBJECT (NEW - for Homepage Contact Form) ---
export const actions: Actions = {
    // Using 'default' action because it's the primary form in this section
    default: async ({ request }) => { 
      if (!resend) {
          return fail(500, { contactError: 'Email service is not configured.' }); // Use specific error key
      }
  
      const formData = await request.formData();
      
      const name = formData.get('contact-name') as string;
      const email = formData.get('contact-email') as string;
      const subject = formData.get('contact-subject') as string | null; 
      const message = formData.get('contact-message') as string;
  
      // --- Server-side Validation ---
      if (!name || !email || !message) {
        return fail(400, { contactError: 'Missing required fields (Name, Email, Message).', name, email, subject, message });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return fail(400, { contactError: 'Please provide a valid email address.', name, email, subject, message });
      }
      // --- End Validation ---
  
      // --- Send Email using Resend ---
      try {
          console.log(`Attempting to send homepage contact email from: ${name}`);
          const emailSubject = subject ? `Homepage Contact: ${subject}` : 'New Homepage Contact Submission';
  
          const { data, error: sendError } = await resend.emails.send({
              from: 'ImmoKraini Contact <onboarding@resend.dev>', // UPDATE
              to: ['dhiadoudo@gmail.com'], // UPDATE
              subject: emailSubject,
              html: `
                  <h2>New Homepage Contact Submission</h2>
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
              return fail(500, { contactError: 'Failed to send message. Please try again later.', name, email, subject, message });
          }
  
          console.log(`Homepage contact email sent successfully! ID: ${data?.id}`);
          return { contactSuccess: true }; // Return different success flag
  
      } catch (err) {
          console.error("Error processing homepage contact form:", err);
          return fail(500, { contactError: 'There was a problem submitting your message.', name, email, subject, message });
      }
      // --- End Email Sending ---
    }
  };