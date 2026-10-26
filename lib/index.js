import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CSS_PATH = 'C:\\Users\\27071\\Documents\\deepseek-harness\\default-workspace\\deep-line-theme\\theme.css';

// 关键：先声明依赖，apply 里才能安全访问 ctx.webServer
export const inject = ['webServer'];

export function apply(ctx) {
  const mark = (n, t) => { try { fs.writeFileSync(path.join(os.tmpdir(), n), String(t)); } catch {} };
  mark('deep-line-theme-loaded.txt', new Date().toISOString());

  try {
    ctx.effect(() => ctx.webServer.tapIndex((html) => {
      if (html.indexOf('id="deep-line-style"') >= 0) return html;
      let css = '';
      try { css = fs.readFileSync(CSS_PATH, 'utf8'); } catch (e) { mark('deep-line-theme-error.txt', 'read css: ' + (e && e.message)); return html; }
      if (!css) return html;
      return html.replace('</head>', '<style id="deep-line-style">' + css + '</style></head>');
    }));
    mark('deep-line-theme-injected.txt', 'tapIndex registered ok');
  } catch (e) {
    mark('deep-line-theme-error.txt', e && e.stack || e);
  }
}
