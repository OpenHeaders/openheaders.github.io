// Main application entry point
import { initMobileMenu } from './js/mobile-menu.js';
import { displayDownloadOptions } from './js/download-manager.js';
import { initScrollEffects, initDetailsHandling } from './js/scroll-effects.js';
import { initCopyEmail } from './js/copy-email.js';
import { initLoadingScreen } from './js/loading-manager.js';

// Initialize loading screen immediately
initLoadingScreen();

// Initialize all functionality when DOM is ready
function initializePage() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Set up download options
    displayDownloadOptions().catch(console.error);
    
    // Initialize copy email button
    initCopyEmail();
    
    // Initialize scroll effects after a short delay to ensure buttons are created
    setTimeout(() => {
        initScrollEffects();
        initDetailsHandling();
    }, 100);
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}