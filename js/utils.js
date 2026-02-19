/**
 * Common Utility Functions for OpenConnect
 */

// Show Toast Notification
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');

    // Choose icon based on type
    let icon = 'information-circle';
    if (type === 'success') icon = 'checkmark-circle';
    if (type === 'error') icon = 'alert-circle';

    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <ion-icon name="${icon}" class="text-lg"></ion-icon>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format Date (e.g., "2 hours ago")
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

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
}

// Toggle Loading State on Buttons
function toggleLoading(elementId, isLoading) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (isLoading) {
        el.dataset.originalContent = el.innerHTML;
        el.innerHTML = '<div class="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> Processing...';
        el.disabled = true;
        el.classList.add('opacity-70', 'cursor-not-allowed');
    } else {
        el.innerHTML = el.dataset.originalContent || 'Submit';
        el.disabled = false;
        el.classList.remove('opacity-70', 'cursor-not-allowed');
    }
}
