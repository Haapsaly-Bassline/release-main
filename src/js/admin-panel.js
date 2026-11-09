// ===== Utilities =====
const Esc = {
    html(v) {
        if (v === null || v === undefined) return '';
        return String(v)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    attr(v) { return Esc.html(v); },
    url(v) {
        const s = String(v || '').trim();
        if (!s) return '';
        if (/^(https?:|mailto:|tel:|\/)/i.test(s)) return s;
        return '';
    },
};

const ALLOWED_GENRE_RE = /^[\p{L}0-9 \-/&',.!()]+$/u;
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,127})$/;
const DURATION_RE = /^\d{1,2}:\d{1,2}$/;

const SERVICE_OPTIONS = [
    ['spotify', 'Spotify'],
    ['apple', 'Apple Music'],
    ['yandex', 'Яндекс.Музыка'],
    ['soundcloud', 'SoundCloud'],
    ['bandcamp', 'Bandcamp'],
    ['youtube-music', 'YouTube Music'],
    ['youtube', 'YouTube'],
    ['tidal', 'Tidal'],
    ['deezer', 'Deezer'],
    ['audiomack', 'AudioMack'],
    ['discogs', 'Discogs'],
    ['custom', 'Другое'],
];

const AdminPanel = {
    currentEditingId: null,
    currentCoverUrl: null,
    slugManuallyEdited: false,
    releases: [],

    async init() {
        const ok = await this.requireAuth();
        if (!ok) return;
        this.bindUI();
        this.bindLoginModal();
        await this.loadReleases();
    },

    async requireAuth() {
        try {
            const status = await fetch('/api/auth/status', { credentials: 'include' }).then((r) => r.json());
            if (status.authenticated) return true;
        } catch (e) { /* ignore */ }

        const cfg = await fetch('/api/config').then((r) => r.json()).catch(() => ({}));
        if (!cfg.adminPasswordRequired) {
            this.showNotification('ADMIN_PASSWORD не задан в .env на сервере', 'error');
            return false;
        }

        const password = await this.promptPassword();
        if (!password) { window.location.href = '/'; return false; }
        try {
            const res = await fetch('/api/login', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) {
                this.showNotification('Неверный пароль', 'error');
                setTimeout(() => { window.location.href = '/'; }, 2500);
                return false;
            }
            return true;
        } catch (e) {
            this.showNotification('Ошибка сети', 'error');
            return false;
        }
    },

    promptPassword() {
        return new Promise((resolve) => {
            const modal = document.getElementById('loginModal');
            const form = document.getElementById('loginFormModal');
            const input = document.getElementById('loginPassword');
            const cancel = document.getElementById('loginCancelBtn');
            if (!modal || !form || !input) return resolve(null);

            modal.classList.remove('hidden');
            input.value = '';
            setTimeout(() => input.focus(), 50);

            const onSubmit = (e) => {
                e.preventDefault();
                cleanup();
                resolve(input.value);
            };
            const onCancel = () => { cleanup(); resolve(null); };
            const onKey = (e) => { if (e.key === 'Escape') { cleanup(); resolve(null); } };
            const onBackdrop = (e) => { if (e.target === modal) { cleanup(); resolve(null); } };
            const cleanup = () => {
                modal.classList.add('hidden');
                form.removeEventListener('submit', onSubmit);
                cancel.removeEventListener('click', onCancel);
                document.removeEventListener('keydown', onKey);
                modal.removeEventListener('click', onBackdrop);
            };

            form.addEventListener('submit', onSubmit);
            cancel.addEventListener('click', onCancel);
            document.addEventListener('keydown', onKey);
            modal.addEventListener('click', onBackdrop);
        });
    },

    bindLoginModal() { /* hookup happens inside promptPassword */ },

    bindUI() {
        const $ = (id) => document.getElementById(id);
        $('viewHomeBtn').addEventListener('click', () => window.open('/', '_blank'));
        $('logoutBtn').addEventListener('click', () => this.logout());
        $('resetFormBtn').addEventListener('click', () => this.resetForm());
        $('addServiceBtn').addEventListener('click', () => this.addService());
        $('addTrackBtn').addEventListener('click', () => this.addTrack());
        $('cover').addEventListener('change', (e) => this.handleCoverUpload(e));
        $('releaseForm').addEventListener('submit', (e) => { e.preventDefault(); this.saveRelease(); });
        $('title').addEventListener('input', (e) => {
            if (!this.slugManuallyEdited) {
                $('slug').value = this.generateSlug(e.target.value);
            }
        });
        $('slug').addEventListener('input', () => { this.slugManuallyEdited = true; });

        $('slug').addEventListener('blur', () => {
            const v = $('slug').value.trim().toLowerCase();
            $('slug').value = v;
        });

        $('genre').addEventListener('blur', () => {
            const clean = $('genre').value.split(',').map((g) => g.trim().replace(/\s+/g, ' ')).filter(Boolean);
            $('genre').value = clean.join(', ');
        });
    },

    generateSlug(text) {
        const map = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' };
        return String(text || '').toLowerCase()
            .split('').map((c) => map[c] !== undefined ? map[c] : c).join('')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 128);
    },

    async handleCoverUpload(event) {
        const input = event.target;
        const file = input.files[0];
        if (!file) return;
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
            this.showNotification('Только JPEG/PNG/WEBP/GIF', 'error');
            input.value = '';
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('Файл больше 10 МБ', 'error');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('coverPreview');
            img.src = e.target.result;
            img.style.display = 'block';
            document.getElementById('coverPlaceholder').style.display = 'none';
        };
        reader.readAsDataURL(file);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'upload error');
            this.currentCoverUrl = data.url;
        } catch (e) {
            this.showNotification('Ошибка загрузки: ' + e.message, 'error');
            this.currentCoverUrl = null;
            const img = document.getElementById('coverPreview');
            img.src = '';
            img.style.display = 'none';
            document.getElementById('coverPlaceholder').style.display = 'flex';
        } finally {
            input.value = '';
        }
    },

    addService(service = { type: '', url: '' }) {
        const container = document.getElementById('servicesContainer');
        const div = document.createElement('div');
        div.className = 'service-item';
        const safeType = Esc.attr(service.type || '');
        const safeUrl = Esc.attr(service.url || '');
        div.innerHTML = `
            <select class="service-type" title="Выберите сервис">
                <option value="">Выберите сервис</option>
                ${SERVICE_OPTIONS.map(([v, n]) => `<option value="${Esc.attr(v)}" ${v === service.type ? 'selected' : ''}>${Esc.html(n)}</option>`).join('')}
            </select>
            <input type="url" class="service-url" placeholder="https://..." value="${safeUrl}" maxlength="500" title="Ссылка на сервис">
            <div class="item-actions">
                <button type="button" class="item-move" data-dir="-1" title="Вверх" aria-label="Переместить сервис вверх">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
                </button>
                <button type="button" class="item-move" data-dir="1" title="Вниз" aria-label="Переместить сервис вниз">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                </button>
            </div>
            <button type="button" class="item-remove" title="Удалить сервис" aria-label="Удалить сервис">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        `;
        div.querySelector('.item-move[data-dir="-1"]').addEventListener('click', () => this.moveItem(div, -1, 'servicesContainer'));
        div.querySelector('.item-move[data-dir="1"]').addEventListener('click', () => this.moveItem(div, 1, 'servicesContainer'));
        div.querySelector('.item-remove').addEventListener('click', () => this.removeItem(div, 'servicesContainer', 'Должен быть хотя бы один сервис'));
        container.appendChild(div);
        this.updateMoveButtons('servicesContainer');
    },

    addTrack(track = { title: '', duration: '', url: '' }) {
        const container = document.getElementById('tracksContainer');
        const div = document.createElement('div');
        div.className = 'track-item';
        const safeTitle = Esc.attr(track.title || '');
        const safeDuration = Esc.attr(track.duration || '');
        const safeUrl = Esc.attr(track.url || '');
        div.innerHTML = `
            <div class="track-fields">
                <input type="text" class="track-title-input" placeholder="Название трека" value="${safeTitle}" maxlength="200" aria-label="Название трека">
                <input type="text" class="track-duration-input" placeholder="3:45" value="${safeDuration}" maxlength="16" pattern="^\\d{1,2}:\\d{1,2}$" title="Длительность в формате мм:сс" aria-label="Длительность">
                <input type="url" class="track-url-input" placeholder="https://..." value="${safeUrl}" maxlength="500" aria-label="Ссылка на трек">
            </div>
            <div class="item-actions">
                <button type="button" class="item-move" data-dir="-1" title="Вверх" aria-label="Переместить трек вверх">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
                </button>
                <button type="button" class="item-move" data-dir="1" title="Вниз" aria-label="Переместить трек вниз">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                </button>
            </div>
            <button type="button" class="item-remove" title="Удалить трек" aria-label="Удалить трек">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        `;
        div.querySelector('.item-move[data-dir="-1"]').addEventListener('click', () => this.moveItem(div, -1, 'tracksContainer'));
        div.querySelector('.item-move[data-dir="1"]').addEventListener('click', () => this.moveItem(div, 1, 'tracksContainer'));
        div.querySelector('.item-remove').addEventListener('click', () => this.removeItem(div, 'tracksContainer'));
        container.appendChild(div);
        this.updateMoveButtons('tracksContainer');
    },

    moveItem(item, direction, containerId) {
        const container = document.getElementById(containerId);
        const items = Array.from(container.children);
        const index = items.indexOf(item);
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= items.length) return;
        if (direction === -1) container.insertBefore(item, items[newIndex]);
        else if (newIndex + 1 < items.length) container.insertBefore(item, items[newIndex + 1]);
        else container.appendChild(item);
        this.updateMoveButtons(containerId);
    },

    removeItem(item, containerId, errorMessage) {
        const container = document.getElementById(containerId);
        if (errorMessage && container.children.length <= 1) {
            this.showNotification(errorMessage, 'error');
            return;
        }
        item.remove();
        this.updateMoveButtons(containerId);
    },

    updateMoveButtons(containerId) {
        const items = Array.from(document.getElementById(containerId).children);
        items.forEach((item, index) => {
            const up = item.querySelector('.item-move[data-dir="-1"]');
            const down = item.querySelector('.item-move[data-dir="1"]');
            if (up) up.disabled = index === 0;
            if (down) down.disabled = index === items.length - 1;
        });
    },

    collectServices() {
        const services = [];
        const seen = new Set();
        for (const item of document.querySelectorAll('#servicesContainer .service-item')) {
            const type = item.querySelector('.service-type').value;
            const url = Esc.url(item.querySelector('.service-url').value);
            if (!type || !url) continue;
            if (seen.has(type)) {
                this.showNotification(`Сервис "${type}" уже добавлен`, 'error');
                continue;
            }
            seen.add(type);
            services.push({ type, url });
        }
        return services;
    },

    collectTracks() {
        const tracks = [];
        for (const item of document.querySelectorAll('#tracksContainer .track-item')) {
            const title = item.querySelector('.track-title-input').value.trim();
            const duration = item.querySelector('.track-duration-input').value.trim();
            const url = Esc.url(item.querySelector('.track-url-input').value);
            if (!title) continue;
            if (duration && !DURATION_RE.test(duration)) {
                this.showNotification(`Некорректная длительность: "${duration}" (формат мм:сс)`, 'error');
                return null;
            }
            tracks.push({ title: title.slice(0, 200), duration: duration.slice(0, 16), url });
        }
        return tracks;
    },

    collectGenre() {
        const raw = document.getElementById('genre').value;
        const items = raw.split(',').map((g) => g.trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 8);
        for (const g of items) {
            if (g.length > 60 || !ALLOWED_GENRE_RE.test(g)) {
                this.showNotification(`Некорректный жанр: "${g}"`, 'error');
                return null;
            }
        }
        return items;
    },

    async loadReleases() {
        try {
            const res = await fetch('/api/releases', { credentials: 'include' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            this.releases = await res.json();
        } catch (e) {
            this.releases = [];
            this.showNotification('Не удалось загрузить релизы: ' + e.message, 'error');
        }
        if (!Array.isArray(this.releases)) this.releases = [];
        this.renderReleasesList(this.releases);
    },

    renderReleasesList(releases) {
        const container = document.getElementById('releasesList');
        if (!releases || releases.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Релизов пока нет</p>';
            return;
        }
        const sorted = releases.slice().sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined && a.order !== b.order) return a.order - b.order;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        this.releases = sorted;

        container.innerHTML = sorted.map((release, index) => {
            const status = release.status || 'published';
            const statusClass = status;
            const statusLabel = status === 'published' ? 'опубликован' : status === 'draft' ? 'черновик' : 'запланирован';
            return `
            <div class="release-item" data-id="${Esc.attr(release.id)}" draggable="true">
                <div class="release-drag" title="Перетащите" aria-label="Перетащите для изменения порядка" role="button" tabindex="0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </div>
                <img src="${Esc.attr(release.cover || '')}" alt="" class="release-cover" loading="lazy" onerror="this.style.visibility='hidden'">
                <div class="release-info">
                    <div class="release-title">${Esc.html(release.title)}</div>
                    <div class="release-artist">${Esc.html(release.artist)}</div>
                    <div class="release-meta">
                        <span class="status-pill ${statusClass}">${statusLabel}</span>
                        <span>👁 ${release.views || 0}</span>
                        <span>🔗 ${(release.services || []).length}</span>
                        <span>🎵 ${(release.tracks || []).length}</span>
                        ${(release.genre || []).length ? `<span>♪ ${(release.genre || []).join(', ')}</span>` : ''}
                        <span style="color: var(--primary);">#${index + 1}</span>
                    </div>
                </div>
                <div class="release-actions">
                    <button class="btn btn-secondary btn-icon" data-act="up" ${index === 0 ? 'disabled' : ''} title="Вверх" aria-label="Переместить вверх">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
                    </button>
                    <button class="btn btn-secondary btn-icon" data-act="down" ${index === sorted.length - 1 ? 'disabled' : ''} title="Вниз" aria-label="Переместить вниз">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                    </button>
                    <button class="btn btn-secondary btn-icon" data-act="edit" title="Редактировать" aria-label="Редактировать">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    <button class="btn btn-danger btn-icon" data-act="delete" title="Удалить" aria-label="Удалить">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>
            </div>`;
        }).join('');

        container.querySelectorAll('.release-item').forEach((el) => {
            const id = el.dataset.id;
            el.querySelector('[data-act="up"]').addEventListener('click', () => this.moveRelease(id, -1));
            el.querySelector('[data-act="down"]').addEventListener('click', () => this.moveRelease(id, 1));
            el.querySelector('[data-act="edit"]').addEventListener('click', () => this.editRelease(id));
            el.querySelector('[data-act="delete"]').addEventListener('click', () => this.deleteRelease(id));
        });
        this.setupDragAndDrop();
    },

    async saveRelease() {
        const $ = (id) => document.getElementById(id);
        const title = $('title').value.trim();
        const artist = $('artist').value.trim();
        let slug = $('slug').value.trim().toLowerCase() || this.generateSlug(title);

        if (!title) return this.showNotification('Заполните название альбома', 'error');
        if (!artist) return this.showNotification('Заполните исполнителя', 'error');
        if (!slug) return this.showNotification('Slug пустой (введите название латиницей или задайте вручную)', 'error');
        if (!SLUG_RE.test(slug)) return this.showNotification('Некорректный slug (только a-z, 0-9, дефис)', 'error');
        if (!this.currentCoverUrl) return this.showNotification('Загрузите обложку', 'error');

        const merch = Esc.url($('merch').value);
        if ($('merch').value && !merch) return this.showNotification('Некорректная ссылка на мерч (только http/https/mailto)', 'error');

        const genre = this.collectGenre();
        if (genre === null) return;

        const services = this.collectServices();
        const tracks = this.collectTracks();
        if (tracks === null) return;

        const existing = this.currentEditingId ? this.releases.find((r) => r.id === this.currentEditingId) : null;
        const dupSlug = this.releases.find((r) => r.slug === slug && r.id !== this.currentEditingId);
        if (dupSlug) return this.showNotification(`Slug "${slug}" уже используется`, 'error');

        const release = {
            id: this.currentEditingId || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
            title: title.slice(0, 200),
            artist: artist.slice(0, 200),
            slug,
            description: $('description').value.trim().slice(0, 2000),
            year: parseInt($('year').value, 10) || new Date().getFullYear(),
            genre,
            merch,
            cover: this.currentCoverUrl,
            services,
            tracks,
            status: existing ? (existing.status || 'published') : 'published',
            createdAt: existing ? existing.createdAt : new Date().toISOString(),
            views: existing ? (existing.views || 0) : 0,
            order: existing ? existing.order : this.releases.length,
        };

        const next = this.currentEditingId
            ? this.releases.map((r) => r.id === this.currentEditingId ? release : r)
            : [...this.releases, release];

        try {
            const res = await fetch('/api/releases', {
                method: 'PUT', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(next),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Save error');
        } catch (e) {
            this.showNotification('Ошибка сохранения: ' + e.message, 'error');
            return;
        }

        this.showNotification(this.currentEditingId ? 'Релиз обновлен' : 'Релиз создан');
        this.resetForm();
        await this.loadReleases();
    },

    async deleteRelease(id) {
        if (!confirm('Удалить этот релиз? Файл обложки тоже будет удалён.')) return;
        try {
            const res = await fetch(`/api/releases/${encodeURIComponent(id)}`, {
                method: 'DELETE', credentials: 'include',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Delete error');
            this.showNotification('Релиз удален');
        } catch (e) {
            this.showNotification('Ошибка удаления: ' + e.message, 'error');
            return;
        }
        if (this.currentEditingId === id) this.resetForm();
        await this.loadReleases();
    },

    async moveRelease(id, direction) {
        const sorted = this.releases.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const index = sorted.findIndex((r) => r.id === id);
        if (index === -1) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= sorted.length) return;
        [sorted[index], sorted[newIndex]] = [sorted[newIndex], sorted[index]];
        sorted.forEach((r, i) => { r.order = i; });
        try {
            const res = await fetch('/api/releases', {
                method: 'PUT', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sorted),
            });
            if (!res.ok) throw new Error('save error');
        } catch (e) {
            this.showNotification('Не удалось сохранить порядок', 'error');
            return;
        }
        this.releases = sorted;
        this.renderReleasesList(sorted);
    },

    async editRelease(id) {
        const release = this.releases.find((r) => r.id === id);
        if (!release) return;
        this.currentEditingId = id;
        this.slugManuallyEdited = true;
        const $ = (k) => document.getElementById(k);
        $('formTitle').textContent = 'Редактировать релиз';
        $('title').value = release.title || '';
        $('artist').value = release.artist || '';
        $('slug').value = release.slug || '';
        $('description').value = release.description || '';
        $('year').value = release.year || new Date().getFullYear();
        $('merch').value = release.merch || '';
        $('genre').value = Array.isArray(release.genre) ? release.genre.join(', ') : (release.genre || '');

        if (release.cover) {
            const img = $('coverPreview');
            img.src = release.cover;
            img.style.display = 'block';
            $('coverPlaceholder').style.display = 'none';
            this.currentCoverUrl = release.cover;
        }

        const servicesContainer = $('servicesContainer');
        servicesContainer.innerHTML = '';
        if (Array.isArray(release.services) && release.services.length) {
            release.services.forEach((s) => this.addService(s));
        } else {
            this.addService();
        }

        const tracksContainer = $('tracksContainer');
        tracksContainer.innerHTML = '';
        if (Array.isArray(release.tracks) && release.tracks.length) {
            release.tracks.forEach((t) => this.addTrack(t));
        }

        $('releaseForm').scrollIntoView({ behavior: 'smooth' });
    },

    setupDragAndDrop() {
        const container = document.getElementById('releasesList');
        const items = Array.from(container.querySelectorAll('.release-item'));
        let draggedId = null;

        const cleanup = () => {
            items.forEach((i) => i.classList.remove('dragging', 'drag-over'));
        };

        items.forEach((item) => {
            item.addEventListener('dragstart', (e) => {
                draggedId = item.dataset.id;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            item.addEventListener('dragend', () => { draggedId = null; cleanup(); });
            item.addEventListener('dragover', (e) => {
                if (item.dataset.id !== draggedId) {
                    e.preventDefault();
                    item.classList.add('drag-over');
                }
            });
            item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                if (!draggedId || item.dataset.id === draggedId) return;
                const dragged = container.querySelector(`[data-id="${CSS.escape(draggedId)}"]`);
                if (!dragged) return;
                const rect = item.getBoundingClientRect();
                const after = (e.clientY - rect.top) > rect.height / 2;
                if (after) item.parentNode.insertBefore(dragged, item.nextSibling);
                else item.parentNode.insertBefore(dragged, item);
                await this.persistOrderFromDOM();
            });
        });
    },

    async persistOrderFromDOM() {
        const items = Array.from(document.querySelectorAll('#releasesList .release-item'));
        const sorted = items.map((el) => this.releases.find((r) => r.id === el.dataset.id)).filter(Boolean);
        sorted.forEach((r, i) => { r.order = i; });
        try {
            const res = await fetch('/api/releases', {
                method: 'PUT', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sorted),
            });
            if (!res.ok) throw new Error('save error');
            this.releases = sorted;
            this.showNotification('Порядок обновлен');
        } catch (e) {
            this.showNotification('Ошибка сохранения порядка', 'error');
        }
    },

    resetForm() {
        this.currentEditingId = null;
        this.currentCoverUrl = null;
        this.slugManuallyEdited = false;
        const $ = (id) => document.getElementById(id);
        $('formTitle').textContent = 'Создать новый релиз';
        $('releaseForm').reset();
        const img = $('coverPreview');
        img.src = ''; img.style.display = 'none';
        $('coverPlaceholder').style.display = 'flex';
        $('year').value = new Date().getFullYear();
        $('genre').value = '';
        $('servicesContainer').innerHTML = '';
        this.addService();
        $('tracksContainer').innerHTML = '';
    },

    async logout() {
        try { await fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch (e) { /* ignore */ }
        window.location.href = '/';
    },

    showNotification(message, type = 'success') {
        const n = document.createElement('div');
        n.className = `notification ${type === 'error' ? 'error' : ''}`;
        n.setAttribute('role', type === 'error' ? 'alert' : 'status');
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000);
    },
};

document.addEventListener('DOMContentLoaded', () => AdminPanel.init());
