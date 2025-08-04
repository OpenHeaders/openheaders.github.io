// Scroll-related functionality

export function initScrollEffects() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip download and extension buttons
        if (anchor.id === 'hero-download' || 
            anchor.id === 'hero-extension' || 
            anchor.id === 'primary-download') {
            return;
        }
        
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only handle smooth scroll for actual anchor links
            if (href && href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Details element handling
export function initDetailsHandling() {
    const details = document.querySelector('.other-downloads');
    if (details) {
        details.addEventListener('toggle', () => {
            const desktopCard = document.querySelector('.desktop-download-card');
            if (desktopCard) {
                if (details.open) {
                    desktopCard.classList.add('details-open');
                } else {
                    desktopCard.classList.remove('details-open');
                }
            }
        });
    }
}