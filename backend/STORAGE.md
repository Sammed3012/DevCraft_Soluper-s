# Supabase Storage Integration Guide

## 1. Bucket Creation

Navigate to your Supabase Dashboard -> Storage -> Create New Bucket.

### Bucket: `avatars`
- **Public**: Enabled (Yes)
- **Allowed MIME types**: `image/*`
- **File size limit**: 2MB (Recommended)

### Bucket: `project-images`
- **Public**: Enabled (Yes)
- **Allowed MIME types**: `image/*`
- **File size limit**: 5MB (Recommended for banners)

### Bucket: `resumes`
- **Public**: Disabled (No) - Keep resumes private for security.
- **Allowed MIME types**: `application/pdf`
- **File size limit**: 5MB

---

## 2. Storage Policies (RLS)

You must enable RLS policies for your buckets to allow uploads. Run these SQL commands in the Supabase SQL Editor:

```sql
-- Allow Public Read for Avatars
create policy "Avatars are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow Authenticated Users to Upload Avatars
create policy "Users can upload avatars."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow Public Read for Project Images
create policy "Project images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'project-images' );

-- Allow Authenticated Users to Upload Project Images
create policy "Users can upload project images."
  on storage.objects for insert
  with check ( bucket_id = 'project-images' and auth.role() = 'authenticated' );

-- Allow Users to Upload Their Own Resume (Private)
create policy "Users can upload their own resume."
  on storage.objects for insert
  with check ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

-- Allow Users to Read Their Own Resume
create policy "Users can read their own resume."
  on storage.objects for select
  using ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );
```

> **Note on Folder Structure**: For resumes, enforce a folder structure like `user_id/resume.pdf` to secure access using policies.

---

## 3. Frontend Integration

See `backend/frontend_integration.js` for copy-paste code snippets.

### Key Concepts:

1.  **Public URLs**: Used for `avatars` and `project-images`. The URL is permanent and accessible by anyone.
2.  **Signed URLs**: Used for `resumes`. The URL expires after a set time (e.g., 60 seconds) and requires authentication to generate.

### Database Updates

We have added columns to store these URLs:

-   `profiles.avatar_url` (Public URL)
-   `profiles.resume_url` (Signed URL Path or just the file path `user_id/filename`)
-   `projects.image_url` (Public URL)
