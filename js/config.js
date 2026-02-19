// Supabase Configuration
// REPLACE THESE WITH YOUR OWN SUPABASE CREDENTIALS

const SUPABASE_URL = 'https://bjhzznxrhpomtkdaxzkq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaHp6bnhyaHBvbXRrZGF4emtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODYxMzEsImV4cCI6MjA4Njk2MjEzMX0.wIeYGMl60FQumik_1unEYVf4JLurhkQDZr5H2KCGgqM';

// Initialize the client
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expose the client globally as 'supabase', overwriting the library object
// This ensures that 'supabase.auth', 'supabase.from', etc. work in all other scripts
window.supabase = client;

console.log('Supabase Initialized Global');
