// Host half: persists uploaded backgrounds to disk and serves them over /dlh-bg/*
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DATA_DIR = path.join(os.homedir(), '.dsh', 'deep-line-theme');
const IMG_DIR = path.join(DATA_DIR, 'backgrounds');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');
const MAX_ITEMS = 30;

function ensureDirs() {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

function readIndex() {
  try {
    const raw = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeIndex(list) {
  ensureDirs();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(list, null, 2));
}

function sendJSON(res, code, obj) {
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(obj));
}

async function readBody(req, limit = 30 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('payload too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function decodeDataUrl(dataUrl) {
  const m = /^data:image\/([a-z0-9+.-]+);base64,(.+)$/i.exec(String(dataUrl || ''));
  if (!m) return null;
  const kind = m[1].toLowerCase();
  const ext = kind === 'webp' ? 'webp' : kind === 'jpeg' ? 'jpg' : kind === 'png' ? 'png' : null;
  if (!ext) return null;
  return { ext, buf: Buffer.from(m[2], 'base64') };
}

function mimeFor(ext) {
  return ext === 'webp' ? 'image/webp' : ext === 'jpg' ? 'image/jpeg' : 'image/png';
}

function removeItem(id) {
  const list = readIndex();
  const it = list.find((x) => x.id === id);
  if (it) {
    for (const variant of ['raw', 'line']) {
      const ext = it[variant + 'Ext'];
      if (ext) {
        try { fs.unlinkSync(path.join(IMG_DIR, `${id}.${variant}.${ext}`)); } catch {}
      }
    }
  }
  writeIndex(list.filter((x) => x.id !== id));
}

export const inject = ['webServer'];

export function apply(ctx) {
  ctx.effect(() => {
    ensureDirs();
    const dispose = ctx.webServer.register({
      kind: 'prefix',
      path: '/dlh-bg',
      handler: async (req, res) => {
        const url = new URL(req.url || '/', 'http://127.0.0.1');
        const parts = url.pathname.split('/').filter(Boolean); // ['dlh-bg', ...]
        const action = parts[1] || '';
        try {
          if (req.method === 'GET' && action === 'list') {
            return sendJSON(res, 200, { items: readIndex() });
          }

          if (req.method === 'POST' && action === 'save') {
            const payload = JSON.parse((await readBody(req)).toString('utf8'));
            const raw = decodeDataUrl(payload.raw);
            const line = decodeDataUrl(payload.line);
            if (!raw && !line) return sendJSON(res, 400, { error: 'need raw or line dataUrl' });
            const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            ensureDirs();
            const item = { id, createdAt: new Date().toISOString() };
            if (raw) {
              fs.writeFileSync(path.join(IMG_DIR, `${id}.raw.${raw.ext}`), raw.buf);
              item.rawExt = raw.ext;
              item.rawSize = raw.buf.length;
            }
            if (line) {
              fs.writeFileSync(path.join(IMG_DIR, `${id}.line.${line.ext}`), line.buf);
              item.lineExt = line.ext;
              item.lineSize = line.buf.length;
            }
            const list = [item, ...readIndex()];
            for (const stale of list.slice(MAX_ITEMS)) removeItem(stale.id);
            writeIndex(list.slice(0, MAX_ITEMS));
            return sendJSON(res, 200, { item, items: list.slice(0, MAX_ITEMS) });
          }

          if (req.method === 'DELETE' && action && action !== 'list' && action !== 'save') {
            removeItem(action);
            return sendJSON(res, 200, { ok: true, items: readIndex() });
          }

          // GET /dlh-bg/<id>/<raw|line>
          if (req.method === 'GET' && parts.length >= 3) {
            const id = parts[1];
            const variant = parts[2] === 'raw' ? 'raw' : 'line';
            const it = readIndex().find((x) => x.id === id);
            if (!it) return sendJSON(res, 404, { error: 'not found' });
            const ext = it[variant + 'Ext'];
            if (!ext) return sendJSON(res, 404, { error: 'variant missing' });
            const file = path.join(IMG_DIR, `${id}.${variant}.${ext}`);
            if (!fs.existsSync(file)) return sendJSON(res, 404, { error: 'file missing' });
            res.writeHead(200, {
              'content-type': mimeFor(ext),
              'cache-control': 'public, max-age=31536000, immutable',
            });
            return fs.createReadStream(file).pipe(res);
          }

          return sendJSON(res, 404, { error: 'unknown route' });
        } catch (e) {
          return sendJSON(res, 500, { error: String((e && e.message) || e) });
        }
      },
    });
    return () => dispose();
  });
}
