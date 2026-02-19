// Authentication Logic

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Handle Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('btn-login');

        toggleLoading('btn-login', true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showToast('Login successful! Redirecting...', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } catch (error) {
            showToast(error.message, 'error');
            console.error('Login Error:', error);
        } finally {
            toggleLoading('btn-login', false);
        }
    });
}

// Handle Signup
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const btn = document.getElementById('btn-signup');

        toggleLoading('btn-signup', true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email, password,
                options: { data: { full_name: name, avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` } }
            });
            if (error) throw error;
            showToast('Account created! Please check your email.', 'success');
            setTimeout(() => { switchTab('login'); }, 2000);
        } catch (error) {
            showToast(error.message, 'error');
            console.error('Signup Error:', error);
        } finally {
            toggleLoading('btn-signup', false);
        }
    });
}

// Global Logout
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'auth.html';
    } catch (error) {
        showToast('Error logging out', 'error');
        console.error(error);
    }
}

// Session Check & Navbar Profile Load
document.addEventListener('DOMContentLoaded', async () => {
    // If we are on auth.html, don't do these checks
    if (window.location.pathname.includes('auth.html')) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) window.location.href = 'index.html';
        return;
    }

    // For other pages, check auth
    // Note: index.html is public, but if logged in, it redirects (handled in index.html script)
    // For protected pages:
    const protectedPages = ['dashboard.html', 'create-idea.html', 'profile.html', 'communities.html'];
    const isProtected = protectedPages.some(p => window.location.pathname.includes(p));

    const { data: { session } } = await supabase.auth.getSession();

    if (isProtected && !session) {
        window.location.href = 'auth.html';
        return;
    }

    if (session) {
        loadNavProfile(session.user.id);
    }
});

async function loadNavProfile(userId) {
    const navAvatar = document.getElementById('nav-avatar');
    if (!navAvatar) return;

    try {
        const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
        if (profile?.avatar_url) {
            navAvatar.src = profile.avatar_url;
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.avatar_url) navAvatar.src = user.user_metadata.avatar_url;
        }
    } catch (e) {
        console.error('Error loading nav profile', e);
    }
}
// Global Auth Helper
window.getCurrentUser = async function () {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
};
