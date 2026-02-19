# Backend Upgrade Guide: Production Architecture

This guide outlines the steps to upgrade your backend to a robust, scalable architecture. The changes introduce a new `projects` table, proper foreign keys, automated timestamps, performance indexing, and storage integration.

## 🚀 Upgrade Steps (Summary)

1.  **Run SQL Migrations**: Execute the SQL scripts in `backend/migrations/` in order.
2.  **Setup Storage**: Create buckets as described in `backend/STORAGE.md`.
3.  **Update Frontend (Optional)**: Start using the new `projects` table for future development.

---

## 1. Database Schema Improvements

### A. New `projects` Table
We created a dedicated `projects` table to serve as the production-grade entity for user ideas.
-   **Why separate?** To ensure a clean slate with strict typing and constraints without breaking the existing `ideas` table that your live app depends on.
-   **Data Migration**: We automatically migrated all existing `ideas` into `projects`.

### B. Foreign Key Relationships
-   **Constraint**: `projects.created_by` → `profiles.id`
-   **Behavior**: `ON DELETE CASCADE`. If a user profile is deleted, all their projects are automatically removed to maintain data integrity.

### C. Timestamps (`created_at`, `updated_at`)
-   Added `updated_at` to `profiles` and `projects`.
-   **Automation**: Created a reusable trigger function `handle_updated_at` that automatically updates the timestamp whenever a row is modified. No manual updates needed!

### D. Performance Indexing
We added specific indexes to speed up queries:
1.  **GIN Index on `profiles.skills` & `projects.required_skills`**:
    -   *Why GIN?* Arrays like `['React', 'Node']` are complex data types. A standard B-Tree index cannot efficiently search *inside* an array. GIN (Generalized Inverted Index) creates an index for each *element* within the array, making queries like "Find users who know React" instant, rather than scanning the entire table.
2.  **B-Tree Index on `projects.created_by`**:
    -   Optimizes looking up all projects belonging to a specific user (e.g., on the profile page).

---

## 2. Storage Integration

We prepared the system for file uploads:
-   **Buckets**: `avatars`, `project-images`, `resumes`
-   **Security**: RLS policies ensure users can only modify their own files.
-   **Resume Logic**: Configured to be private/signed-URL access for privacy.

See `STORGE.md` for setup instructions.

---

## 3. How to Apply

Execute the SQL files in your Supabase SQL Editor in this order:

1.  `01_functions.sql` (Sets up the trigger function)
2.  `02_update_profiles.sql` (Updates profiles table & adds skill index)
3.  `03_create_projects.sql` (Creates projects table, migrates data, adds indexes)
4.  `04_add_columns.sql` (Adds resume_url column)
