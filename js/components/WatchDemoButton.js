/**
 * WATCH DEMO BUTTON COMPONENT
 * 
 * Handles interaction for the 'Watch Demo' button to trigger the modal.
 */

export class WatchDemoButton {
    constructor(buttonSelector, modalInstance) {
        this.buttonSelector = buttonSelector;
        this.modal = modalInstance;
        this.init();
    }

    init() {
        const buttons = document.querySelectorAll(this.buttonSelector);

        buttons.forEach(btn => {
            // Enhanced Styles (if not already present via class)
            // We can add hover effects here via JS or rely on CSS. 
            // The existing CSS has hover:bg-slate-50 etc.

            // Add Aria Label for accessibility
            btn.setAttribute('aria-label', 'Watch Demo Video');
            btn.setAttribute('role', 'button');

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.modal.open();
            });

            // Optional: Add a subtle pulse animation on hover via JS if desired, 
            // or just rely on CSS transitions.
        });
    }
}
