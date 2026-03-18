export function detectBrowser() {
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('edg/')) {
    return { browser: 'edge', name: 'Edge', url: 'https://microsoftedge.microsoft.com/addons/detail/open-headers/gnbibobkkddlflknjkgcmokdlpddegpo', icon: '/assets/icons/edge.svg' };
  } else if (ua.includes('firefox')) {
    return { browser: 'firefox', name: 'Firefox', url: 'https://addons.mozilla.org/en-US/firefox/addon/open-headers/', icon: '/assets/icons/firefox.svg' };
  } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium')) {
    // Safari detected — no extension available yet, show graceful fallback
    return { browser: 'safari', name: 'Safari (coming soon)', url: null, icon: '/assets/icons/chrome.svg', unsupported: true };
  } else if (ua.includes('chrome') || ua.includes('chromium')) {
    return { browser: 'chrome', name: 'Chrome', url: 'https://chromewebstore.google.com/detail/ablaikadpbfblkmhpmbbnbbfjoibeejb', icon: '/assets/icons/chrome.svg' };
  }
  return null;
}

export function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  let platform = '';

  if (navigator?.userAgentData?.platform) {
    platform = navigator.userAgentData.platform.toLowerCase();
  } else {
    if (ua.includes('mac')) platform = 'macintel';
    else if (ua.includes('win')) platform = 'win32';
    else if (ua.includes('linux')) platform = 'linux';
  }

  let arch = 'x64';

  if (platform.includes('mac') || ua.includes('mac')) {
    const isAppleSilicon =
      (navigator.platform?.toLowerCase() || '').includes('arm') ||
      navigator?.userAgentData?.architecture === 'arm' ||
      (screen.width === 1512 && screen.height === 982) ||
      (screen.width === 1728 && screen.height === 1117) ||
      (screen.width === 1496 && screen.height === 967);
    arch = isAppleSilicon ? 'arm64' : 'x64';
    return { os: 'mac', arch, display: 'macOS' };
  } else if (platform.includes('win') || ua.includes('win')) {
    arch = navigator.userAgent.includes('WOW64') || navigator.userAgent.includes('Win64') ? 'x64' : 'x86';
    return { os: 'windows', arch, display: 'Windows' };
  } else if (platform.includes('linux') || ua.includes('linux')) {
    arch = navigator.userAgent.includes('aarch64') || navigator.userAgent.includes('arm') ? 'arm64' : 'x64';
    if (ua.includes('ubuntu') || ua.includes('debian')) return { os: 'linux-deb', arch, display: 'Linux (Debian/Ubuntu)' };
    if (ua.includes('fedora') || ua.includes('rhel') || ua.includes('centos')) return { os: 'linux-rpm', arch, display: 'Linux (Fedora/RHEL)' };
    return { os: 'linux', arch, display: 'Linux' };
  }
  return { os: 'unknown', arch: 'x64', display: 'your system' };
}
