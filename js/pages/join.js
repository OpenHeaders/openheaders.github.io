// Join page specific functionality
import { detectPlatform } from '../platform-detection.js';

let inviteData = null;
let detectedPlatform = null;
let latestVersion = null;

// Build protocol URL in new unified format
function buildProtocolUrl(data) {
    const payload = {
        version: '3.0.0',
        action: 'team-invite',
        data: data
    };
    
    try {
        // Compress payload using gzip
        const payloadStr = JSON.stringify(payload);
        const compressed = pako.gzip(payloadStr);
        
        // Convert to base64url properly
        // First convert Uint8Array to regular array, then to binary string
        const binaryStr = Array.from(compressed, byte => String.fromCharCode(byte)).join('');
        const base64url = btoa(binaryStr)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        
        return `openheaders://open?payload=${base64url}`;
    } catch (error) {
        console.error('Failed to compress payload:', error);
        // Fallback to uncompressed - also use base64url encoding
        const base64url = btoa(JSON.stringify(payload))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        return `openheaders://open?payload=${base64url}`;
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
            icon: 'assets/icons/apple.svg'
        },
        'mac-arm64': {
            url: `${baseUrl}OpenHeaders-${version}-mac-arm64.dmg`,
            name: 'macOS Apple Silicon',
            size: '120MB',
            icon: 'assets/icons/apple.svg'
        },
        'windows-x64': {
            url: `${baseUrl}OpenHeaders-${version}-Setup.exe`,
            name: 'Windows with Git',
            size: '180MB',
            icon: 'assets/icons/windows.svg'
        },
        'windows-x64-nogit': {
            url: `${baseUrl}OpenHeaders-${version}-Setup-NoGit.exe`,
            name: 'Windows without Git',
            size: '110MB',
            icon: 'assets/icons/windows.svg'
        },
        'linux-appimage-x64': {
            url: `${baseUrl}OpenHeaders-${version}-x64.AppImage`,
            name: 'Linux AppImage x64',
            size: '150MB',
            icon: 'assets/icons/linux.svg'
        },
        'linux-appimage-arm64': {
            url: `${baseUrl}OpenHeaders-${version}-arm64.AppImage`,
            name: 'Linux AppImage ARM64',
            size: '150MB',
            icon: 'assets/icons/linux.svg'
        },
        'linux-deb-x64': {
            url: `${baseUrl}open-headers_${version}_amd64.deb`,
            name: 'Debian/Ubuntu x64',
            size: '120MB',
            icon: 'assets/icons/linux.svg'
        },
        'linux-deb-arm64': {
            url: `${baseUrl}open-headers_${version}_arm64.deb`,
            name: 'Debian/Ubuntu ARM64',
            size: '120MB',
            icon: 'assets/icons/linux.svg'
        },
        'linux-rpm-x64': {
            url: `${baseUrl}open-headers-${version}.x86_64.rpm`,
            name: 'Fedora/RHEL x64',
            size: '120MB',
            icon: 'assets/icons/linux.svg'
        },
        'linux-rpm-arm64': {
            url: `${baseUrl}open-headers-${version}.aarch64.rpm`,
            name: 'Fedora/RHEL ARM64',
            size: '120MB',
            icon: 'assets/icons/linux.svg'
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

// Get installation instructions based on platform
function getInstallInstructions(platform) {
    const version = latestVersion || '3.0.0';
    const certUrl = `https://github.com/OpenHeaders/open-headers-app/releases/download/v${version}/open-headers-ca.crt`;
    
    const instructions = {
        'windows': `
            <h4>Installation Steps for Windows</h4>
            <div class="warning-box">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="install-instructions">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <div>
                    <strong>Certificate Required:</strong> You must install the certificate first for the app to work properly.
                </div>
            </div>
            <ol>
                <li><strong>Download & Install Certificate:</strong>
                    <ul>
                        <li>Download <a href="${certUrl}" target="_blank">open-headers-ca.crt</a></li>
                        <li>Double-click the certificate file</li>
                        <li>Click "Install Certificate..."</li>
                        <li>Choose "Local Machine" (requires admin)</li>
                        <li>Select "Place all certificates in the following store"</li>
                        <li>Browse and select "Trusted Root Certification Authorities"</li>
                        <li>Click "Next" and "Finish"</li>
                    </ul>
                </li>
                <li><strong>Run the installer</strong> after certificate installation</li>
                <li><strong>Launch</strong> from Start menu or desktop shortcut</li>
            </ol>
            <p class="install-note">
                Note: After reboot, OpenHeaders starts automatically in the system tray.
            </p>
        `,
        'mac': `
            <h4>Installation Steps for macOS</h4>
            <ol>
                <li><strong>Open the downloaded .dmg file</strong></li>
                <li><strong>Drag OpenHeaders</strong> to your Applications folder</li>
                <li><strong>Launch</strong> from Applications or Spotlight (⌘ + Space)</li>
                <li>If prompted, click "Open" to bypass Gatekeeper</li>
            </ol>
            <p class="install-note">
                Note: After reboot, OpenHeaders starts automatically in the menu bar.
            </p>
        `,
        'linux-appimage': `
            <h4>Installation Steps for Linux (AppImage)</h4>
            <ol>
                <li><strong>Make executable:</strong> <code>chmod +x OpenHeaders-*.AppImage</code></li>
                <li><strong>Install with script:</strong> <code>sudo ./install-open-headers.sh</code></li>
                <li><strong>Launch</strong> from application menu or run <code>open-headers</code></li>
            </ol>
            <p class="install-note">
                Note: The install script creates desktop integration. After reboot, OpenHeaders starts automatically.
            </p>
        `,
        'linux-deb': `
            <h4>Installation Steps for Debian/Ubuntu</h4>
            <ol>
                <li><strong>Install package:</strong> <code>sudo apt install ./open-headers_*.deb</code></li>
                <li><strong>Launch</strong> from application menu or run <code>open-headers</code></li>
            </ol>
            <p class="install-note">
                Note: After reboot, OpenHeaders starts automatically in the system tray.
            </p>
        `,
        'linux-rpm': `
            <h4>Installation Steps for Fedora/RHEL</h4>
            <ol>
                <li><strong>Install package:</strong> <code>sudo rpm -i open-headers-*.rpm</code></li>
                <li><strong>Launch</strong> from application menu or run <code>open-headers</code></li>
            </ol>
            <p class="install-note">
                Note: After reboot, OpenHeaders starts automatically in the system tray.
            </p>
        `,
        'linux': `
            <h4>Installation Steps for Linux</h4>
            <p>Choose your preferred installation method from the downloads above:</p>
            <ul>
                <li><strong>AppImage:</strong> Universal, no installation required</li>
                <li><strong>.deb:</strong> For Debian, Ubuntu, and derivatives</li>
                <li><strong>.rpm:</strong> For Fedora, RHEL, CentOS, and derivatives</li>
            </ul>
            <p class="install-note">
                Note: After reboot, OpenHeaders starts automatically in the system tray.
            </p>
        `
    };
    
    return instructions[platform] || instructions['linux'];
}

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

// Display download options
async function displayDownloadOptions() {
    await fetchLatestVersion();
    detectedPlatform = detectPlatform();
    
    const downloadSection = document.getElementById('download-section');
    const detectedOsEl = document.getElementById('detected-os');
    
    detectedOsEl.textContent = detectedPlatform.display;
    
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
    
    // Display primary download
    if (primaryDownload) {
        const primaryBtn = document.getElementById('primary-download');
        const primaryIcon = document.getElementById('primary-icon');
        const primaryText = document.getElementById('primary-text');
        
        primaryBtn.href = primaryDownload.url;
        primaryIcon.src = primaryDownload.icon;
        primaryIcon.alt = primaryDownload.name;
        primaryIcon.classList.add('primary-icon-inverted');
        const version = latestVersion || '3.0.0';
        primaryText.innerHTML = `${primaryDownload.name} &nbsp;&nbsp;<span class="version-opacity">${version}</span>`;
        
        primaryBtn.setAttribute('download', '');
    }
    
    // Display all other downloads
    const allDownloads = getAllDownloads();
    const otherDownloadsEl = document.getElementById('other-downloads');
    
    // Filter out the primary download from the list
    const otherDownloads = allDownloads.filter(d => 
        !primaryDownload || d.url !== primaryDownload.url
    );
    
    const version = latestVersion || '3.0.0';
    otherDownloadsEl.innerHTML = otherDownloads.map(opt => `
        <a href="${opt.url}" class="download-option" download>
            <div class="info">
                <img src="${opt.icon}" alt="${opt.name}" width="16" height="16">
                <span class="name">${opt.name}</span>
            </div>
            <span class="size">${version}</span>
        </a>
    `).join('');
    
    downloadSection.classList.add('section-visible');
    
    // Display installation instructions
    const installInstructionsEl = document.getElementById('install-instructions');
    let instructionsPlatform = detectedPlatform.os;
    if (instructionsPlatform === 'linux' && primaryDownload) {
        if (primaryDownload.name.includes('AppImage')) {
            instructionsPlatform = 'linux-appimage';
        } else if (primaryDownload.name.includes('Debian')) {
            instructionsPlatform = 'linux-deb';
        } else if (primaryDownload.name.includes('Fedora')) {
            instructionsPlatform = 'linux-rpm';
        }
    }
    installInstructionsEl.innerHTML = getInstallInstructions(instructionsPlatform);
}

// Initialize page
function init() {
    const params = new URLSearchParams(window.location.search);
    const payloadParam = params.get('payload');
    
    if (!payloadParam) {
        displayError('No invite found');
        return;
    }
    
    try {
        // Decode the unified payload format
        let decodedPayload;
        
        try {
            // Try to decompress payload using gzip
            const compressed = Uint8Array.from(atob(payloadParam.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
            const decompressed = pako.ungzip(compressed, { to: 'string' });
            decodedPayload = JSON.parse(decompressed);
        } catch (compressionError) {
            // Fallback to regular base64 decoding for backward compatibility
            try {
                decodedPayload = JSON.parse(atob(payloadParam));
            } catch (base64Error) {
                throw new Error('Failed to decode payload: invalid format');
            }
        }
        
        // Validate payload structure
        if (!decodedPayload.action || decodedPayload.action !== 'team-invite') {
            displayError('Invalid invite type');
            return;
        }
        
        if (!decodedPayload.data) {
            displayError('Invalid invite data');
            return;
        }
        
        inviteData = decodedPayload.data;
        
        if (!inviteData.workspaceName || !inviteData.repoUrl) {
            displayError('Invalid invite');
            return;
        }
        
        displayWorkspaceInfo(inviteData);
        displayDownloadOptions();
        checkIfAppInstalled();
        
        // Set up event listeners
        const alreadyInstalledBtn = document.getElementById('already-installed-btn');
        if (alreadyInstalledBtn) {
            alreadyInstalledBtn.addEventListener('click', tryOpenApp);
        }
        
        const openInAppBtn = document.getElementById('open-in-app-btn');
        if (openInAppBtn) {
            openInAppBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openInApp();
            });
        }
    } catch (e) {
        console.error('Error processing invite:', e);
        displayError('Invalid invite');
    }
}

function displayWorkspaceInfo(data) {
    document.getElementById('workspace-info').innerHTML = `
        <h2><span class="workspace-label">Name:</span> ${escapeHtml(data.workspaceName)}</h2>
        <div class="detail-row">
            <span class="detail-label">Repository:</span>
            <span class="detail-value">${escapeHtml(data.repoUrl)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Branch:</span>
            <span class="detail-value">${escapeHtml(data.branch || 'main')}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Config Path:</span>
            <span class="detail-value">${escapeHtml(data.configPath || 'config/open-headers.json')}</span>
        </div>
        ${data.inviterName ? `<div class="detail-row"><span class="detail-label">Invited by:</span><span class="detail-value">${escapeHtml(data.inviterName)}</span></div>` : ''}
    `;
}

function displayError(msg) {
    document.querySelector('.join-card').innerHTML = `
        <div class="logo error-logo">
            <img src="logo.svg" alt="OpenHeaders">
            <span>OpenHeaders</span>
        </div>
        <div class="error-state">
            <h2>Invalid Invite</h2>
            <p>${escapeHtml(msg)}</p>
            <a href="https://openheaders.io" class="btn btn-primary">
                Visit OpenHeaders
            </a>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function tryOpenApp() {
    if (!inviteData) return;
    const protocolUrl = buildProtocolUrl(inviteData);
    window.location.href = protocolUrl;
    
    setTimeout(() => {
        const btn = document.querySelector('.already-installed-btn');
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="install-instructions">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>If OpenHeaders didn't open, install it first</span>
        `;
        btn.classList.add('btn-error');
    }, 2000);
}

function openInApp() {
    if (!inviteData) return;
    const protocolUrl = buildProtocolUrl(inviteData);
    window.location.href = protocolUrl;
}

function checkIfAppInstalled() {
    if (!inviteData) return;
    
    const protocolUrl = buildProtocolUrl(inviteData);
    const iframe = document.createElement('iframe');
    iframe.classList.add('protocol-iframe');
    iframe.src = protocolUrl;
    
    const handleBlur = () => {
        document.getElementById('no-app-section').classList.add('section-hidden');
        document.getElementById('has-app-section').classList.add('section-visible');
        window.removeEventListener('blur', handleBlur);
        if (iframe.parentNode) document.body.removeChild(iframe);
    };
    
    window.addEventListener('blur', handleBlur);
    
    setTimeout(() => {
        window.removeEventListener('blur', handleBlur);
        if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1500);
    
    document.body.appendChild(iframe);
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}