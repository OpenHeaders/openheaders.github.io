// Platform and browser detection utilities

export function detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('edg/')) {
        return {
            browser: 'edge',
            name: 'Edge',
            url: 'https://microsoftedge.microsoft.com/addons/detail/open-headers/gnbibobkkddlflknjkgcmokdlpddegpo',
            icon: 'assets/icons/edge.svg'
        };
    } else if (userAgent.includes('firefox')) {
        return {
            browser: 'firefox',
            name: 'Firefox',
            url: 'https://addons.mozilla.org/en-US/firefox/addon/open-headers/',
            icon: 'assets/icons/firefox.svg'
        };
    } else if (userAgent.includes('chrome') || userAgent.includes('chromium')) {
        return {
            browser: 'chrome',
            name: 'Chrome',
            url: 'https://chromewebstore.google.com/detail/ablaikadpbfblkmhpmbbnbbfjoibeejb',
            icon: 'assets/icons/chrome.svg'
        };
    }
    return null;
}

export function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    let platform = '';
    
    // Use modern userAgentData API if available
    if (navigator && navigator.userAgentData && navigator.userAgentData.platform) {
        platform = navigator.userAgentData.platform.toLowerCase();
    } else {
        // Fallback to parsing userAgent string
        if (userAgent.includes('mac')) platform = 'macintel';
        else if (userAgent.includes('win')) platform = 'win32';
        else if (userAgent.includes('linux')) platform = 'linux';
    }
    
    // Detect architecture
    let arch = 'x64'; // default
    
    if (platform.includes('mac') || userAgent.includes('mac')) {
        // For macOS, check if it's Apple Silicon
        const isAppleSilicon = checkAppleSilicon();
        arch = isAppleSilicon ? 'arm64' : 'x64';
        return { os: 'mac', arch: arch, display: 'macOS' };
    } else if (platform.includes('win') || userAgent.includes('win')) {
        arch = navigator.userAgent.includes('WOW64') || navigator.userAgent.includes('Win64') ? 'x64' : 'x86';
        return { os: 'windows', arch: arch, display: 'Windows' };
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
        arch = navigator.userAgent.includes('aarch64') || navigator.userAgent.includes('arm') ? 'arm64' : 'x64';
        if (userAgent.includes('ubuntu') || userAgent.includes('debian')) {
            return { os: 'linux-deb', arch: arch, display: 'Linux (Debian/Ubuntu)' };
        } else if (userAgent.includes('fedora') || userAgent.includes('rhel') || userAgent.includes('centos')) {
            return { os: 'linux-rpm', arch: arch, display: 'Linux (Fedora/RHEL)' };
        }
        return { os: 'linux', arch: arch, display: 'Linux' };
    }
    return { os: 'unknown', arch: 'x64', display: 'your system' };
}

function checkAppleSilicon() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform?.toLowerCase() || '';
    
    return platform.includes('arm') ||
        (typeof navigator !== 'undefined' && 'userAgentData' in navigator && 
         navigator.userAgentData?.architecture === 'arm') ||
        // Check for specific Apple Silicon screen resolutions
        (screen.width === 1512 && screen.height === 982) || // 14" MacBook Pro
        (screen.width === 1728 && screen.height === 1117) || // 16" MacBook Pro
        (screen.width === 1496 && screen.height === 967);    // 13" MacBook Air M1
}