import express from 'express';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 1616;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://release.hpsbassline.club';
const SHARE_BASE_URL = process.env.SHARE_BASE_URL || 'https://rls.hpsbassline.club';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const DATA_DIR = path.join(__dirname, process.env.DATA_DIR || 'data');
const UPLOADS_DIR = path.join(__dirname, 'src', 'uploads');
const DATA_FILE = path.join(DATA_DIR, 'releases.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ---------- HTML escape ----------
const HTML_ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPE_MAP[c]);
}
function escapeAttr(value) {
  return escapeHtml(value);
}

// ---------- Slug validation ----------
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,127})$/;
function isValidSlug(slug) {
  if (typeof slug !== 'string') return false;
  const s = slug.toLowerCase();
  if (!SLUG_RE.test(s)) return false;
  if (s.includes('..')) return false;
  const reserved = new Set(['api', 'admin', 'uploads', 'index.html', 'og', 'favicon.ico', 'css', 'js', 'icons', 'data']);
  return !reserved.has(s);
}

// ---------- Release schema validation ----------
function sanitizeRelease(r) {
  if (!r || typeof r !== 'object') return null;
  const title = typeof r.title === 'string' ? r.title.trim().slice(0, 200) : '';
  const artist = typeof r.artist === 'string' ? r.artist.trim().slice(0, 200) : '';
  const slugSource = (typeof r.slug === 'string' && r.slug.trim()) ? r.slug.trim() : title;
  if (!title || !artist) return null;
  return {
    id: typeof r.id === 'string' ? r.id : (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
    title,
    artist,
    slug: slugSource.toLowerCase(),
    description: typeof r.description === 'string' ? r.description.slice(0, 2000) : '',
    year: Number.isFinite(+r.year) ? +r.year : new Date().getFullYear(),
    cover: typeof r.cover === 'string' ? r.cover.slice(0, 500) : '',
    merch: typeof r.merch === 'string' ? r.merch.slice(0, 500) : '',
    services: Array.isArray(r.services)
      ? r.services
          .filter((s) => s && typeof s === 'object' && typeof s.type === 'string' && typeof s.url === 'string')
          .map((s) => ({ type: s.type.slice(0, 50), url: s.url.slice(0, 500) }))
      : [],
    tracks: Array.isArray(r.tracks)
      ? r.tracks
          .filter((t) => t && typeof t === 'object' && typeof t.title === 'string' && t.title.trim())
          .map((t) => ({
            title: String(t.title).trim().slice(0, 200),
            duration: typeof t.duration === 'string' ? t.duration.slice(0, 16) : '',
            url: typeof t.url === 'string' ? t.url.slice(0, 500) : '',
          }))
      : [],
    genre: Array.isArray(r.genre)
      ? r.genre.map((g) => String(g).trim().slice(0, 60)).filter(Boolean).slice(0, 8)
      : (typeof r.genre === 'string' && r.genre.trim()
          ? r.genre.split(',').map((g) => g.trim().slice(0, 60)).filter(Boolean).slice(0, 8)
          : []),
    views: Number.isFinite(+r.views) ? +r.views : 0,
    order: Number.isFinite(+r.order) ? +r.order : 0,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString(),
    status: ['draft', 'scheduled', 'published'].includes(r.status) ? r.status : 'published',
  };
}

// ---------- Atomic data file ----------
let writeLock = Promise.resolve();
async function readReleasesSafe() {
  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(raw || '[]');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    console.error('Error reading releases:', e);
    return [];
  }
}
async function writeReleasesAtomic(releases) {
  const previous = writeLock;
  let releaseNext;
  writeLock = new Promise((res) => { releaseNext = res; });
  try {
    await previous;
    const tmp = DATA_FILE + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(releases, null, 2));
    await fsp.rename(tmp, DATA_FILE);
  } finally {
    releaseNext();
  }
}

// ---------- Sessions (signed cookie) ----------
const sessions = new Map(); // token -> { createdAt }
const SESSION_COOKIE = 'release_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function signToken(token) {
  const mac = crypto.createHmac('sha256', SESSION_SECRET).update(token).digest('hex');
  return `${token}.${mac}`;
}
function verifyToken(signed) {
  if (!signed || typeof signed !== 'string') return null;
  const dot = signed.lastIndexOf('.');
  if (dot < 0) return null;
  const token = signed.slice(0, dot);
  const mac = signed.slice(dot + 1);
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(token).digest('hex');
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return token;
}
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = decodeURIComponent(part.slice(idx + 1).trim());
    if (k) out[k] = v;
  }
  return out;
}
function isAuthed(req) {
  const cookies = parseCookies(req.headers.cookie);
  const signed = cookies[SESSION_COOKIE];
  if (!signed) return false;
  const token = verifyToken(signed);
  if (!token) return false;
  const s = sessions.get(token);
  if (!s) return false;
  if (Date.now() - s.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return false;
  }
  return true;
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`);
}
function setSessionCookie(res, token) {
  const signed = signToken(token);
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(signed)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict`);
}

// ---------- Multer (uploads) ----------
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXT_BY_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) return cb(new Error('Only JPEG/PNG/WEBP/GIF images are allowed'));
    cb(null, true);
  },
});

// ---------- Middleware ----------
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://release.hpsbassline.club,https://rls.hpsbassline.club,https://dev.hpsbassline.club,https://hpsbassline.club')
  .split(',').map((s) => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
}));
app.options('*', cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  maxAge: 86400,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'src'), { index: false }));
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=604800'),
}));

// ---------- Helpers ----------
function requireAdmin(req, res, next) {
  if (isAuthed(req)) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

async function deleteUploadFile(coverPath) {
  if (!coverPath || typeof coverPath !== 'string') return;
  if (!coverPath.startsWith('/uploads/')) return;
  const filename = path.basename(coverPath);
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) return;
  const filePath = path.join(UPLOADS_DIR, filename);
  try { await fsp.unlink(filePath); } catch (e) { if (e.code !== 'ENOENT') console.warn('unlink failed:', e.message); }
}

function getReleaseBySlug(releases, slug) {
  if (!slug) return null;
  const target = String(slug).toLowerCase();
  return releases.find((r) => r && r.slug && r.slug.toLowerCase() === target) || null;
}

// ---------- SSR ----------
function toAbsoluteUrl(value) {
  if (!value || typeof value !== 'string') return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${PUBLIC_BASE_URL}${value}`;
  return value;
}

function renderAlbumPage(album, res) {
  const shareUrl = `${SHARE_BASE_URL}/${album.slug}`;
  const coverUrl = toAbsoluteUrl(album.cover);
  const og = `
    <meta property="og:type" content="music.album">
    <meta property="og:site_name" content="Release - Haapsaly Bassline">
    <meta property="og:title" content="${escapeAttr(album.title)} - ${escapeAttr(album.artist)}">
    <meta property="og:description" content="${escapeAttr(album.description || 'Listen to this release on Haapsaly Bassline')}">
    <meta property="og:image" content="${escapeAttr(coverUrl)}">
    <meta property="og:image:secure_url" content="${escapeAttr(coverUrl)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeAttr(album.title)} cover">
    <meta property="og:url" content="${escapeAttr(shareUrl)}">
    ${(album.genre || []).slice(0, 3).map((g) => `<meta property="music:genre" content="${escapeAttr(g)}">`).join('\n    ')}

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@hpsbassline">
    <meta name="twitter:creator" content="@hpsbassline">
    <meta name="twitter:title" content="${escapeAttr(album.title)} - ${escapeAttr(album.artist)}">
    <meta name="twitter:description" content="${escapeAttr(album.description || 'Listen to this release')}">
    <meta name="twitter:image" content="${escapeAttr(coverUrl)}">
    <meta name="twitter:image:src" content="${escapeAttr(coverUrl)}">
    <meta name="twitter:image:alt" content="${escapeAttr(album.title)} cover">
    <meta name="twitter:player" content="${escapeAttr(SHARE_BASE_URL)}/embed/${escapeAttr(album.slug)}">
    <meta name="twitter:player:width" content="435">
    <meta name="twitter:player:height" content="251">
  `;
  const schemaLd = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MusicAlbum",
  "name": ${JSON.stringify(album.title)},
  "byArtist": { "@type": "MusicGroup", "name": ${JSON.stringify(album.artist)} },
  "image": ${JSON.stringify(album.cover)},
  "description": ${JSON.stringify(album.description || '')},
  "datePublished": ${JSON.stringify(String(album.year || new Date().getFullYear()))},
  "genre": ${JSON.stringify(album.genre || [])}
}
</script>`;

  try {
    let html = fs.readFileSync(path.join(__dirname, 'src', 'index.html'), 'utf8');
    html = html.replace(
      /<!-- Open Graph[\s\S]*?-->/g,
      `<!-- Open Graph / Social Sharing -->\n${og}`
    );
    const preloadScript = `<script>window.__PRELOADED_ALBUM__ = ${JSON.stringify(album).replace(/</g, '\\u003c')};</script>`;
    html = html.replace('</head>', `${schemaLd}\n${preloadScript}</head>`);
    res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
    res.send(html);
  } catch (error) {
    console.error('Error rendering album page:', error);
    res.status(500).sendFile(path.join(__dirname, 'src', 'index.html'));
  }
}

// ---------- Public API ----------
function isPubliclyVisible(release, isAdmin) {
  if (!release) return false;
  if (isAdmin) return true;
  return release.status !== 'draft';
}

app.get('/api/releases', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const releases = await readReleasesSafe();
    const isAdmin = isAuthed(req);
    res.json(releases.filter((r) => isPubliclyVisible(r, isAdmin)));
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

app.post('/api/releases/:id/view', async (req, res) => {
  const id = String(req.params.id || '');
  if (!id) return res.status(400).json({ error: 'id required' });
  try {
    const releases = await readReleasesSafe();
    const idx = releases.findIndex((r) => r && r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    releases[idx].views = (releases[idx].views || 0) + 1;
    await writeReleasesAtomic(releases);
    res.json({ success: true, views: releases[idx].views });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'increment error' });
  }
});

app.get('/api/config', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    appName: 'Release - Haapsaly Bassline',
    adminPasswordRequired: !!ADMIN_PASSWORD,
  });
});

app.get('/api/settings', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const raw = await fsp.readFile(path.join(DATA_DIR, 'settings.json'), 'utf8').catch(() => '');
    res.json(raw ? JSON.parse(raw) : {});
  } catch (e) { res.json({}); }
});
app.post('/api/settings', requireAdmin, async (req, res) => {
  try {
    const file = path.join(DATA_DIR, 'settings.json');
    const tmp = file + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(req.body || {}, null, 2));
    await fsp.rename(tmp, file);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Save error' }); }
});

app.get('/api/footer', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const raw = await fsp.readFile(path.join(DATA_DIR, 'footer.json'), 'utf8').catch(() => '');
    res.json(raw ? JSON.parse(raw) : {});
  } catch (e) { res.json({}); }
});
app.post('/api/footer', requireAdmin, async (req, res) => {
  try {
    const file = path.join(DATA_DIR, 'footer.json');
    const tmp = file + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(req.body || {}, null, 2));
    await fsp.rename(tmp, file);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Save error' }); }
});

app.post('/api/upload', requireAdmin, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload error' });
    if (!req.file) return res.status(400).json({ error: 'File not uploaded' });
    res.json({ success: true, url: `/uploads/${req.file.filename}` });
  });
});

// ---------- Admin write API ----------
app.put('/api/releases', requireAdmin, async (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Data must be an array' });
  const sanitized = [];
  const seenSlugs = new Set();
  for (const raw of req.body) {
    const r = sanitizeRelease(raw);
    if (!r) continue;
    if (!isValidSlug(r.slug)) return res.status(400).json({ error: `Invalid slug: ${r.slug}` });
    if (seenSlugs.has(r.slug)) return res.status(400).json({ error: `Duplicate slug: ${r.slug}` });
    seenSlugs.add(r.slug);
    sanitized.push(r);
  }
  try {
    await writeReleasesAtomic(sanitized);
    res.json({ success: true, count: sanitized.length });
  } catch (e) {
    res.status(500).json({ error: 'Save error' });
  }
});

app.delete('/api/releases/:id', requireAdmin, async (req, res) => {
  const id = String(req.params.id || '');
  if (!id) return res.status(400).json({ error: 'id required' });
  try {
    const releases = await readReleasesSafe();
    const target = releases.find((r) => r && r.id === id);
    if (!target) return res.status(404).json({ error: 'not found' });
    const next = releases.filter((r) => r.id !== id);
    await writeReleasesAtomic(next);
    await deleteUploadFile(target.cover);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete error' });
  }
});

// ---------- Auth ----------
app.post('/api/login', (req, res) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'Admin not configured' });
  const { password } = req.body || {};
  if (typeof password !== 'string') return res.status(400).json({ error: 'password required' });
  const ok = password.length === ADMIN_PASSWORD.length && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD));
  if (!ok) return res.status(401).json({ error: 'Invalid password' });
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { createdAt: Date.now() });
  setSessionCookie(res, token);
  res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = verifyToken(cookies[SESSION_COOKIE] || '');
  if (token) sessions.delete(token);
  clearSessionCookie(res);
  res.json({ success: true });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: isAuthed(req) });
});

// ---------- SPA / SSR ----------
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/:slug', async (req, res, next) => {
  const slug = req.params.slug;
  if (slug.includes('.')) return next();
  if (req.path.endsWith('/')) return res.redirect(301, `/${slug}`);
  const releases = await readReleasesSafe();
  const isAdmin = isAuthed(req);
  const album = getReleaseBySlug(releases, slug);
  if (album && isPubliclyVisible(album, isAdmin)) return renderAlbumPage(album, res);
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Release running on http://localhost:${PORT}`);
  console.log(`Public URL: ${PUBLIC_BASE_URL}`);
});
