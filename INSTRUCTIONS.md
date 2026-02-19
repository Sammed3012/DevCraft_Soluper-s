
# OpenConnect Frontend - Setup Instructions

This is the new Next.js frontend for OpenConnect.

## 1. Environment Setup

The `.env.local` file has been created in `frontend/` with your Supabase credentials. Ensure these are correct.

## 2. Database Schema Update

The new frontend requires updates to your database schema to support social links and demo videos.

1. Go to your Supabase Dashboard -> SQL Editor.
2. Run the contents of the `update_schema.sql` file located in the root directory: `c:\Users\Sammed2005\Desktop\OpenConnect\update_schema.sql`.

This will:
- Add `github_url`, `linkedin_url`, `twitter_url`, `website_url` columns to the `profiles` table.
- Create a `demos` table for the Watch Demos page.

## 3. Running the Frontend

To run the development server:

```bash
cd frontend
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## 4. Features Implemented

- **Authentication**: Login and Signup with Supabase Auth.
- **Dashboard**: Overview of your projects and activity.
- **Profile**: View and edit your profile, including bio and social links.
- **Skills**: Manage your skills with a dedicated dashboard.
- **Watch Demos**: Browse community demos with search functionality.
- **Create Idea**: Submit new project ideas.
- **Responsive Design**: Mobile-friendly layout with persistent header and footer.

## 5. Deployment

To deploy to Vercel or similar platforms, ensure you set the environment variables in your deployment settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
