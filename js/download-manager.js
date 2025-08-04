// Download management functionality
import { detectBrowser, detectPlatform } from './platform-detection.js';

let latestVersion = null;
let detectedPlatform = null;

// Fetch latest version from GitHub
async function fetchLatestVersion() {
    try {
        const response = await fetch('https://api.github.com/repos/OpenHeaders/open-headers-app/releases/latest');
        const data = await response.json();
        latestVersion = data.tag_name.replace('v', '');
        return latestVersion;
    } catch (e) {
        console.error('Failed to fetch latest version:', e);
        return '3.0.0';
    }
}

// Get download URL for specific platform
function getDownloadUrl(os, arch, variant) {
    const version = latestVersion || '3.0.0';
    const baseUrl = `https://github.com/OpenHeaders/open-headers-app/releases/download/v${version}/`;
    
    const downloads = {
        'mac-x64': {
            url: `${baseUrl}OpenHeaders-${version}-mac-x64.dmg`,
            name: 'macOS Intel',
            size: '120MB',
            icon: 'apple'
        },
        'mac-arm64': {
            url: `${baseUrl}OpenHeaders-${version}-mac-arm64.dmg`,
            name: 'macOS Apple Silicon',
            size: '120MB',
            icon: 'apple'
        },
        'windows-x64': {
            url: `${baseUrl}OpenHeaders-${version}-Setup.exe`,
            name: 'Windows with Git',
            size: '180MB',
            icon: 'windows'
        },
        'windows-x64-nogit': {
            url: `${baseUrl}OpenHeaders-${version}-Setup-NoGit.exe`,
            name: 'Windows without Git',
            size: '110MB',
            icon: 'windows'
        },
        'linux-appimage-x64': {
            url: `${baseUrl}OpenHeaders-${version}-x64.AppImage`,
            name: 'Linux AppImage x64',
            size: '150MB',
            icon: 'linux'
        },
        'linux-appimage-arm64': {
            url: `${baseUrl}OpenHeaders-${version}-arm64.AppImage`,
            name: 'Linux AppImage ARM64',
            size: '150MB',
            icon: 'linux'
        },
        'linux-deb-x64': {
            url: `${baseUrl}open-headers_${version}_amd64.deb`,
            name: 'Debian/Ubuntu x64',
            size: '120MB',
            icon: 'linux'
        },
        'linux-deb-arm64': {
            url: `${baseUrl}open-headers_${version}_arm64.deb`,
            name: 'Debian/Ubuntu ARM64',
            size: '120MB',
            icon: 'linux'
        },
        'linux-rpm-x64': {
            url: `${baseUrl}open-headers-${version}.x86_64.rpm`,
            name: 'Fedora/RHEL x64',
            size: '120MB',
            icon: 'linux'
        },
        'linux-rpm-arm64': {
            url: `${baseUrl}open-headers-${version}.aarch64.rpm`,
            name: 'Fedora/RHEL ARM64',
            size: '120MB',
            icon: 'linux'
        }
    };
    
    const key = variant || `${os}-${arch}`;
    return downloads[key] || null;
}

// Get all download options
function getAllDownloads() {
    return [
        getDownloadUrl('mac', 'arm64'),
        getDownloadUrl('mac', 'x64'),
        getDownloadUrl('windows', 'x64'),
        getDownloadUrl('windows', 'x64', 'windows-x64-nogit'),
        getDownloadUrl('linux-appimage', 'x64'),
        getDownloadUrl('linux-appimage', 'arm64'),
        getDownloadUrl('linux-deb', 'x64'),
        getDownloadUrl('linux-deb', 'arm64'),
        getDownloadUrl('linux-rpm', 'x64'),
        getDownloadUrl('linux-rpm', 'arm64')
    ].filter(d => d !== null);
}

// Create icon HTML
function getIconHtml(icon) {
    const iconMap = {
        'apple': '<img src="assets/icons/apple.svg" alt="Apple" width="18" height="18" class="icon-inverted">',
        'windows': '<img src="assets/icons/windows.svg" alt="Windows" width="18" height="18" class="icon-inverted">',
        'linux': '<img src="assets/icons/linux.svg" alt="Linux" width="18" height="18" class="icon-inverted">'
    };
    return iconMap[icon] || '';
}

// Display download options
export async function displayDownloadOptions() {
    await fetchLatestVersion();
    detectedPlatform = detectPlatform();
    
    // Set primary download based on detected platform
    let primaryDownload = null;
    if (detectedPlatform.os === 'mac') {
        primaryDownload = getDownloadUrl('mac', detectedPlatform.arch);
    } else if (detectedPlatform.os === 'windows') {
        primaryDownload = getDownloadUrl('windows', 'x64');
    } else if (detectedPlatform.os.includes('linux')) {
        if (detectedPlatform.os === 'linux-deb') {
            primaryDownload = getDownloadUrl('linux-deb', detectedPlatform.arch);
        } else if (detectedPlatform.os === 'linux-rpm') {
            primaryDownload = getDownloadUrl('linux-rpm', detectedPlatform.arch);
        } else {
            primaryDownload = getDownloadUrl('linux-appimage', detectedPlatform.arch);
        }
    }
    
    // Update hero download button
    if (primaryDownload) {
        const heroDownloadEl = document.getElementById('hero-download');
        if (heroDownloadEl) {
            const iconHtml = getIconHtml(primaryDownload.icon);
            heroDownloadEl.href = primaryDownload.url;
            heroDownloadEl.innerHTML = `${iconHtml}<span><span class="btn-main-text">Download Desktop App</span><span class="btn-sub-text">${primaryDownload.name}</span>`;
            heroDownloadEl.setAttribute('download', '');
        }
        
        // Update primary download in Get Started section
        const primaryDownloadEl = document.getElementById('primary-download');
        if (primaryDownloadEl) {
            const version = latestVersion || '3.0.0';
            const iconHtml = getIconHtml(primaryDownload.icon);
            primaryDownloadEl.href = primaryDownload.url;
            primaryDownloadEl.innerHTML = `${iconHtml}<span id="primary-text">Download for ${primaryDownload.name} &nbsp;&nbsp;<span class="version-opacity">${version}</span></span>`;
            primaryDownloadEl.setAttribute('download', '');
        }
    }
    
    // Set browser extension button
    const detectedBrowser = detectBrowser();
    const heroExtensionEl = document.getElementById('hero-extension');
    if (heroExtensionEl && detectedBrowser) {
        heroExtensionEl.href = detectedBrowser.url;
        heroExtensionEl.innerHTML = `<img src="${detectedBrowser.icon}" alt="${detectedBrowser.name}" width="18" height="18"><span><span class="btn-main-text">Install Browser Extension</span><span class="btn-sub-text">${detectedBrowser.name}</span></span>`;
        heroExtensionEl.setAttribute('target', '_blank');
        heroExtensionEl.setAttribute('rel', 'noopener noreferrer');
    }
    
    // Display all downloads in dropdown
    const allDownloads = getAllDownloads();
    const otherDownloadsEl = document.getElementById('other-downloads');
    
    if (otherDownloadsEl) {
        const version = latestVersion || '3.0.0';
        otherDownloadsEl.innerHTML = allDownloads.map(opt => {
            const iconHtml = getIconHtml(opt.icon);
            return `
                <a href="${opt.url}" class="download-option" download>
                    <div class="info">
                        ${iconHtml.replace('width="18"', 'width="16"').replace('height="18"', 'height="16"').replace('class="icon-inverted"', '')}
                        <span class="name">${opt.name}</span>
                    </div>
                    <span class="size">${version}</span>
                </a>
            `;
        }).join('');
    }
}