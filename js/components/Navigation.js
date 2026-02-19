/**
 * REUSABLE NAVIGATION & LAYOUT COMPONENT
 * 
 * Handles Desktop Sidebar & Mobile Bottom Navigation
 */

export function renderNavigation(activePage = 'home') {
    const isMobile = window.innerWidth < 768; // Simple initial check, styling handled via CSS media queries

    // Inject Styles if needed (minimal)
    // Using Tailwind classes primarily

    // Create container
    const navContainer = document.createElement('div');
    navContainer.id = 'app-navigation';

    // 1. Desktop Sidebar (Hidden on Mobile)
    const sidebarHTML = `
    <aside class="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 z-50 p-6">
        <!-- Logo -->
        <a href="dashboard.html" class="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <ion-icon name="bulb" class="text-white text-lg"></ion-icon>
            </div>
            <span class="font-bold text-xl tracking-tight text-slate-900">OpenConnect</span>
        </a>

        <!-- Menu -->
        <nav class="flex-1 space-y-2">
            ${renderNavItem('Home', 'dashboard.html', 'home-outline', 'home', activePage === 'home')}
            ${renderNavItem('Explore', 'ideas.html', 'compass-outline', 'compass', activePage === 'explore')}
            ${renderNavItem('Communities', 'communities.html', 'people-outline', 'people', activePage === 'communities')}
            ${renderNavItem('Messages', '#', 'chatbubble-ellipses-outline', 'chatbubble-ellipses', activePage === 'messages')}
            ${renderNavItem('Profile', 'profile.html', 'person-outline', 'person', activePage === 'profile')}
        </nav>

        <!-- Create Button -->
        <div class="mt-auto">
            <a href="create-idea.html" class="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <ion-icon name="add-circle-outline" class="text-xl"></ion-icon>
                <span>Create Idea</span>
            </a>
            
            <!-- User Menu -->
            <div class="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors" onclick="logout()">
                <img id="sidebar-avatar" src="https://ui-avatars.com/api/?name=User" class="w-9 h-9 rounded-full border border-slate-200 bg-slate-100" />
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-slate-900 truncate" id="sidebar-user-name">User</p>
                    <p class="text-xs text-slate-500">Log out</p>
                </div>
                <ion-icon name="log-out-outline" class="text-slate-400"></ion-icon>
            </div>
        </div>
    </aside>
    `;

    // 2. Mobile Bottom Nav (Visible on Mobile only)
    const mobileBottomNavHTML = `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-6 py-2 pb-safe flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        ${renderMobileNavItem('dashboard.html', 'home-outline', 'home', activePage === 'home')}
        ${renderMobileNavItem('ideas.html', 'compass-outline', 'compass', activePage === 'explore')}
        
        <!-- Create Button (Center) -->
        <a href="create-idea.html" class="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-xl shadow-lg -mt-6 hover:scale-105 transition-transform">
            <ion-icon name="add" class="text-2xl"></ion-icon>
        </a>

        ${renderMobileNavItem('communities.html', 'people-outline', 'people', activePage === 'communities')}
        ${renderMobileNavItem('profile.html', 'person-outline', 'person', activePage === 'profile')}
    </nav>
    `;

    // 3. Mobile Top Header (Sticky)
    const mobileHeaderHTML = `
    <header class="md:hidden sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 px-4 h-14 flex items-center justify-between">
        <a href="dashboard.html" class="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                <ion-icon name="bulb" class="text-white text-xs"></ion-icon>
            </div>
            OpenConnect
        </a>
        <div class="flex items-center gap-4">
            <button class="relative text-slate-600 hover:text-slate-900 transition-colors">
                <ion-icon name="heart-outline" class="text-2xl"></ion-icon>
                <div class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
            <button class="relative text-slate-600 hover:text-slate-900 transition-colors">
                <ion-icon name="chatbubble-ellipses-outline" class="text-2xl"></ion-icon>
            </button>
        </div>
    </header>
    `;

    navContainer.innerHTML = sidebarHTML + mobileHeaderHTML + mobileBottomNavHTML;
    document.body.prepend(navContainer);

    // Add padding to main content to account for fixed bars
    const main = document.querySelector('main');
    if (main) {
        main.classList.add('md:ml-64', 'pt-4', 'pb-24', 'md:pb-12'); // Adjust spacing
    }
}

function renderNavItem(label, href, iconOutline, iconSolid, isActive) {
    const icon = isActive ? iconSolid : iconOutline;
    const activeClass = isActive
        ? 'text-slate-900 font-bold bg-slate-100'
        : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900';

    return `
    <a href="${href}" class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${activeClass}">
        <ion-icon name="${icon}" class="text-2xl transition-transform group-hover:scale-110 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-900'}"></ion-icon>
        <span class="text-sm">${label}</span>
    </a>
    `;
}

function renderMobileNavItem(href, iconOutline, iconSolid, isActive) {
    const icon = isActive ? iconSolid : iconOutline;
    const colorClass = isActive ? 'text-slate-900' : 'text-slate-400';

    return `
    <a href="${href}" class="flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${colorClass}">
        <ion-icon name="${icon}" class="text-2xl mb-0.5 ${isActive ? 'scale-110' : ''}"></ion-icon>
    </a>
    `;
}

// User Data Loader for Sidebar
export async function loadSidebarUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Try to get profile
        const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();

        const avatar = document.getElementById('sidebar-avatar');
        const name = document.getElementById('sidebar-user-name');

        if (avatar && name) {
            name.textContent = profile?.full_name || user.user_metadata.full_name || 'User';
            avatar.src = profile?.avatar_url || user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${name.textContent}`;
        }
    }
}
