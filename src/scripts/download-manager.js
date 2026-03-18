import { detectBrowser, detectPlatform } from './platform-detection.js';

let latestVersion = null;

const FALLBACK_VERSION = '3.4.1';

async function fetchLatestVersion() {
  const CACHE_KEY = 'oh-latest-version';
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { version, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL && version) {
        latestVersion = version;
        return;
      }
    }
    const res = await fetch('https://api.github.com/repos/OpenHeaders/open-headers-app/releases/latest');
    const data = await res.json();
    if (data.tag_name) {
      latestVersion = data.tag_name.replace('v', '');
      localStorage.setItem(CACHE_KEY, JSON.stringify({ version: latestVersion, ts: Date.now() }));
    }
  } catch {}
  if (!latestVersion) latestVersion = FALLBACK_VERSION;
}

function getDownloadUrl(os, arch, variant) {
  if (!latestVersion) return null;
  const v = latestVersion;
  const base = `https://github.com/OpenHeaders/open-headers-app/releases/download/v${v}/`;

  const map = {
    'mac-x64':              { url: `${base}OpenHeaders-${v}-mac-x64.dmg`,         name: 'macOS Intel',           icon: 'apple' },
    'mac-arm64':            { url: `${base}OpenHeaders-${v}-mac-arm64.dmg`,       name: 'macOS Apple Silicon',   icon: 'apple' },
    'windows-x64':          { url: `${base}OpenHeaders-${v}-Setup.exe`,           name: 'Windows with Git',      icon: 'windows' },
    'windows-x64-nogit':    { url: `${base}OpenHeaders-${v}-Setup-NoGit.exe`,     name: 'Windows without Git',   icon: 'windows' },
    'linux-appimage-x64':   { url: `${base}OpenHeaders-${v}-x64.AppImage`,        name: 'Linux AppImage x64',    icon: 'linux' },
    'linux-appimage-arm64': { url: `${base}OpenHeaders-${v}-arm64.AppImage`,      name: 'Linux AppImage ARM64',  icon: 'linux' },
    'linux-deb-x64':        { url: `${base}open-headers_${v}_amd64.deb`,          name: 'Debian/Ubuntu x64',     icon: 'linux' },
    'linux-deb-arm64':      { url: `${base}open-headers_${v}_arm64.deb`,          name: 'Debian/Ubuntu ARM64',   icon: 'linux' },
    'linux-rpm-x64':        { url: `${base}open-headers-${v}.x86_64.rpm`,         name: 'Fedora/RHEL x64',       icon: 'linux' },
    'linux-rpm-arm64':      { url: `${base}open-headers-${v}.aarch64.rpm`,        name: 'Fedora/RHEL ARM64',     icon: 'linux' },
  };

  return map[variant || `${os}-${arch}`] || null;
}

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
    getDownloadUrl('linux-rpm', 'arm64'),
  ].filter(Boolean);
}

function iconImg(icon, lazy = false) {
  const loading = lazy ? 'lazy' : 'eager';
  const map = {
    apple:   `<img src="/assets/icons/apple.svg" alt="Apple" width="18" height="18" class="icon-inverted" loading="${loading}">`,
    windows: `<img src="/assets/icons/windows.svg" alt="Windows" width="18" height="18" class="icon-inverted" loading="${loading}">`,
    linux:   `<img src="/assets/icons/linux.svg" alt="Linux" width="18" height="18" class="icon-inverted" loading="${loading}">`,
  };
  return map[icon] || '';
}

const RELEASES_URL = 'https://github.com/OpenHeaders/open-headers-app/releases/latest';

function getPlatformMeta(plat) {
  if (plat.os === 'mac') return { name: plat.arch === 'arm64' ? 'macOS Apple Silicon' : 'macOS Intel', icon: 'apple' };
  if (plat.os === 'windows') return { name: 'Windows', icon: 'windows' };
  if (plat.os.includes('linux')) return { name: plat.display || 'Linux', icon: 'linux' };
  return null;
}

export async function displayDownloadOptions() {
  // Detect platform immediately — don't wait for version
  const plat = await detectPlatform();
  const meta = getPlatformMeta(plat);

  // Update buttons with platform info right away (fallback to releases page)
  if (meta) {
    const heroEl = document.getElementById('hero-download');
    if (heroEl) {
      heroEl.href = RELEASES_URL;
      heroEl.innerHTML = `${iconImg(meta.icon)}<span class="flex flex-col gap-px text-left"><span class="text-sm font-medium">Download Desktop App</span><span class="text-[.6875rem] opacity-70 font-mono">${meta.name}</span></span>`;
    }
    const primaryEl = document.getElementById('primary-download');
    if (primaryEl) {
      primaryEl.href = RELEASES_URL;
      primaryEl.innerHTML = `${iconImg(meta.icon)}<span class="flex flex-col gap-px text-left"><span class="text-sm font-medium">Download for ${meta.name}</span></span>`;
    }
  }

  // Now fetch version and update URLs if successful
  await fetchLatestVersion();

  let primary = null;
  if (plat.os === 'mac') primary = getDownloadUrl('mac', plat.arch);
  else if (plat.os === 'windows') primary = getDownloadUrl('windows', 'x64');
  else if (plat.os.includes('linux')) {
    if (plat.os === 'linux-deb') primary = getDownloadUrl('linux-deb', plat.arch);
    else if (plat.os === 'linux-rpm') primary = getDownloadUrl('linux-rpm', plat.arch);
    else primary = getDownloadUrl('linux-appimage', plat.arch);
  }

  if (primary) {
    const heroEl = document.getElementById('hero-download');
    if (heroEl) {
      heroEl.href = primary.url;
      heroEl.innerHTML = `${iconImg(primary.icon)}<span class="flex flex-col gap-px text-left"><span class="text-sm font-medium">Download Desktop App</span><span class="text-[.6875rem] opacity-70 font-mono">${primary.name}</span></span>`;
      heroEl.setAttribute('download', '');
    }
    const primaryEl = document.getElementById('primary-download');
    if (primaryEl) {
      primaryEl.href = primary.url;
      primaryEl.innerHTML = `${iconImg(primary.icon)}<span class="flex flex-col gap-px text-left"><span class="text-sm font-medium">Download for ${primary.name}</span>${latestVersion ? `<span class="text-[.6875rem] opacity-70 font-mono">${latestVersion}</span>` : ''}</span>`;
      primaryEl.setAttribute('download', '');
    }
  }

  // Hero extension button
  const browser = detectBrowser();
  const extEl = document.getElementById('hero-extension');
  if (extEl && browser) {
    if (browser.unsupported) {
      // Safari or unsupported browser — show "coming soon" state
      extEl.removeAttribute('href');
      extEl.style.cursor = 'default';
      extEl.style.color = 'var(--c-tx2)';
      extEl.style.borderColor = 'var(--c-bd)';
      extEl.innerHTML = `<img src="${browser.icon}" alt="${browser.name}" width="18" height="18" loading="eager"><span class="flex flex-col gap-px text-left"><span class="text-sm font-medium">Browser Extension</span><span class="text-[.6875rem] font-mono" style="color:var(--c-tx3)">Coming soon for ${browser.name.replace(' (coming soon)', '')}</span></span>`;
    } else {
      extEl.href = browser.url;
      extEl.innerHTML = `<img src="${browser.icon}" alt="${browser.name}" width="18" height="18" loading="eager"><span class="flex flex-col gap-px text-left"><span class="text-sm font-medium">Install Browser Extension</span><span class="text-[.6875rem] opacity-70 font-mono">${browser.name}</span></span>`;
      extEl.setAttribute('target', '_blank');
      extEl.setAttribute('rel', 'noopener noreferrer');
    }
  }

  // All downloads dropdown
  const allDl = getAllDownloads();
  const otherEl = document.getElementById('other-downloads');
  if (otherEl) {
    otherEl.innerHTML = allDl.map(opt =>
      `<a href="${opt.url}" class="download-option" download>
        <div class="info">
          ${iconImg(opt.icon, true).replace(/width="18"/g, 'width="16"').replace(/height="18"/g, 'height="16"')}
          <span class="name">${opt.name}</span>
          ${latestVersion ? `<span class="size">${latestVersion}</span>` : ''}
        </div>
      </a>`
    ).join('');
  }
}
