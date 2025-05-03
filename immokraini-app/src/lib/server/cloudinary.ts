// src/lib/server/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { 
    CLOUDINARY_CLOUD_NAME, 
    CLOUDINARY_API_KEY, 
    CLOUDINARY_API_SECRET 
} from '$env/static/private';

// Configure Cloudinary instance
// Check if keys exist to prevent errors during build/import if .env isn't fully loaded yet
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({ 
        cloud_name: CLOUDINARY_CLOUD_NAME, 
        api_key: CLOUDINARY_API_KEY, 
        api_secret: CLOUDINARY_API_SECRET,
        secure: true // Use https
    });
    console.log('Cloudinary configured.');
} else {
    console.warn('Cloudinary credentials missing in .env - Uploads will be disabled.');
}

// Export the configured instance
export default cloudinary;

// Optional: Helper function for uploads
// Takes a file buffer or base64 string and returns the secure URL
export async function uploadImageToCloudinary(fileBuffer: Buffer | string, folder: string = 'immokraini_properties'): Promise<string | null> {
    if (!cloudinary.config().api_key) { // Check if configured
         console.error('Cloudinary not configured, cannot upload.');
         return null;
    }
    try {
        // Use upload_stream for buffers or directly upload base64 strings
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: folder, resource_type: 'image' }, // Specify folder and resource type
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve(result);
                    } else {
                        reject(new Error('Cloudinary upload failed without error object.'));
                    }
                }
            );
            
            if (Buffer.isBuffer(fileBuffer)) {
                uploadStream.end(fileBuffer);
            } else if (typeof fileBuffer === 'string') {
                 // Assuming base64 string if not buffer
                 cloudinary.uploader.upload(fileBuffer, { folder: folder, resource_type: 'image' })
                    .then(resolve)
                    .catch(reject);
            } else {
                reject(new Error('Invalid file data type for upload.'));
            }

        });

        console.log('Cloudinary Upload Result:', result);
        return result.secure_url; // Return the HTTPS URL
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
}