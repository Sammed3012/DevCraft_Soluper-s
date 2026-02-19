
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

// Legacy export for backward compatibility with existing code
export const supabase = createClient();
