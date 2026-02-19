# OpenConnect - Hackathon Innovation Platform

## Setup Instructions

### 1. Supabase Setup
1. Create a new project on [Supabase.com](https://supabase.com/).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `schema.sql` and run it to create all tables and policies.
4. Go to **Storage**, create two public buckets: `avatars` and `idea-images`.
5. Configuration:
   - Go to `js/config.js`.
   - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your project credentials (found in Project Settings > API).

### 2. Running Logic
1. This is a purely static site using Supabase as a Backend-as-a-Service.
2. You can open `index.html` directly in your browser.
3. For best results (avoiding CORS issues with ES modules if used later), use a simple local server:
   - VS Code: Right click `index.html` -> **Open with Live Server**.
   - Or run `npx serve .` in the terminal.

### 3. Usage
- **Sign Up**: Create an account with email/password.
- **Profile**: Update your bio and avatar.
- **Ideas**: Post new ideas, upvote others, comment.
- **Realtime**: Open two different browsers/tabs to see upvotes and comments update instantly.

## Tech Stack
- **Frontend**: HTML5, Vanilla CSS, TailwindCSS (CDN), Vanilla JS.
- **Backend**: Supabase (Auth, DB, Realtime, Storage).

Good luck with the Hackathon! 🚀
