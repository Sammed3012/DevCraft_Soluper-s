// Dashboard Logic

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }

    const user = session.user;

    // 2. Load User Profile Info for Header
    loadUserProfile(user.id);

    // 3. Load Stats
    loadStats();

    // 4. Load Trending Ideas
    loadTrendingIdeas();

    // Set Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', dateOptions);
    // 5. Load Active Hackathon
    loadHackathon();
});

function loadHackathon() {
    const container = document.getElementById('hackathon-container');
    if (container && window.renderHackathonSection) {
        container.innerHTML = window.renderHackathonSection();
    }
}

async function loadUserProfile(userId) {
    // Fetch profile
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    // If no profile (edge case if trigger failed), use metadata
    if (!profile) {
        // Fallback
        const { data: { user } } = await supabase.auth.getUser();
        document.getElementById('user-name').innerText = user.user_metadata.full_name || 'Innovator';
        document.getElementById('nav-avatar').src = user.user_metadata.avatar_url || 'https://ui-avatars.com/api/?name=User';
    } else {
        document.getElementById('user-name').innerText = profile.full_name || 'Innovator';
        if (profile.avatar_url) {
            document.getElementById('nav-avatar').src = profile.avatar_url;
        }
    }
}

async function loadStats() {
    try {
        // Parallel requests for speed
        const [ideas, upvotes, collabs, communities] = await Promise.all([
            supabase.from('ideas').select('id', { count: 'exact', head: true }),
            supabase.from('upvotes').select('idea_id', { count: 'exact', head: true }),
            supabase.from('collaborations').select('id', { count: 'exact', head: true }),
            supabase.from('community_members').select('community_id', { count: 'exact', head: true }).eq('user_id', (await supabase.auth.getUser()).data.user.id)
        ]);

        animateCounter('stat-ideas', ideas.count || 0);
        animateCounter('stat-upvotes', upvotes.count || 0);
        animateCounter('stat-collabs', collabs.count || 0);
        animateCounter('stat-communities', communities.count || 0); // Communities joined by user

    } catch (e) {
        console.error("Error loading stats", e);
    }
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    const duration = 1500; // ms
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out quart
        const ease = 1 - Math.pow(1 - progress, 4);

        const current = Math.floor(start + (target - start) * ease);
        el.innerText = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.innerText = target;
        }
    }

    requestAnimationFrame(update);
}

async function loadTrendingIdeas() {
    const container = document.getElementById('trending-container');

    // Fetch top 5 ideas by upvotes
    const { data: ideas, error } = await supabase
        .from('ideas')
        .select(`
            *,
            profiles (full_name, avatar_url)
        `)
        .order('upvotes_count', { ascending: false })
        .limit(5);

    if (error) {
        container.innerHTML = `<p class="text-red-400">Error loading ideas.</p>`;
        return;
    }

    if (ideas.length === 0) {
        container.innerHTML = `
            <div class="glass p-8 text-center">
                <p class="text-slate-400">No ideas yet. be the first to post!</p>
                <a href="create-idea.html" class="inline-block mt-4 px-6 py-2 bg-green-600 rounded-full text-white text-sm">Post Idea</a>
            </div>
        `;
        return;
    }

    container.innerHTML = ideas.map(idea => `
        <div class="glass p-5 hover:bg-slate-800/50 transition-all border border-slate-700/50 group">
            <div class="flex justify-between items-start">
                <div class="flex gap-4">
                    <img src="${idea.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=User'}" class="w-10 h-10 rounded-full border border-slate-600 object-cover" alt="Author">
                    <div>
                        <h3 class="font-bold text-lg text-white group-hover:text-green-400 transition-colors">
                            <a href="idea-details.html?id=${idea.id}">${idea.title}</a>
                        </h3>
                        <p class="text-xs text-slate-400 mb-2">by ${idea.profiles?.full_name || 'Unknown'} • ${timeAgo(idea.created_at)}</p>
                        <p class="text-slate-300 text-sm line-clamp-2">${idea.description}</p>
                        
                        <!-- Tags -->
                        <div class="flex flex-wrap gap-2 mt-3">
                            ${idea.tags ? idea.tags.map(tag => `<span class="px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300">#${tag}</span>`).join('') : ''}
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-col items-center gap-1 min-w-[50px]">
                    <button class="text-slate-400 hover:text-green-500 transition-colors">
                        <ion-icon name="caret-up-outline" class="text-2xl"></ion-icon>
                    </button>
                    <span class="font-bold text-lg text-white">${idea.upvotes_count}</span>
                </div>
            </div>
        </div>
    `).join('');
}
