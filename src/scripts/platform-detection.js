export function detectBrowser() {
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('edg/')) {
    return { browser: 'edge', name: 'Edge', url: 'https://microsoftedge.microsoft.com/addons/detail/open-headers/gnbibobkkddlflknjkgcmokdlpddegpo', icon: '/assets/icons/edge.svg' };
  } else if (ua.includes('firefox')) {
    return { browser: 'firefox', name: 'Firefox', url: 'https://addons.mozilla.org/en-US/firefox/addon/open-headers/', icon: '/assets/icons/firefox.svg' };
  } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium')) {
    // Safari detected — no extension available yet, show graceful fallback
    return { browser: 'safari', name: 'Safari (coming soon)', url: null, icon: '/assets/icons/safari.svg', unsupported: true };
  } else if (ua.includes('chrome') || ua.includes('chromium')) {
    return { browser: 'chrome', name: 'Chrome', url: 'https://chromewebstore.google.com/detail/ablaikadpbfblkmhpmbbnbbfjoibeejb', icon: '/assets/icons/chrome.svg' };
  }
  return null;
}

export async function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();

  // Try high-entropy values first (Chrome/Edge) — only accurate way to detect Apple Silicon
  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const data = await navigator.userAgentData.getHighEntropyValues(['architecture', 'platform', 'bitness']);
      const platform = data.platform?.toLowerCase() || '';
      const arch = data.architecture?.toLowerCase() || '';

      if (platform.includes('mac')) {
        const isArm = arch === 'arm';
        return { os: 'mac', arch: isArm ? 'arm64' : 'x64', display: isArm ? 'macOS Apple Silicon' : 'macOS Intel' };
      }
      if (platform.includes('win')) {
        return { os: 'windows', arch: 'x64', display: 'Windows' };
      }
      if (platform.includes('linux')) {
        const isArm = arch === 'arm';
        if (ua.includes('ubuntu') || ua.includes('debian')) return { os: 'linux-deb', arch: isArm ? 'arm64' : 'x64', display: 'Linux (Debian/Ubuntu)' };
        if (ua.includes('fedora') || ua.includes('rhel') || ua.includes('centos')) return { os: 'linux-rpm', arch: isArm ? 'arm64' : 'x64', display: 'Linux (Fedora/RHEL)' };
        return { os: 'linux', arch: isArm ? 'arm64' : 'x64', display: 'Linux' };
      }
    } catch {}
  }

  // Fallback: UA-based detection (navigator.platform lies "MacIntel" even on Apple Silicon)
  const isMac = ua.includes('mac') || (navigator.userAgentData?.platform || '').toLowerCase().includes('mac');
  const isWin = ua.includes('win') || (navigator.userAgentData?.platform || '').toLowerCase().includes('win');
  const isLinux = ua.includes('linux');

  if (isMac) {
    // navigator.platform is unreliable on Apple Silicon — default to arm64 for Safari on modern Macs
    // since most Macs sold since late 2020 are Apple Silicon and x64 build runs via Rosetta anyway
    const isSafari = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium');
    const arch = isSafari ? 'arm64' : 'x64';
    return { os: 'mac', arch, display: isSafari ? 'macOS Apple Silicon' : 'macOS Intel' };
  }
  if (isWin) {
    return { os: 'windows', arch: 'x64', display: 'Windows' };
  }
  if (isLinux) {
    const arch = ua.includes('aarch64') || ua.includes('arm') ? 'arm64' : 'x64';
    if (ua.includes('ubuntu') || ua.includes('debian')) return { os: 'linux-deb', arch, display: 'Linux (Debian/Ubuntu)' };
    if (ua.includes('fedora') || ua.includes('rhel') || ua.includes('centos')) return { os: 'linux-rpm', arch, display: 'Linux (Fedora/RHEL)' };
    return { os: 'linux', arch, display: 'Linux' };
  }
  return { os: 'unknown', arch: 'x64', display: 'your system' };
}
