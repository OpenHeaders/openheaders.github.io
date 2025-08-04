// Copy email functionality
export function initCopyEmail() {
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (!copyEmailBtn) return;

    copyEmailBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText('contact@openheaders.io');
            const originalHTML = copyEmailBtn.innerHTML;
            copyEmailBtn.innerHTML = 'Copied!';
            
            setTimeout(() => {
                copyEmailBtn.innerHTML = originalHTML;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
        }
    });
}