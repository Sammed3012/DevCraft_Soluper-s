export class Layout {
    constructor(activePage = 'dashboard') {
        this.activePage = activePage;
        this.render();
    }

    render() {
        const body = document.querySelector('body');
        const content = body.innerHTML;

        // Wrap existing content in grid
        // Using CSS Grid for robust sidebar layout
        body.innerHTML = `
            <div class="md:grid md:grid-cols-[260px_1fr] min-h-screen bg-gray-50">
                <!-- Sidebar (Desktop) -->
                <!-- Sticky sourcing: top-0 h-screen ensures it stays fixed in view while scrolling main content if needed, 
                     but logically in grid it just takes the column height. 
                     'sticky top-0 h-screen' is the standard tailwind pattern for this. -->
                <aside class="hidden md:flex flex-col border-r border-slate-200 bg-white h-screen sticky top-0 left-0 z-30 pt-6 px-4 overflow-y-auto">
                    <!-- Brand -->
                    <div class="mb-8 px-2 flex items-center gap-2 flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm">
                            <ion-icon name="prism"></ion-icon>
                        </div>
                        <span class="text-lg font-bold text-slate-900 tracking-tight">OpenConnect</span>
                    </div>

                    <!-- Navigation -->
                    <nav class="flex-1 space-y-1">
                        ${this.renderNavItem('Dashboard', 'dashboard.html', 'grid-outline', 'grid')}
                        ${this.renderNavItem('Find Matches', 'matches.html', 'telescope-outline', 'telescope')}
                        ${this.renderNavItem('My Projects', 'profile.html', 'folder-open-outline', 'folder-open')}
                        ${this.renderNavItem('Create Project', 'create-idea.html', 'add-circle-outline', 'add-circle')}
                    </nav>

                    <!-- User Profile -->
                    <div class="mt-auto border-t border-slate-100 pt-4 pb-6 flex-shrink-0">
                         <div class="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors group" onclick="window.location.href='profile.html'">
                            <img id="sidebar-avatar" src="https://ui-avatars.com/api/?name=User" class="w-9 h-9 rounded-full border border-slate-200 shadow-sm object-cover">
                            <div class="flex-1 overflow-hidden">
                                <p class="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors" id="sidebar-name">Loading...</p>
                                <p class="text-xs text-slate-400 truncate">Free Plan</p>
                            </div>
                            <button onclick="logout()" class="text-slate-400 hover:text-red-500 transition-colors">
                                <ion-icon name="log-out-outline"></ion-icon>
                            </button>
                        </div>
                    </div>
                </aside>

                <!-- Main Content Area -->
                <main class="min-h-screen flex flex-col relative w-full overflow-x-hidden">
                    
                    <!-- Topbar (Mobile + Desktop) -->
                    <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between h-16 flex-shrink-0">
                        <!-- Mobile Toggle -->
                        <div class="md:hidden flex items-center gap-2">
                            <!-- In future: Add toggle handling -->
                            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                <ion-icon name="prism"></ion-icon>
                            </div>
                            <span class="font-bold text-slate-900">OpenConnect</span>
                        </div>

                        <!-- Search (Desktop) -->
                        <div class="hidden md:flex flex-1 max-w-lg relative mx-auto">
                            <ion-icon name="search-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></ion-icon>
                            <input type="text" placeholder="Search projects, skills, or people..." 
                                class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all">
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-4 ml-auto">
                            <button class="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <ion-icon name="notifications-outline" class="text-xl"></ion-icon>
                                <div class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                            </button>
                             <a href="create-idea.html" class="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md">
                                <ion-icon name="add"></ion-icon> New Project
                            </a>
                        </div>
                    </header>

                    <!-- Page Content -->
                    <div class="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1 animate-enter">
                        ${content}
                    </div>

                    <!-- Mobile Bottom Nav spacer -->
                    <div class="h-20 md:hidden"></div>

                    <!-- Mobile Bottom Nav -->
                    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
                        ${this.renderMobileNavItem('dashboard.html', 'grid-outline', 'grid', 'Dashboard')}
                        ${this.renderMobileNavItem('matches.html', 'telescope-outline', 'telescope', 'Matches')}
                        <div class="relative -top-6">
                             <a href="create-idea.html" class="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-slate-500/30 hover:scale-105 transition-transform border-4 border-gray-50">
                                <ion-icon name="add"></ion-icon>
                            </a>
                        </div>
                        ${this.renderMobileNavItem('profile.html', 'person-outline', 'person', 'Profile')}
                        ${this.renderMobileNavItem('#', 'settings-outline', 'settings', 'Settings')}
                    </nav>
                </main>
            </div>
        `;

        this.loadUserData();
    }

    renderNavItem(label, href, iconOutline, iconSolid) {
        const isActive = window.location.pathname.includes(href) || (href === 'dashboard.html' && window.location.pathname === '/');
        // Logic for exact match highlighting can be refined
        const activeClass = isActive
            ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600'
            : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900';

        return `
        <a href="${href}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${activeClass}">
            <ion-icon name="${isActive ? iconSolid : iconOutline}" class="text-xl"></ion-icon>
            <span class="text-sm">${label}</span>
        </a>`;
    }

    renderMobileNavItem(href, iconOutline, iconSolid, label) {
        const isActive = window.location.pathname.includes(href);
        return `
        <a href="${href}" class="flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-slate-400'}">
            <ion-icon name="${isActive ? iconSolid : iconOutline}" class="text-2xl"></ion-icon>
            <span class="text-[10px] font-medium">${label}</span>
        </a>`;
    }

    async loadUserData() {
        if (!window.supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const nameEl = document.getElementById('sidebar-name');
            const avatarEl = document.getElementById('sidebar-avatar');
            if (nameEl) nameEl.textContent = user.user_metadata.full_name || 'Innovator';
            if (avatarEl) avatarEl.src = user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`;
        }
    }
}
