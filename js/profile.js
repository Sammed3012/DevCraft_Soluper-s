// Profile Management Logic - SaaS Redesigned

document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }

    const { user } = session;
    loadProfile(user.id);
    loadUserProjects(user.id); // Renamed for clarity

    // Setup Avatar Upload
    const avatarInput = document.getElementById('avatar-upload');
    if (avatarInput) avatarInput.addEventListener('change', (e) => handleAvatarUpload(e, user.id));

    // Setup Edit Form
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) editForm.addEventListener('submit', (e) => handleProfileUpdate(e, user.id));
});

// Load Profile
async function loadProfile(userId) {
    try {
        let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        if (!profile) return;

        // Display
        const nameEl = document.getElementById('profile-name');
        if (nameEl) nameEl.textContent = profile.full_name || 'Innovator';

        const bioEl = document.getElementById('profile-bio');
        if (bioEl) bioEl.textContent = profile.bio || 'Passionate builder ready to collaborate.';

        if (profile.avatar_url) {
            const avatarEl = document.getElementById('profile-avatar');
            if (avatarEl) avatarEl.src = profile.avatar_url;
        }

        const skillsContainer = document.getElementById('profile-skills');
        if (skillsContainer) {
            skillsContainer.innerHTML = '';
            if (profile.skills && profile.skills.length > 0) {
                profile.skills.forEach(skill => {
                    const badge = document.createElement('span');
                    badge.className = 'skill-tag';
                    badge.textContent = skill;
                    skillsContainer.appendChild(badge);
                });
            } else {
                skillsContainer.innerHTML = '<span class="text-sm text-slate-400 italic">No skills listed</span>';
            }
        }

        // Fill Edit Form values
        const editName = document.getElementById('edit-name');
        if (editName) editName.value = profile.full_name || '';

        const editBio = document.getElementById('edit-bio');
        if (editBio) editBio.value = profile.bio || '';

        const editSkills = document.getElementById('edit-skills');
        if (editSkills) editSkills.value = profile.skills ? profile.skills.join(', ') : '';

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load User's Projects
async function loadUserProjects(userId) {
    const grid = document.getElementById('my-projects-grid');
    if (!grid) return;

    const { data: ideas, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error || !ideas) {
        grid.innerHTML = '<p class="col-span-full text-slate-500">Error loading projects.</p>';
        return;
    }

    if (ideas.length === 0) {
        grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <ion-icon name="folder-open-outline" class="text-3xl mb-2 text-slate-300"></ion-icon>
            <p class="text-sm">No projects created yet.</p>
            <a href="create-idea.html" class="text-blue-600 font-bold hover:underline mt-2 inline-block text-xs uppercase tracking-wide">Start a Project</a>
        </div>`;
        return;
    }

    grid.innerHTML = ideas.map(idea => `
    <div class="saas-card group hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full bg-white cursor-pointer" onclick="window.location.href='idea-details.html?id=${idea.id}'">
        <div class="h-32 bg-slate-100 relative overflow-hidden border-b border-slate-100">
             ${idea.image_url
            ? `<img src="${idea.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`
            : `<div class="w-full h-full flex items-center justify-center text-slate-300 text-3xl"><ion-icon name="image-outline"></ion-icon></div>`
        }
             <span class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-sm border border-slate-100">${idea.category || 'General'}</span>
        </div>
        
        <div class="p-4 flex flex-col flex-1">
            <h3 class="font-bold text-slate-900 mb-1 truncate group-hover:text-blue-600 transition-colors">${idea.title}</h3>
            <p class="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">${idea.description}</p>
            
            <div class="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                <span class="text-xs text-slate-400 flex items-center gap-1"><ion-icon name="heart"></ion-icon> ${idea.upvotes_count || 0}</span>
                <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">${new Date(idea.created_at).toLocaleDateString()}</span>
            </div>
        </div>
    </div>
    `).join('');
}

// Handle Avatar Upload
async function handleAvatarUpload(event, userId) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        showToast('Uploading avatar...', 'info');

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to 'avatars' bucket
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', userId);

        if (updateError) throw updateError;

        // UI Update
        const profileAvatar = document.getElementById('profile-avatar');
        if (profileAvatar) profileAvatar.src = publicUrl;

        const sidebarAvatar = document.getElementById('sidebar-avatar');
        if (sidebarAvatar) sidebarAvatar.src = publicUrl;

        showToast('Avatar updated!', 'success');

    } catch (error) {
        console.error('Avatar upload error:', error);
        showToast('Error uploading avatar', 'error');
    }
}

// Handle Profile Update (Name, Bio, Skills)
async function handleProfileUpdate(e, userId) {
    e.preventDefault();
    toggleLoading('btn-save', true);

    const fullName = document.getElementById('edit-name').value;
    const bio = document.getElementById('edit-bio').value;
    const skills = document.getElementById('edit-skills').value.split(',').map(s => s.trim()).filter(s => s);

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                bio: bio,
                skills: skills,
            })
            .eq('id', userId);

        if (error) throw error;

        showToast('Profile updated!', 'success');
        closeEditModal();
        loadProfile(userId); // Reload UI

    } catch (error) {
        console.error('Profile update error:', error);
        showToast('Error updating profile', 'error');
    } finally {
        toggleLoading('btn-save', false);
    }
}

// Modal Helpers
window.openEditModal = function () {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.remove('hidden');
}

window.closeEditModal = function () {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.add('hidden');
}
