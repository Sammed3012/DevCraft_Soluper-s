/**
 * REUSABLE IDEA POST COMPONENT (Instagram Style)
 */

export function renderIdeaCard(idea, currentUser = null) {
    const isOwner = currentUser && currentUser.id === idea.user_id;

    const avatarUrl = idea.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(idea.profiles?.full_name || 'User')}`;
    const authorName = idea.profiles?.full_name || 'Anonymous';

    // Skills formatting
    const skills = idea.required_skills && idea.required_skills.length > 0
        ? idea.required_skills.slice(0, 3).map(s => `<span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase shadow-sm border border-green-100">${s}</span>`).join('')
        : '';

    // Convert timestamp
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    return `
    <article class="bg-white border rounded-xl shadow-sm mb-6 transition-transform hover:shadow-md animate-fade-in group w-full max-w-lg mx-auto overflow-hidden border-slate-200">
        
        <!-- Header -->
        <div class="flex justify-between items-center p-3 border-b border-gray-50 bg-gray-50/50">
            <div class="flex items-center gap-3">
                <a href="profile.html?id=${idea.user_id}" class="relative group-avatar">
                    <img src="${avatarUrl}" class="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm transition-transform hover:scale-105">
                    <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </a>
                <div class="leading-tight">
                    <a href="profile.html?id=${idea.user_id}" class="font-bold text-sm text-slate-900 hover:text-green-600 transition-colors">${authorName}</a>
                    <p class="text-[10px] text-slate-500 font-medium">${idea.category || 'General'} • ${timeAgo(idea.created_at)}</p>
                </div>
            </div>
            <button class="text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <ion-icon name="ellipsis-horizontal" class="text-lg"></ion-icon>
            </button>
        </div>

        <!-- Image (if any) -->
        ${idea.image_url ? `
        <div class="relative w-full aspect-video bg-slate-100 overflow-hidden group-image cursor-pointer" onclick="window.location.href='idea-details.html?id=${idea.id}'">
            <img src="${idea.image_url}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
        </div>
        ` : ''}

        <!-- Content Body -->
        <div class="p-4">
            
            <!-- Actions Bar -->
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-4">
                    <button class="group flex items-center gap-1.5 transition-colors text-slate-600 hover:text-red-500" onclick="handleFeedUpvote('${idea.id}', this)">
                        <ion-icon name="heart-outline" class="text-2xl transition-transform active:scale-75 group-hover:scale-110"></ion-icon>
                    </button>
                    <button class="group flex items-center gap-1.5 transition-colors text-slate-600 hover:text-green-500" onclick="window.location.href='idea-details.html?id=${idea.id}#comments'">
                        <ion-icon name="chatbubble-outline" class="text-2xl transition-transform active:scale-75 group-hover:scale-110"></ion-icon>
                    </button>
                    <button class="group flex items-center gap-1.5 transition-colors text-slate-600 hover:text-green-500" onclick="navigator.share({title: '${idea.title}', url: window.location.href})">
                        <ion-icon name="paper-plane-outline" class="text-2xl transition-transform active:scale-75 group-hover:scale-110"></ion-icon>
                    </button>
                </div>
                <button class="text-slate-400 hover:text-slate-900 transition-colors">
                    <ion-icon name="bookmark-outline" class="text-2xl"></ion-icon>
                </button>
            </div>

            <!-- Likes Count -->
            <div class="mb-2">
                <p class="text-sm font-bold text-slate-900 cursor-pointer hover:underline">${idea.upvotes_count || 0} likes</p>
            </div>

            <!-- Title & Description -->
            <div class="mb-3">
                <h3 class="font-bold text-lg text-slate-900 leading-tight mb-1 hover:text-green-600 cursor-pointer" onclick="window.location.href='idea-details.html?id=${idea.id}'">
                    ${idea.title}
                </h3>
                <p class="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    ${idea.description} <span class="text-slate-400 text-xs font-medium cursor-pointer hover:text-slate-600">more</span>
                </p>
            </div>

            <!-- Skills/Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
                ${skills}
                ${idea.tags ? idea.tags.slice(0, 2).map(t => `<span class="text-xs text-slate-400 hover:text-green-500 cursor-pointer">#${t}</span>`).join(' ') : ''}
            </div>

            <!-- Comment Input (Fake) -->
            <div class="flex items-center gap-3 pt-3 border-t border-gray-100">
                <img src="${currentUser?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=Me'}" class="w-6 h-6 rounded-full border border-slate-200">
                <input type="text" placeholder="Add a comment..." class="bg-transparent text-sm w-full focus:outline-none placeholder-slate-400 text-slate-700">
                <button class="text-green-500 text-xs font-bold uppercase disabled:opacity-50 hover:text-green-700 transition-colors">Post</button>
            </div>
            
        </div>
    </article>
    `;
}
