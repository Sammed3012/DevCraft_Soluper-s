/**
 * REUSABLE DEMO MODAL COMPONENT (UPDATED)
 * 
 * Uses VideoPlayer to render video inside the modal.
 */
import { VideoPlayer } from './VideoPlayer.js';

export class DemoModal {
    constructor(videoUrl) {
        this.defaultUrl = videoUrl;
        this.videoUrl = videoUrl;
        this.modalId = 'demo-modal';
        this.videoContainerId = 'demo-video-container';
        this.player = null;
        this.init();
    }

    init() {
        if (document.getElementById(this.modalId)) return; // Prevent duplicates

        const modalHTML = `
        <div id="${this.modalId}" class="fixed inset-0 z-50 flex items-center justify-center invisible opacity-0 transition-all duration-300">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" id="${this.modalId}-backdrop"></div>
            
            <!-- Modal Content -->
            <div class="relative w-full max-w-4xl mx-4 bg-black rounded-2xl shadow-2xl overflow-hidden transform scale-95 transition-all duration-300" id="${this.modalId}-content">
                
                <!-- Close Button -->
                <button id="${this.modalId}-close" class="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all group focus:outline-none">
                    <ion-icon name="close-outline" class="text-2xl group-hover:rotate-90 transition-transform"></ion-icon>
                </button>

                <!-- Video Container (16:9 Aspect Ratio) -->
                <div class="relative pt-[56.25%] bg-slate-900">
                    <div id="${this.videoContainerId}" class="absolute inset-0 w-full h-full">
                        <!-- Video Player will render here -->
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event Listeners
        document.getElementById(`${this.modalId}-backdrop`).addEventListener('click', () => this.close());
        document.getElementById(`${this.modalId}-close`).addEventListener('click', () => this.close());

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });
    }

    open(url) {
        if (url) this.videoUrl = url;
        else this.videoUrl = this.defaultUrl;

        const modal = document.getElementById(this.modalId);
        const content = document.getElementById(`${this.modalId}-content`);

        if (!modal) return;

        // Show Modal
        modal.classList.remove('invisible', 'opacity-0');
        modal.classList.add('visible', 'opacity-100');

        // Animate Content
        content.classList.remove('scale-95');
        content.classList.add('scale-100');

        // Play Video
        this.player = new VideoPlayer(this.videoContainerId, this.videoUrl);
        this.player.render();

        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    close() {
        const modal = document.getElementById(this.modalId);
        const content = document.getElementById(`${this.modalId}-content`);

        if (!modal) return;

        // Hide Modal
        modal.classList.remove('visible', 'opacity-100');
        modal.classList.add('invisible', 'opacity-0');

        // Reset Animation
        content.classList.remove('scale-100');
        content.classList.add('scale-95');

        // Stop Video
        if (this.player) {
            this.player.stop();
            this.player = null;
        }

        document.body.style.overflow = ''; // Restore scrolling
    }

    isOpen() {
        const modal = document.getElementById(this.modalId);
        return modal && modal.classList.contains('visible');
    }
}
