// Loading screen management
export function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    // Track loaded resources
    let imagesLoaded = 0;
    let totalImages = 0;
    
    // Get all images in the page
    const images = document.querySelectorAll('img');
    totalImages = images.length;
    
    // Function to check if all resources are loaded
    function checkAllLoaded() {
        if (imagesLoaded >= totalImages) {
            // Add a minimum display time for smooth experience
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');
                // Remove from DOM after fade
                setTimeout(() => {
                    loadingScreen.remove();
                }, 300);
            }, 500);
        }
    }
    
    // Track image loading
    images.forEach(img => {
        if (img.complete) {
            imagesLoaded++;
        } else {
            img.addEventListener('load', () => {
                imagesLoaded++;
                checkAllLoaded();
            });
            img.addEventListener('error', () => {
                imagesLoaded++;
                checkAllLoaded();
            });
        }
    });
    
    // Also hide loading screen when DOM is fully loaded as fallback
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loadingScreen && !loadingScreen.classList.contains('fade-out')) {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.remove();
                }, 300);
            }
        }, 1000);
    });
    
    // Initial check in case all images are already cached
    checkAllLoaded();
}