// ===== Utilities =====
const SHARE_BASE = 'https://rls.hpsbassline.club';
const PUBLIC_BASE = 'https://release.hpsbassline.club';

function toAbsoluteUrl(value) {
  if (!value || typeof value !== 'string') return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${PUBLIC_BASE}${value}`;
  return value;
}

const Escaped = {
    html(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },
    attr(value) { return Escaped.html(value); },
    url(value) {
        const s = String(value || '');
        const trimmed = s.trim();
        const ok = /^(https?:|mailto:|tel:|\/)/i.test(trimmed);
        return ok ? trimmed : '#';
    },
};

const ServiceData = {
    'spotify':        { icon: 'icons/spotify.png',        name: 'Spotify' },
    'apple':          { icon: 'icons/apple.png',          name: 'Apple Music' },
    'youtube':        { icon: 'icons/youtube.png',        name: 'YouTube' },
    'youtube-music':  { icon: 'icons/youtube-music.png',  name: 'YouTube Music' },
    'yandex':         { icon: 'icons/yandex.png',         name: 'Yandex Music' },
    'soundcloud':     { icon: 'icons/soundcloud.png',     name: 'SoundCloud' },
    'bandcamp':       { icon: 'icons/bandcamp.png',       name: 'Bandcamp' },
    'tidal':          { icon: 'icons/tidal.png',          name: 'Tidal' },
    'deezer':         { icon: 'icons/deezer.png',         name: 'Deezer' },
    'audiomack':      { icon: 'icons/audiomack.png',      name: 'AudioMack' },
    'discogs':        { icon: 'icons/discogs.png',        name: 'Discogs' },
    'custom':         { icon: 'icons/custom.png',         name: 'Listen Online' },
};
function getServiceData(type) {
    return ServiceData[type] || { icon: 'icons/custom.png', name: 'Listen Online' };
}

const SocialIcons = {
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    twitter:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    tiktok:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
    spotify:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    youtube:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
};

// ===== Color extraction =====
const ColorExtractor = {
    async getAverageColor(imageUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                try {
                    const size = 64;
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx.drawImage(img, 0, 0, size, size);
                    const data = ctx.getImageData(0, 0, size, size).data;
                    let r = 0, g = 0, b = 0, count = 0;
                    for (let i = 0; i < data.length; i += 4) {
                        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
                    }
                    r = Math.floor(r / count);
                    g = Math.floor(g / count);
                    b = Math.floor(b / count);
                    const max = Math.max(r, g, b);
                    if (max > 0) {
                        r = Math.round((r / max) * 255 * 0.7 + 255 * 0.3);
                        g = Math.round((g / max) * 255 * 0.7 + 255 * 0.3);
                        b = Math.round((b / max) * 255 * 0.7 + 255 * 0.3);
                    }
                    resolve(`rgb(${r}, ${g}, ${b})`);
                } catch (e) {
                    resolve('rgb(107, 91, 149)');
                }
            };
            img.onerror = () => resolve('rgb(107, 91, 149)');
            img.src = imageUrl;
        });
    }
};

// ===== App =====
const MusicHub = {
    gaId: 'G-P6S0B5BW23',
    isAuthenticated: false,
    releasesCache: null,
    currentAlbum: null,

    loadPreloadedData() {
        if (typeof window !== 'undefined' && window.__PRELOADED_ALBUM__) {
            this.currentAlbum = window.__PRELOADED_ALBUM__;
            return this.currentAlbum;
        }
        return null;
    },

    async loadServerConfig() {
        try {
            const [cfg, auth] = await Promise.all([
                fetch('/api/config').then((r) => r.json()).catch(() => ({})),
                fetch('/api/auth/status', { credentials: 'include' }).then((r) => r.json()).catch(() => ({ authenticated: false })),
            ]);
            this.isAuthenticated = !!auth.authenticated;
            this.adminConfigured = !!cfg.adminPasswordRequired;
        } catch (e) {
            this.isAuthenticated = false;
            this.adminConfigured = false;
        }
    },

    trackEvent(action, category, label, value = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, { event_category: category, event_label: label, value });
        }
    },

    trackServiceClick(serviceType, serviceName, albumTitle) {
        this.trackEvent('service_click', 'Services', `${serviceName} - ${albumTitle}`);
    },
    trackAlbumView(albumTitle, artist) {
        this.trackEvent('album_view', 'Albums', `${albumTitle} - ${artist}`);
    },
    trackMerchClick(albumTitle) {
        this.trackEvent('merch_click', 'Merch', albumTitle);
    },
    trackShareClick(albumTitle) {
        this.trackEvent('share_click', 'Share', albumTitle);
    },

    shareAlbum() {
        if (!this.currentAlbum) return;
        const shareUrl = `${SHARE_BASE}/${this.currentAlbum.slug}`;
        this.trackShareClick(this.currentAlbum.title);
        const fallback = () => this.showNotification(`Share URL: ${shareUrl}`);
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(shareUrl).then(
                () => this.showNotification('Link copied to clipboard!'),
                fallback,
            );
        } else {
            fallback();
        }
    },

    async init() {
        await this.loadServerConfig();
        await this.loadFooter();
        await this.loadReleases();
        this.setupEventListeners();

        const adminKey = document.querySelector('.admin-key');
        if (adminKey) {
            adminKey.classList.add('show');
            adminKey.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showLogin();
                }
            });
        }

        this.handleRoute();
        window.addEventListener('popstate', () => this.handleRoute());

        document.addEventListener('keydown', (e) => {
            const tag = (e.target && e.target.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
            if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'л')) {
                e.preventDefault();
                this.showLogin();
            }
        });
    },

    async loadFooter() {
        try {
            const footer = await fetch('/api/footer').then((r) => r.json());
            this._footer = footer || {};
        } catch (e) {
            this._footer = {};
        }
    },

    async loadReleases() {
        try {
            const releases = await fetch('/api/releases').then((r) => r.json());
            this.releasesCache = Array.isArray(releases) ? releases : [];
        } catch (e) {
            const local = localStorage.getItem('musiclink_releases');
            this.releasesCache = local ? JSON.parse(local) : [];
        }
        this.renderHomePage(this.releasesCache);
    },

    sortReleases(releases) {
        return releases.slice().sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
                return a.order - b.order;
            }
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    },

    formatViews(n) {
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        return String(n);
    },

    renderHomePage(releases) {
        const container = document.getElementById('releasesList');
        if (!releases || releases.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    <p>No releases yet</p>
                </div>`;
            return;
        }

        const sorted = this.sortReleases(releases);
        container.innerHTML = sorted.map((release) => {
            const safeSlug = Escaped.attr(release.slug);
            const bg = release.cover
                ? `style="background-image: url('${Escaped.attr(release.cover)}');"`
                : '';
            const fallbackClass = release.cover ? '' : ' release-card--no-cover';
            const views = release.views > 0 ? `<span class="release-views" title="${release.views} views">👁 ${this.formatViews(release.views)}</span>` : '';
            const year = release.year ? `<span class="release-year">${Escaped.html(String(release.year))}</span>` : '';
            return `
                <div class="release-card${fallbackClass}" data-slug="${safeSlug}" ${bg}>
                    <div class="release-info">
                        <div class="release-title">${Escaped.html(release.title)}</div>
                        <div class="release-artist">${Escaped.html(release.artist)}</div>
                        <div class="release-meta-row">${year}${views}</div>
                    </div>
                </div>`;
        }).join('');

        container.querySelectorAll('.release-card').forEach((card) => {
            card.addEventListener('click', () => this.viewAlbum(card.dataset.slug));
        });

        this.renderHomeFooter();
    },

    renderFooterInto(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const footer = this._footer || {};
        if (!footer || Object.keys(footer).length === 0) {
            container.innerHTML = '<p>&copy; Haapsaly Bassline</p>';
            return;
        }
        const parts = [];
        if (footer.text) parts.push(`<p>${Escaped.html(footer.text)}</p>`);
        if (footer.social) {
            const socials = [];
            for (const key of ['instagram', 'twitter', 'tiktok', 'spotify', 'youtube']) {
                const url = footer.social[key];
                if (url && SocialIcons[key]) {
                    socials.push(`<a href="${Escaped.attr(url)}" target="_blank" rel="noopener noreferrer" class="social-icon">${SocialIcons[key]}</a>`);
                }
            }
            if (socials.length) parts.push(`<div class="social-links">${socials.join('')}</div>`);
        }
        if (footer.website) {
            parts.push(`<p style="margin: 10px 0;"><a href="${Escaped.attr(footer.website)}" target="_blank" rel="noopener noreferrer" style="color: var(--primary);">Visit Website</a></p>`);
        }
        if (footer.copyright) parts.push(`<p style="margin-top: 15px; opacity: 0.7;">${Escaped.html(footer.copyright)}</p>`);
        container.innerHTML = parts.join('') || '<p>&copy; Haapsaly Bassline</p>';
    },

    renderHomeFooter() { this.renderFooterInto('homeFooterContent'); },
    renderAlbumFooter() { this.renderFooterInto('albumFooterContent'); },

    viewAlbum(slug) {
        history.pushState({}, '', `/${slug}`);
        this.showAlbumPage(slug);
    },

    async incrementView(albumId) {
        if (!albumId) return;
        try {
            await fetch(`/api/releases/${encodeURIComponent(albumId)}/view`, { method: 'POST' });
        } catch (e) { /* offline is fine */ }
    },

    async showAlbumPage(slug) {
        const key = this.normalizeSlug(slug);
        const preloaded = this.loadPreloadedData();
        if (preloaded && this.normalizeSlug(preloaded.slug) === key) {
            this.syncUrlSlug(preloaded.slug);
            this.renderAlbum(preloaded);
            this.incrementView(preloaded.id);
            return;
        }

        const releases = this.releasesCache || [];
        const album = releases.find((r) => r && this.normalizeSlug(r.slug) === key);
        if (!album) {
            this.showNotification('Album not found', 'error');
            this.goHome();
            return;
        }
        this.syncUrlSlug(album.slug);
        this.renderAlbum(album);
        this.incrementView(album.id);
    },

    normalizeSlug(value) {
        return String(value || '').trim().replace(/\/+$/, '').toLowerCase();
    },

    syncUrlSlug(slug) {
        const target = `/${slug}`;
        if (window.location.pathname !== target) {
            history.replaceState({}, '', target);
        }
    },

    renderAlbum(album) {
        const adminKey = document.querySelector('.admin-key');
        if (adminKey) adminKey.classList.remove('show');

        this.currentAlbum = album;
        document.title = `${album.title} - ${album.artist} | HPS Bassline`;
        this.updateFavicon(album.cover);
        this.updateOpenGraph(album);
        this.updateSchemaOrg(album);
        this.trackAlbumView(album.title, album.artist);

        document.getElementById('homePage').classList.add('hidden');
        document.getElementById('albumPage').classList.remove('hidden');

        const bg = document.getElementById('albumBackground');
        bg.style.backgroundImage = `url("${Escaped.url(album.cover)}")`;
        bg.classList.remove('hidden');

        const cover = document.getElementById('albumCover');
        cover.src = album.cover;
        cover.alt = `${album.title} - ${album.artist}`;
        cover.onerror = () => { cover.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>'; };

        ColorExtractor.getAverageColor(album.cover).then((color) => {
            document.documentElement.style.setProperty('--album-color', color);
        });

        const titleEl = document.getElementById('albumTitle');
        const artistEl = document.getElementById('albumArtist');
        const descEl = document.getElementById('albumDescription');
        const yearEl = document.getElementById('albumYear');

        titleEl.textContent = album.title;
        artistEl.textContent = album.artist;

        if (album.description && album.description.trim()) {
            descEl.textContent = album.description;
            descEl.classList.remove('hidden');
        } else {
            descEl.textContent = '';
            descEl.classList.add('hidden');
        }

        if (album.year) {
            yearEl.textContent = `Release Date: ${album.year}`;
            yearEl.classList.remove('hidden');
        } else {
            yearEl.textContent = '';
            yearEl.classList.add('hidden');
        }

        this.renderGenres(album.genre);
        this.renderTracks(album.tracks);
        this.renderLinks(album.services, album.title);
        this.renderMerch(album.merch);
        this.renderAlbumFooter();
    },

    renderGenres(genre) {
        const container = document.getElementById('albumGenres');
        if (!container) return;
        const list = Array.isArray(genre) ? genre : (genre ? [genre] : []);
        if (list.length === 0) {
            container.classList.add('hidden');
            container.innerHTML = '';
            return;
        }
        container.innerHTML = list.map((g) => `<span class="genre-badge">${Escaped.html(g)}</span>`).join('');
        container.classList.remove('hidden');
    },

    renderTracks(tracks) {
        const section = document.getElementById('albumTracksSection');
        if (!section) return;
        if (!Array.isArray(tracks) || tracks.length === 0) {
            section.classList.add('hidden');
            section.innerHTML = '';
            return;
        }

        const PREVIEW_COUNT = 5;
        const collapsible = tracks.length > PREVIEW_COUNT;

        const totalSec = tracks.reduce((sum, t) => {
            if (!t.duration) return sum;
            const m = /(\d+):(\d{1,2})/.exec(t.duration);
            return m ? sum + (+m[1]) * 60 + (+m[2]) : sum;
        }, 0);
        const totalLabel = totalSec > 0 ? `${Math.floor(totalSec / 60)} min ${totalSec % 60} sec` : '';

        const items = tracks.map((t, i) => {
            const num = String(i + 1).padStart(2, '0');
            const title = Escaped.html(t.title || '');
            const duration = t.duration ? `<span class="track-duration">${Escaped.html(t.duration)}</span>` : '';
            const link = t.url
                ? `<a class="track-link" href="${Escaped.attr(t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Listen on Bandcamp">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
                  </a>`
                : '';
            const extra = collapsible && i >= PREVIEW_COUNT ? ' track-item--extra' : '';
            return `
                <li class="track-item${extra}">
                    <span class="track-num">${num}</span>
                    <div class="track-main">
                        <div class="track-title">${title}</div>
                    </div>
                    ${duration}
                    ${link}
                </li>`;
        }).join('');

        const more = collapsible ? tracks.length - PREVIEW_COUNT : 0;
        const listId = `tracksList-${Escaped.attr(tracks[0]?.title || 'x')}`;
        const toggle = collapsible
            ? `
                <button type="button" class="tracks-toggle" aria-expanded="false" aria-controls="${listId}">
                    <span class="tracks-toggle-label">Show all tracks</span>
                    <span class="tracks-toggle-more">+ ${more}</span>
                    <svg class="tracks-toggle-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                </button>`
            : '';

        section.innerHTML = `
            <div class="tracks-wrap">
                <div class="tracks-summary">
                    <span class="tracks-count">${tracks.length} ${tracks.length === 1 ? 'track' : 'tracks'}</span>
                    ${totalLabel ? `<span class="tracks-time">${totalLabel}</span>` : ''}
                </div>
                <ol class="tracks-list" id="${listId}">
                    ${items}
                </ol>${toggle}
            </div>
        `;

        const toggleBtn = section.querySelector('.tracks-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const wrap = toggleBtn.closest('.tracks-wrap');
                const expanded = wrap.classList.toggle('expanded');
                toggleBtn.setAttribute('aria-expanded', String(expanded));
                const label = toggleBtn.querySelector('.tracks-toggle-label');
                if (label) label.textContent = expanded ? 'Hide' : 'Show all tracks';
            });
        }

        section.classList.remove('hidden');
    },

    renderLinks(services, albumTitle) {
        const container = document.getElementById('albumLinks');
        if (!Array.isArray(services) || services.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Links coming soon</p>';
            return;
        }
        container.innerHTML = services.map((service) => {
            const data = getServiceData(service.type);
            const safeType = Escaped.attr(service.type);
            const safeName = Escaped.attr(data.name);
            const safeUrl = Escaped.url(service.url);
            const safeTitle = Escaped.attr(albumTitle);
            return `
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="music-link ${safeType}" data-service-type="${safeType}" data-service-name="${safeName}">
                    <div class="music-link-icon"><img src="${Escaped.attr(data.icon)}" alt="${safeName}" class="service-icon"></div>
                    <div class="music-link-text">${safeName}</div>
                    <div class="music-link-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </div>
                </a>`;
        }).join('');

        container.querySelectorAll('.music-link').forEach((a) => {
            a.addEventListener('click', () => {
                this.trackServiceClick(a.dataset.serviceType, a.dataset.serviceName, albumTitle);
            });
        });
    },

    renderMerch(merch) {
        const link = document.getElementById('albumMerch');
        if (!merch) {
            link.classList.add('hidden');
            link.removeAttribute('href');
            return;
        }
        link.href = Escaped.url(merch);
        link.classList.remove('hidden');
        link.onclick = () => this.trackMerchClick(this.currentAlbum?.title || '');
    },

    updateOpenGraph(album) {
        const shareUrl = `${SHARE_BASE}/${album.slug}`;
        const coverUrl = toAbsoluteUrl(album.cover);
        this.updateMetaTag('og:title', `${album.title} - ${album.artist}`);
        this.updateMetaTag('og:description', album.description || 'Listen to this release on HPS Bassline');
        this.updateMetaTag('og:image', coverUrl);
        this.updateMetaTag('og:url', shareUrl);
        this.updateMetaTag('og:type', 'music.album');
        this.updateMetaTag('twitter:card', 'summary_large_image');
        this.updateMetaTag('twitter:title', `${album.title} - ${album.artist}`);
        this.updateMetaTag('twitter:description', album.description || 'Listen to this release on HPS Bassline');
        this.updateMetaTag('twitter:image', coverUrl);
        this.updateMetaTag('twitter:image:alt', `${album.title} cover`);
    },

    updateMetaTag(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`) ||
                   document.querySelector(`meta[name="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            if (property.startsWith('og:') || property.startsWith('twitter:')) {
                meta.setAttribute('property', property);
            } else {
                meta.setAttribute('name', property);
            }
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', String(content || ''));
    },

    resetOpenGraph() {
        this.updateMetaTag('og:title', 'Releases');
        this.updateMetaTag('og:description', 'All Releases here!');
        this.updateMetaTag('og:image', `${PUBLIC_BASE}/og-default.jpg`);
        this.updateMetaTag('og:url', `${SHARE_BASE}/`);
        this.updateMetaTag('twitter:card', 'summary_large_image');
        this.updateMetaTag('twitter:title', 'Releases');
        this.updateMetaTag('twitter:description', 'All Releases here!');
        this.updateMetaTag('twitter:image', `${PUBLIC_BASE}/og-default.jpg`);
        const ldScript = document.querySelector('script[type="application/ld+json"]');
        if (ldScript) ldScript.remove();
    },

    updateSchemaOrg(album) {
        const data = {
            '@context': 'https://schema.org',
            '@type': 'MusicAlbum',
            name: album.title,
            byArtist: { '@type': 'MusicGroup', name: album.artist },
            image: album.cover,
            description: album.description || '',
            datePublished: String(album.year || new Date().getFullYear()),
            genre: Array.isArray(album.genre) ? album.genre : (album.genre ? [album.genre] : undefined),
            track: Array.isArray(album.tracks)
                ? album.tracks.filter((t) => t && t.title).map((t, i) => ({
                      '@type': 'MusicRecording',
                      name: t.title,
                      duration: t.duration || undefined,
                      position: i + 1,
                  }))
                : undefined,
        };
        let ldScript = document.querySelector('script[type="application/ld+json"]');
        if (!ldScript) {
            ldScript = document.createElement('script');
            ldScript.type = 'application/ld+json';
            document.head.appendChild(ldScript);
        }
        ldScript.textContent = JSON.stringify(data);
    },

    updateFavicon(iconUrl) {
        document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach((l) => l.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = iconUrl;
        document.head.appendChild(link);
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = iconUrl;
        document.head.appendChild(appleLink);
    },

    goHome() {
        document.title = 'HPS Bassline';
        this.resetOpenGraph();
        document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((l) => l.remove());
        const defaultFavicon = document.createElement('link');
        defaultFavicon.rel = 'icon';
        defaultFavicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎵</text></svg>';
        document.head.appendChild(defaultFavicon);
        history.pushState({}, '', '/');
        this.showHomePage();
    },

    showHomePage() {
        const adminKey = document.querySelector('.admin-key');
        if (adminKey) adminKey.classList.add('show');
        document.getElementById('albumPage').classList.add('hidden');
        document.getElementById('homePage').classList.remove('hidden');
        this.renderHomeFooter();
        const bg = document.getElementById('albumBackground');
        if (bg) {
            bg.classList.add('hidden');
            bg.style.backgroundImage = '';
        }
    },

    handleRoute() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') {
            this.showHomePage();
        } else if (path === '/admin') {
            if (this.isAuthenticated) {
                window.location.replace('/admin-panel.html');
            } else {
                this.showLogin();
            }
        } else {
            let slug;
            try {
                slug = decodeURIComponent(path.replace(/^\/+/, ''));
            } catch (e) {
                slug = path.replace(/^\/+/, '');
            }
            if (slug) this.showAlbumPage(slug);
            else this.showHomePage();
        }
    },

    showLogin() {
        const modal = document.getElementById('loginModal');
        modal.classList.add('active');
        const password = document.getElementById('password');
        if (password) password.focus();
        this._modalKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideLogin();
            } else if (e.key === 'Tab') {
                const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', this._modalKeyHandler);
    },

    hideLogin() {
        const modal = document.getElementById('loginModal');
        modal.classList.remove('active');
        const input = document.getElementById('password');
        if (input) input.value = '';
        if (this._modalKeyHandler) {
            document.removeEventListener('keydown', this._modalKeyHandler);
            this._modalKeyHandler = null;
        }
        this.goHome();
    },

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideLogin();
            });
        }
    },

    async handleLogin() {
        const password = document.getElementById('password').value;
        if (!this.adminConfigured) {
            this.showNotification('Admin password not configured on server', 'error');
            return;
        }
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                this.showNotification(data.error || 'Invalid password', 'error');
                return;
            }
            this.isAuthenticated = true;
            const modal = document.getElementById('loginModal');
            if (modal) modal.classList.remove('active');
            const input = document.getElementById('password');
            if (input) input.value = '';
            if (this._modalKeyHandler) {
                document.removeEventListener('keydown', this._modalKeyHandler);
                this._modalKeyHandler = null;
            }
            window.location.href = '/admin-panel.html';
        } catch (e) {
            this.showNotification('Network error', 'error');
        }
    },

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
            color: #fff; border-radius: var(--radius);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 3000; animation: slideIn 0.3s ease;`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        if (!document.querySelector('#notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }`;
            document.head.appendChild(style);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => MusicHub.init());
