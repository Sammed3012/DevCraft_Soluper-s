/**
 * Ideas Management Logic - Modern Redesign
 */

// ==========================================
// CREATE IDEA
// ==========================================
if (document.getElementById('create-idea-form')) {
    document.getElementById('create-idea-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('btn-submit');
        toggleLoading('btn-submit', true);

        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const tags = document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t);
        const fileInput = document.getElementById('file-upload');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in to post an idea');

            let imageUrl = null;

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('idea-images').upload(filePath, file);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('idea-images').getPublicUrl(filePath);
                imageUrl = publicUrl;
            }

            // Insert into 'ideas'
            const { error } = await supabase.from('ideas').insert({
                user_id: user.id,
                title,
                category,
                description,
                tags,
                image_url: imageUrl
            });

            if (error) throw error;
            showToast('Idea posted successfully!', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);

        } catch (error) {
            console.error('Error creating idea:', error);
            showToast(error.message || 'Error creating idea', 'error');
        } finally {
            toggleLoading('btn-submit', false);
        }
    });

    // Preview Image
    document.getElementById('file-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('image-preview');
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}


// ==========================================
// IDEA DETAILS (Post View)
// ==========================================
window.initIdeaDetails = async function (id) {
    const container = document.getElementById('idea-card-container');
    if (!container) return; // Not on details page

    try {
        const { data: idea, error } = await supabase
            .from('ideas')
            .select(`*, profiles (*), comments (id, content, created_at, profiles (*)), upvotes (*)`)
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!idea) throw new Error('Idea not found');

        // Populate Content
        document.getElementById('post-title').textContent = idea.title;
        document.getElementById('post-desc').textContent = idea.description;
        document.getElementById('post-author').textContent = idea.profiles?.full_name || 'Anonymous';
        document.getElementById('post-avatar').src = idea.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=User';
        document.getElementById('like-count').textContent = idea.upvotes_count || 0;
        document.getElementById('post-date').textContent = new Date(idea.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

        // Update matches component view logic (right sidebar)
        const sidebarName = document.getElementById('sidebar-author-name');
        const sidebarAvatar = document.getElementById('sidebar-author-avatar');
        if (sidebarName) sidebarName.textContent = idea.profiles?.full_name || 'Anonymous';
        if (sidebarAvatar) sidebarAvatar.src = idea.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=User';

        // Image Handling
        if (idea.image_url) {
            const img = document.getElementById('post-image');
            img.src = idea.image_url;
            img.classList.remove('hidden');
            document.getElementById('post-placeholder').classList.add('hidden');
        }

        // Skills
        const skillsContainer = document.getElementById('post-skills');
        if (idea.tags) {
            skillsContainer.innerHTML = idea.tags.map(tag =>
                `<span class="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">#${tag}</span>`
            ).join('');
        }

        // Upvote Logic
        const likeBtn = document.getElementById('btn-like');
        const { data: { user } } = await supabase.auth.getUser();
        const hasLiked = idea.upvotes.some(u => u.user_id === user?.id);

        if (hasLiked) {
            likeBtn.classList.replace('text-slate-800', 'text-red-500');
            likeBtn.innerHTML = '<ion-icon name="heart"></ion-icon>';
        }

        likeBtn.onclick = () => handleUpvote(id, likeBtn, document.getElementById('like-count'), hasLiked);

        // Comments
        const commentList = document.getElementById('comments-list');
        renderComments(idea.comments, commentList);

        setupRealtime(id, commentList);

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="p-10 text-center text-red-500">Could not load post.</div>';
    }
};

window.handleUpvote = async function (ideaId, btn, countEl, currentlyLiked) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { showToast('Login required', 'info'); return; }

    const isLiked = btn.classList.contains('text-red-500'); // Check visual state
    let count = parseInt(countEl.textContent);

    if (isLiked) {
        // Unlike
        btn.classList.replace('text-red-500', 'text-slate-800');
        btn.innerHTML = '<ion-icon name="heart-outline"></ion-icon>';
        countEl.textContent = Math.max(0, count - 1);
        await supabase.from('upvotes').delete().match({ idea_id: ideaId, user_id: user.id });
    } else {
        // Like
        btn.classList.replace('text-slate-800', 'text-red-500');
        btn.innerHTML = '<ion-icon name="heart"></ion-icon>';
        countEl.textContent = count + 1;
        await supabase.from('upvotes').insert({ idea_id: ideaId, user_id: user.id });
    }
};

function renderComments(comments, container) {
    if (!comments || comments.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No comments yet. Be the first!</p>';
        return;
    }

    container.innerHTML = comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(c => `
        <div class="flex gap-3 text-sm">
            <img src="${c.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=User'}" class="w-8 h-8 rounded-full border border-slate-100">
            <div>
                <p>
                    <span class="font-bold text-slate-900">${c.profiles?.full_name || 'Anonymous'}</span>
                    <span class="text-slate-600 break-all">${c.content}</span>
                </p>
                <div class="flex gap-3 mt-1 text-xs text-slate-400 font-medium">
                    <span>${timeAgo(c.created_at)}</span>
                    <button class="hover:text-slate-600">Reply</button>
                </div>
            </div>
            <button class="ml-auto text-slate-400 hover:text-red-500 self-start mt-1">
                <ion-icon name="heart-outline" class="text-xs"></ion-icon>
            </button>
        </div>
    `).join('');
}

// Post Comment Logic
const commentBtn = document.getElementById('btn-post-comment');
if (commentBtn) {
    commentBtn.addEventListener('click', async () => {
        const input = document.getElementById('comment-input');
        const content = input.value.trim();
        if (!content) return;

        const urlParams = new URLSearchParams(window.location.search);
        const ideaId = urlParams.get('id');
        const { data: { user } } = await supabase.auth.getUser();

        if (user && ideaId) {
            const { error } = await supabase.from('comments').insert({ idea_id: ideaId, user_id: user.id, content });
            if (!error) {
                input.value = '';
                showToast('Comment added', 'success');
            } else {
                showToast('Error posting comment', 'error');
            }
        } else {
            showToast('Login required', 'info');
        }
    });
}

function setupRealtime(ideaId, list) {
    supabase.channel(`idea-${ideaId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `idea_id=eq.${ideaId}` }, async (payload) => {
            const { data: newComment } = await supabase.from('comments').select('*, profiles(*)').eq('id', payload.new.id).single();
            if (newComment) {
                // Remove empty state
                if (list.innerHTML.includes('No comments')) list.innerHTML = '';

                const div = document.createElement('div');
                div.innerHTML = `
                    <div class="flex gap-3 text-sm animate-fade-in mb-4">
                        <img src="${newComment.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=User'}" class="w-8 h-8 rounded-full border border-slate-100">
                        <div>
                            <p>
                                <span class="font-bold text-slate-900">${newComment.profiles?.full_name || 'Anonymous'}</span>
                                <span class="text-slate-600">${newComment.content}</span>
                            </p>
                            <span class="text-xs text-slate-400 font-medium mt-1 inline-block">Just now</span>
                        </div>
                    </div>`;
                list.prepend(div.firstElementChild);
            }
        })
        .subscribe();
}
