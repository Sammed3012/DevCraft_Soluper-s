/**
 * SUPABASE STRORAGE INTEGRATION V1.0
 * 
 * Instructions:
 * 1. Include this file in your project or copy snippets into your existing logic.
 * 2. Ensure Supabase JS client is initialized as `supabase`.
 */

export const StorageService = {

    /**
     * Upload a file to a bucket
     * @param {string} bucketName - 'avatars', 'project-images', or 'resumes'
     * @param {File} file - The file object from input element
     * @param {string} userId - Current user ID (for folder structure)
     * @returns {Promise<string|null>} - Returns public URL or file path (for private buckets)
     */
    async uploadFile(bucketName, file, userId) {
        if (!file) return null;

        // Create a unique file path: userId/timestamp_filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        try {
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            console.log(`Uploaded to ${bucketName}:`, data);

            // Return full public URL for public buckets
            if (bucketName !== 'resumes') {
                const { data: { publicUrl } } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(fileName);
                return publicUrl;
            }

            // Return path for private buckets (to generate signed URLs later)
            return data.path;

        } catch (error) {
            console.error('Upload Error:', error.message);
            alert('Upload failed: ' + error.message);
            return null;
        }
    },

    /**
     * Get a signed URL for private files (e.g. resumes)
     * @param {string} path - The stored file path
     * @returns {Promise<string>} - Temporary access URL
     */
    async getResumeUrl(path) {
        if (!path) return '';

        const { data, error } = await supabase.storage
            .from('resumes')
            .createSignedUrl(path, 60 * 60); // Valid for 1 hour

        if (error) {
            console.error('Error getting signed URL:', error);
            return '';
        }
        return data.signedUrl;
    }
};

/**
 * EXAMPLE USAGE: Integrating into Idea/Project Creation Form
 */
/*
document.getElementById('idea-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Get file from input
    const imageFile = document.getElementById('image-upload').files[0];
    const resumeFile = document.getElementById('resume-upload').files[0];
    const userId = getAuthenticatedUser().id; // Your auth logic

    let imageUrl = null;
    let resumePath = null;

    // 2. Upload Image (Public)
    if (imageFile) {
        imageUrl = await StorageService.uploadFile('project-images', imageFile, userId);
    }

    // 3. Upload Resume (Private)
    if (resumeFile) {
        resumePath = await StorageService.uploadFile('resumes', resumeFile, userId);
    }

    // 4. Save to Database (using new `projects` table)
    const { error } = await supabase
        .from('projects')
        .insert({
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            created_by: userId,
            image_url: imageUrl, // Storing the Public URL
            required_skills: getSelectedSkills(), // Helper function
            // resume_url: resumePath // If storing resume path on project (or profile)
        });

    if (error) console.error('DB Error:', error);
    else alert('Project created successfully!');
});
*/
